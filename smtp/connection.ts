import { 
	bold, 
	yellow, 
	gray, 
	BufReader, 
	BufWriter, 
	encode, 
	decode,
	concat,
} from "../deps.ts";
import { log } from "../utils/mod.ts";
import { Command, CommandHandler, CommandMessage } from "./command.ts";
import { Configuration } from "../configuration/mod.ts";
import * as CONST from "./constants.ts";
import { SMTPOptions } from "./server.ts";
import { DatabaseOptions, MessagesDatabase } from "../database/mod.ts";

export class ConnectionManager {
	private _connections: Connection[] = [];
	private _database: MessagesDatabase | undefined;

	constructor(private _ip: string) {
		this.removeConnection = this.removeConnection.bind(this);
		this.saveMessage = this.saveMessage.bind(this);
	}

	async addConnection(conn: Deno.Conn): Promise<Connection | undefined> {
		const connection = new Connection(conn, this._ip, this.removeConnection, this.saveMessage);

		if (this._connections.length >= Configuration.maxConnections()) {
			let reason = "Connection limit exceeded";
			await connection.writeLine(reason);
			await this.removeConnection(connection, reason);
			return;
		}

		this._connections.push(connection);

		connection.startConnection();

		return connection;
	}

	async initDatabase(db: MessagesDatabase) {
		this._database = db;
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

export type RemoveConnection = {(connection: Connection, reason: string): void};
export type SaveMessage = {(message: CommandMessage): void};

export class Connection {
	readonly commandHandler: CommandHandler = new CommandHandler();

	readonly connectedAt: Date = new Date();

	public requests: AsyncGenerator<string, any, void> = this._readFromConnection();

	private _closed: boolean = false;
	get closed() {
		return this._closed;
	}

	private _dropped: boolean = false;

	get open(): boolean {
		return !this._closed && !this._dropped && !this._quitting;
	}

	private _quitting: boolean = false;
	get quitting() {
		return this._quitting;
	}

	private _reader: BufReader;

	private _started: boolean = false;

	private _writer: BufWriter;

	constructor(readonly conn: Deno.Conn, private _ip: string, private _removeConnection: RemoveConnection, private _saveMessage: SaveMessage) {
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

	async startConnection() {
		this._welcome();
		this._handleData();
	}
	
	async writeLine(str: string): Promise<this> {
		str = `${str.trim()}\r\n`;
		await this.write(encode(str));

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
	
	async close(reason: string = "Closed by client") {
		if (!this._closed) {
			this._closed = true;
			this.conn.close();

			if (Configuration.isDebug()) {
				this._log(`Connection was closed. ${gray(`(${reason})`)}`);
			}
		}
	}

	private async _handleData() {
		for await (let data of this.requests) {
			let {isReadyToSend, command, code, message} = this.commandHandler.parseCommand(data);
			
			// NOTE (William): In an actual SMTP server implementation, this
			// wouldn't be acceptable. However, since we don't really have the 
			// same delivery requirements as an actual SMTP server, we can just 
			// await the saving of the email to the database
			if (isReadyToSend) {
				let message = this.commandHandler.message;
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
		log.info(`${bold(yellow(`[IP: ${this.getIp()}][RID: ${this.getRid()}]`))} ${bold(new Date().toISOString())} - ${message}`);
	}

	private _quit() {
		this._quitting = true;
		this._removeConnection(this, "Closed by client");
	}

	private async * _readFromConnection(): AsyncGenerator<string, any, void> {
		// NOTE (William): We're assuming that if a connection returns EOF (null), we're not connected anymore. 
		// I haven't searched for litterature that confirms this, but it seems logical enough.
		try {
			while(this.open) { 
				let str = await this._readLine();
				if (str === null) {
					this._removeDroppedConnection();
					return "";
				}
				yield str;
			}
		} catch (err) {
		}
	}

	private async _readLine(): Promise<string | null> {
		let line: Uint8Array | undefined;
		while(true) {
			let result = await this._reader.readLine();
			if (result === null) {
				return null;
			}
			let {line: l, more} = result;

			if(!line && !more) {
				return decode(l);
			}

			line = line ? concat(line, l) : concat(new Uint8Array(), l);

			if (!more) {
				break;
			}
		}
		return decode(line);
	}

	private _removeDroppedConnection() {
		this._dropped = true;
		this._removeConnection(this, "Connection dropped");
	}

	private async _saveEmailToDb(message: CommandMessage) {
		this._log("💾 Saving message to database");

		// FIXME: A more Deno way of doing this would be to make an async 
		// generator on Connection that the manager could await
		if (this._saveMessage) {
			this._saveMessage(message);
		}
	}

	private _welcome() {
		this.writeLine(`220 [${this._ip}] Welcome to ${CONST.NAME} v${CONST.VERSION}`);
	}
}