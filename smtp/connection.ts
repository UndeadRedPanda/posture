import { 
	bold, 
	yellow, 
	gray, 
	BufReader, 
	BufWriter, 
	encode, 
	decode,
	concat
} from "./deps.ts";
import { log } from "./utils.ts";
import { Database } from "./database.ts";
import { Command, CommandParser, CommandData } from "./command.ts";
import { Configuration } from "./configuration.ts";

export class ConnectionManager {
	private _connections: Connection[] = [];
	readonly database: Database;

	private _buffer: CommandData[][] = [];
	private _submitting: boolean = false;

	constructor(database: Database) {
		this.database = database;
		this.removeConnection = this.removeConnection.bind(this);
	}

	async addConnection(conn: Deno.Conn): Promise<Connection> {
		const connection = new Connection(conn, this.removeConnection);

		if (this._connections.length >= Configuration.maxConnections()) {
			await connection.writeString("Connection limit exceeded");
			await this.removeConnection(connection);
		} else {
			this._connections.push(connection);
		}

		return connection;
	}

	async removeConnection(connection: Connection, isDropped: boolean = false) {
		const index = this._connections.indexOf(connection);
		if (index > -1) {
			this._connections.splice(index, 1);
		}
		if (connection.quitting) {
			this._buffer.push(connection.commands);
			this._submitData();
		}
		try {
			await connection.close(isDropped ? "Connection dropped" : "Concurrent connection limit reached");
		} catch (err) {
			// Do nothing somehow we couldn't close
		}
	}

	private _submitData() {
		if (!this._submitting) {
			this._submitting = true;
		}
	}
}


export class Connection {
	readonly commandParser: CommandParser = new CommandParser();

	readonly connectedAt: Date = new Date();

	private _removeConnectionFn: Function;

	private _commands: CommandData[] = [];
	get commands() {
		return [...this._commands];
	}

	readonly conn: Deno.Conn;

	private _started: boolean = false;

	private _quitting: boolean = false;
	get quitting() {
		return this._quitting;
	}

	private _closed: boolean = false;
	get closed() {
		return this._closed;
	}

	private _reader: BufReader;

	private _writer: BufWriter;

	public requests: AsyncGenerator<string, any, void>;

	constructor(conn: Deno.Conn, removeConnectionFn: Function) {
		this.conn = conn;
		this._removeConnectionFn = removeConnectionFn;
		this.requests = this._readFromConnection();
		this._writer = new BufWriter(conn);
		this._reader = new BufReader(conn);

		if (Configuration.isDebug()) {
			this._log("New connection opened.");
		}

		this._handleData();
	}

	getIp(): string {
		return (this.conn.remoteAddr as Deno.NetAddr).hostname;
	}

	getRid(): number {
		return this.conn.rid;
	}
	
	async writeString(str: string): Promise<Connection> {
		await this.write(encode(str));

		return this;
	}

	async write(buffer: Uint8Array): Promise<Connection> {
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
			this.commandParser.setCommandData(data);

			if (typeof this.commandParser.command !== 'undefined') {
				let commandData = this.commandParser.getCommandData();
				let { command } = commandData; 
				
				switch (command) {
					case Command.HELO:
					case Command.EHLO:
					case Command.RSET:
						this._startCommand(command === Command.RSET);
						break;
					case Command.MAIL:
					case Command.RCPT:
					case Command.DATA:
						this._addCommand(commandData);
						break;
					case Command.HELP:
						this._showHelp(commandData);
						break;
					case Command.VRFY:
						this._verify(commandData);
						break;
					case Command.EXPN:
						this._expand(commandData);
						break;
					case Command.QUIT:
						this._quit();
					case Command.NOOP:
					default:
						// There's really nothing to do here.
						break;
				}
			}
		}
	}

	private _addCommand(commandData: CommandData) {
		// TODO (William);
		this.writeString("250 OK\n");
	}

	private _expand(commandData: CommandData) {
		// TODO (William);
		this.writeString("250 OK\n");
	}

	private _log(message: string) {
		log.default(`ℹ️  ${bold(yellow(`[IP: ${this.getIp()}][RID: ${this.getRid()}]`))} ${bold(this.connectedAt.toISOString())} - ${message}`);
	}

	private _quit() {
		// TODO (William);
		this.writeString("250 OK\n");
		this._quitting;
		this.close();
	}

	private async * _readFromConnection(): AsyncGenerator<string, any, void> {
		// NOTE (William): We're assuming that if a connection returns EOF (null), we're not connected anymore. 
		// I haven't searched for litterature that confirms this, but it seems logical enough.
		try {
			while(!this._closed) { 
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

	private async _removeDroppedConnection() {
		this._removeConnectionFn(this, true);
	} 

	private _showHelp(commandData: CommandData) {
		this.writeString("This is the help information\n");
	}

	private _startCommand(isReset: boolean = false) {
		if (isReset && !this._started) {
			return;
		} else if (!isReset) {
			this._started = true;
		}

		this._commands = [];
		this.writeString("250 OK\n");
	}

	private _verify(commandData: CommandData) {
		// TODO (William);
		this.writeString("250 OK\n");
	}
}