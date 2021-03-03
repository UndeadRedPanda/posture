import { bold, BufReader, BufWriter, concat, gray, yellow } from "../deps.ts";

import { log, UTF8Transcoder } from "../utils/mod.ts";
import { Configuration } from "../configuration/mod.ts";
import { MessagesDatabase } from "../database/mod.ts";

import * as CONST from "./constants.ts";
import { Command, CommandHandler, CommandMessage } from "./command.ts";
import { Queue } from "./queue.ts";

enum ConnectionQueueMessageTypes {
  Remove,
  Save,
}

type ConnectionQueueRemoveMessage = {
  connection: Connection;
  reason: string;
};

type ConnectionQueueSaveMessage = {
  message: CommandMessage;
};

type ConnectionQueueMessageData =
  | ConnectionQueueRemoveMessage
  | ConnectionQueueSaveMessage;

type ConnectionQueueMessage = {
  type: ConnectionQueueMessageTypes;
  data: ConnectionQueueMessageData;
};

export class ConnectionManager {
  private _connections: Connection[] = [];
  private _database: MessagesDatabase | undefined;

  constructor(private _ip: string) {}

  async addConnection(conn: Deno.Conn): Promise<Connection | undefined> {
    const connection = new Connection(
      conn,
      this._ip,
    );

    if (this._connections.length >= Configuration.maxConnections()) {
      const reason = "Connection limit exceeded";
      await connection.writeLine(reason);
      await this.removeConnection(connection, reason);
      return;
    }

    this.startConnection(connection);

    return connection;
  }

  initDatabase(db: MessagesDatabase) {
    this._database = db;
  }

  async startConnection(connection: Connection) {
    this._connections.push(connection);

    connection.startConnection();

    for await (const message of connection) {
      switch (message.type) {
        case ConnectionQueueMessageTypes.Remove: {
          const { connection: c, reason: r } = message
            .data as ConnectionQueueRemoveMessage;
          this.removeConnection(c, r);
          break;
        }
        case ConnectionQueueMessageTypes.Save: {
          const { message: m } = message
            .data as ConnectionQueueSaveMessage;
          this.saveMessage(m);
          break;
        }
      }
    }
  }

  async removeConnection(connection: Connection, reason: string) {
    const index = this._connections.indexOf(connection);
    if (index > -1) {
      this._connections.splice(index, 1);
    }
    try {
      await connection.close(reason);
    } catch (err) {
      // Do nothing somehow we couldn't close
    }
  }

  async saveMessage(message: CommandMessage) {
    if (this._database) {
      await this._database.saveMessage(message);
    }
  }
}

export class Connection extends Queue<ConnectionQueueMessage> {
  readonly commandHandler: CommandHandler = new CommandHandler();

  readonly connectedAt: Date = new Date();

  public requests: AsyncGenerator<string, string | void, void> = this
    ._readFromConnection();

  private _closed = false;
  get closed() {
    return this._closed;
  }

  private _dropped = false;

  get open(): boolean {
    return !this._closed && !this._dropped && !this._quitting;
  }

  private _quitting = false;
  get quitting() {
    return this._quitting;
  }

  private _reader: BufReader;

  private _started = false;

  private _writer: BufWriter;

  constructor(
    readonly conn: Deno.Conn,
    private _ip: string,
  ) {
    super();

    this._writer = new BufWriter(conn);
    this._reader = new BufReader(conn);

    if (Configuration.isDebug()) {
      this._log("New connection opened.");
    }
  }

  getIp(): string {
    return (this.conn.remoteAddr as Deno.NetAddr).hostname;
  }

  getRid(): number {
    return this.conn.rid;
  }

  startConnection() {
    this._welcome();
    this._handleData();
  }

  async writeLine(str: string): Promise<this> {
    str = `${str.trim()}\r\n`;
    await this.write(UTF8Transcoder.encode(str));

    return this;
  }

  async write(buffer: Uint8Array): Promise<this> {
    try {
      await this._writer.write(buffer);
      await this._writer.flush();
    } catch (err) {
      this._removeDroppedConnection();
    }

    return this;
  }

  close(reason = "Closed by client") {
    if (!this._closed) {
      this._closed = true;
      this.conn.close();

      if (Configuration.isDebug()) {
        this._log(`Connection was closed. ${gray(`(${reason})`)}`);
      }
    }
  }

  private async _handleData() {
    for await (const data of this.requests) {
      const { isReadyToSend, command, code, message } = this.commandHandler
        .parseCommand(data);

      // NOTE (William): In an actual SMTP server implementation, this
      // wouldn't be acceptable. However, since we don't really have the
      // same delivery requirements as an actual SMTP server, we can just
      // await the saving of the email to the database
      if (isReadyToSend) {
        const message = this.commandHandler.message;
        await this._saveEmailToDb(message);
        this.commandHandler.clear();
      }

      if (code && message) {
        await this.writeLine(`${code} ${message}`);
      }

      if (command === Command.QUIT) {
        this._quit();
      }
    }
  }

  private _log(message: string) {
    log.info(
      `${bold(yellow(`[IP: ${this.getIp()}][RID: ${this.getRid()}]`))} ${
        bold(new Date().toISOString())
      } - ${message}`,
    );
  }

  private _quit() {
    this._quitting = true;
    this.enqueue({
      type: ConnectionQueueMessageTypes.Remove,
      data: {
        connection: this,
        reason: "Closed by client",
      },
    });
  }

  private async *_readFromConnection(): AsyncGenerator<
    string,
    string | void,
    void
  > {
    while (this.open) {
      const str = await this._readLine();
      // NOTE (William): We're assuming that if a connection returns EOF (null), we're not connected anymore.
      // I haven't searched for litterature that confirms this, but it seems logical enough.
      // FIX (William): This probably fails when a user temporarily timesout? How to handle?
      if (str === null) {
        this._removeDroppedConnection();
        return "";
      }
      yield str;
    }
  }

  private async _readLine(): Promise<string | null> {
    let line: Uint8Array | undefined;
    while (true) {
      const result = await this._reader.readLine();
      if (result === null) {
        return null;
      }
      const { line: l, more } = result;

      if (!line && !more) {
        return UTF8Transcoder.decode(l);
      }

      line = line ? concat(line, l) : concat(new Uint8Array(), l);

      if (!more) {
        break;
      }
    }
    return UTF8Transcoder.decode(line);
  }

  private _removeDroppedConnection() {
    this._dropped = true;
    this.enqueue({
      type: ConnectionQueueMessageTypes.Remove,
      data: {
        connection: this,
        reason: "Connection dropped",
      },
    });
  }

  private _saveEmailToDb(message: CommandMessage) {
    this._log("💾 Saving message to database");

    // FIX (William): A more Deno way of doing this would be to make an async
    // generator on Connection that the manager could await
    this.enqueue({
      type: ConnectionQueueMessageTypes.Save,
      data: { message },
    });
  }

  private _welcome() {
    this.writeLine(
      `220 [${this._ip}] Welcome to ${CONST.NAME} v${CONST.VERSION}`,
    );
  }
}
