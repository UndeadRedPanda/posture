import { getConfig } from "./config.ts";
import { bold, yellow, gray } from "./deps.ts";
import { log, encodeStringToUint8Array } from "./utils.ts";
import { Database } from "./database";

export class ConnectionManager {
	private _connections: Connection[] = [];
	readonly database: Database;

	constructor(database: Database) {
		this.database = database;
		this.removeConnection = this.removeConnection.bind(this);
	}

	async addConnection(conn: Deno.Conn): Promise<Connection> {
		const connection = new Connection(conn, this.removeConnection);

		if (this._connections.length >= config.connection.limit) {
			await connection.write(encodeStringToUint8Array("Connection limit exceeded"));
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
		try {
			await connection.close(isDropped ? "Connection dropped" : "Concurrent connection limit reached");
		} catch (err) {
			// Do nothing somehow we couldn't close
		}
	}
}


export class Connection {
	readonly connectedAt: Date = new Date();

	private _removeConnectionFn: Function;

	private _commands: string[] = [];
	get commands() {
		return [...this._commands];
	}

	readonly conn: Deno.Conn;

	private _closed: boolean = false;
	get closed() {
		return this._closed;
	}

	private _extended: boolean = false;
	get extended() {
		return this._extended;
	}

	public requests: AsyncGenerator<Uint8Array, any, void>;

	constructor(conn: Deno.Conn, removeConnectionFn: Function) {
		this.conn = conn;
		this._removeConnectionFn = removeConnectionFn;
		this.requests = this._readFromConnection();

		if (getConfig().debug) {
			this._log("New connection opened.");
		}
	}

	getIp(): string {
		return (this.conn.remoteAddr as Deno.NetAddr).hostname;
	}

	getRid(): number {
		return this.conn.rid;
	}
	
	// TODO (William): Rewrite the way we read/write data based on https://github.com/manyuanrong/deno-smtp/blob/master/smtp.ts (BufWriter, BufReader, TextProtoReader)
	async writeString(str: string): Promise<Connection> {
		await this.write(encodeStringToUint8Array(str));

		return this;
	}

	async write(buffer: Uint8Array): Promise<Connection> {
		try {
			await this.conn.write(buffer);
		} catch (err) {
			this._removeDroppedConnection();
		}

		return this;
	}
	
	async close(reason: string = "Closed by client") {
		if (!this._closed) {
			this._closed = true;
			this.conn.close();

			if (getConfig().debug) {
				this._log(`Connection was closed. ${gray(`(${reason})`)}`);
			}
		}
	}

	extend(): Connection {
		this._extended = true;
		return this;
	}
	
	addCommand(command: string): Connection {
		this._commands.push(command);
		return this;
	}

	private _log(message: string) {
		log.default(`ℹ️  ${bold(yellow(`[IP: ${this.getIp()}][RID: ${this.getRid()}]`))} ${bold(this.connectedAt.toISOString())} - ${message}`);
	}

	private async * _readFromConnection(): AsyncGenerator<Uint8Array, any, void> {
		let data = new Uint8Array(1024);
		// NOTE (William): We're assuming that if a connection returns EOF (null), we're not connected anymore. 
		// I haven't searched for litterature that confirms this, but it seems logical enough.
		try {
			while(!this._closed) { 
				let length = await this.conn.read(data);
				if (length === null) {
					this._removeDroppedConnection();
					return new Uint8Array(0);
				}
				yield data.slice(0, length === null ? 0 : length);
			}
		} catch (err) {
		}
	}

	private async _removeDroppedConnection() {
		this._removeConnectionFn(this, true);
	} 
}

const config = getConfig();