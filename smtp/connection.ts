import { 
	bold, 
	yellow, 
	gray, 
	BufReader, 
	BufWriter, 
	encode, 
	decode,
	concat,
	deferred, 
	Deferred
} from "./deps.ts";
import { log } from "./utils.ts";
import { Command, CommandHandler, CommandData, CommandMessage } from "./command.ts";
import { Configuration } from "./configuration.ts";
import * as CONST from "./constants.ts";

export class ConnectionManager {
	private _connections: Connection[] = [];

	constructor() {
		this.removeConnection = this.removeConnection.bind(this);
	}

	async addConnection(conn: Deno.Conn): Promise<Connection | undefined> {
		const connection = new Connection(conn, this.removeConnection);

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
}

export type RemoveConnectionFn = {(connection: Connection, reason: string): void};

export class Connection {
	readonly commandHandler: CommandHandler = new CommandHandler();

	readonly conn: Deno.Conn;

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

	private _removeConnectionFn: RemoveConnectionFn;

	private _signal: Deferred<CommandMessage> = deferred();

	private _started: boolean = false;

	private _writer: BufWriter;

	constructor(conn: Deno.Conn, removeConnectionFn: RemoveConnectionFn) {
		this.conn = conn;
		this._removeConnectionFn = removeConnectionFn;
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

	private _data(commandData: CommandData, end: boolean = false) {
		this.writeLine("354 Begin data");
	}

	private _expand(commandData: CommandData) {
		// TODO (William);
		this._returnOK();
	}

	private async _handleData() {
		for await (let data of this.requests) {
			this.commandHandler.setCommandData(data);
			let commandData = this.commandHandler.getCommandData();
			let command = commandData.command || ""; 
			
			switch (command) {
				case Command.HELO:
				case Command.EHLO:
				case Command.RSET:
					this._startCommand(commandData);
					break;
				case Command.MAIL:
					this._mail(commandData);
					break;
				case Command.RCPT:
					this._rcpt(commandData);
					break;
				case Command.DATA:
					this._data(commandData);
					break;
				case Command.HELP:
					this._help(commandData);
					break;
				case Command.VRFY:
					this._verify(commandData);
					break;
				case Command.EXPN:
					this._expand(commandData);
					break;
				case Command.QUIT:
					this._quit();
					break;
				case Command.NOOP:
					this._returnOK();
					break;
				default:
					if (!this.commandHandler.isData) {
						this._returnInvalid("Invalid command");
					}
					break;
			}
		}
	}

	private _help(commandData: CommandData) {
		this.writeLine("This is the help information");
	}

	private _log(message: string) {
		log.default(`ℹ️  ${bold(yellow(`[IP: ${this.getIp()}][RID: ${this.getRid()}]`))} ${bold(this.connectedAt.toISOString())} - ${message}`);
	}

	private _mail(commandData: CommandData) {
		// TODO (William);
		this._returnOK();
	}

	private _quit() {
		this._quitting;
		this._removeConnectionFn(this, "Closed by client");
	}

	private _rcpt(commandData: CommandData) {
		// TODO (William);
		this._returnOK();
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
		this._removeConnectionFn(this, "Connection dropped");
	} 

	private _returnInvalid(reason: string) {
		this.writeLine(`554 ${reason}`);
	}

	private _returnOK() {
		this.writeLine("250 OK");
	}

	private _startCommand(commandData: CommandData) {
		let isReset = commandData.command === Command.RSET;
		let isExtendedHello = commandData.command === Command.EHLO;

		if (isReset && !this._started) {
			return;
		} else if (!isReset && !this._started) {
			this._started = true;

			if (isExtendedHello) {
				// TODO (William): Implement the response format
			}
		}

		this.commandHandler.clear();
		this._returnOK();
	}

	private _verify(commandData: CommandData) {
		// TODO (William);
		this._returnOK();
	}

	private _welcome() {
		this.writeLine(`220 Welcome to ${CONST.NAME} v${CONST.VERSION} - ${CONST.LINE} ©${CONST.COPYRIGHT}`);
	}
}