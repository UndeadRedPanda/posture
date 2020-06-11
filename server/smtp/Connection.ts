import { ConnectionManager } from "./ConnectionManager.ts";
import { getConfig } from "../config.ts";
import { bold, yellow, gray } from "../deps.ts";
import { log, encodeStringToUint8Array } from "../utils.ts";

const pingInterval = getConfig().pingInterval;

export class Connection {
	readonly connectedAt: Date = new Date();

	private _manager: ConnectionManager;

	private _commands: string[] = [];
	get commands() {
		return [...this._commands];
	}

	readonly conn: Deno.Conn;

	private _dropped: boolean = false;
	get dropped() {
		return this._dropped;
	}

	private _closed: boolean = false;
	get closed() {
		return this._closed;
	}

	private _extended: boolean = false;
	get extended() {
		return this._extended;
	}

	private _intervalId: number | null = null;

	public requests: AsyncGenerator<Uint8Array, any, void>;

	constructor(conn: Deno.Conn, manager: ConnectionManager) {
		this.conn = conn;
		this._manager = manager;
		this.requests = this.readFromConnection();

		if (getConfig().debug) {
			this._log("New connection opened.");
		}

		this._intervalId = setInterval(() => {
			this._ping();
		}, pingInterval);
	}

	getIp(): string {
		return (this.conn.remoteAddr as Deno.NetAddr).hostname;
	}

	getRid(): number {
		return this.conn.rid;
	}

	private async _ping() {
		await this.writeString("\u0000");

		if (this._dropped) {
			if (this._intervalId) {
				clearInterval(this._intervalId);
				this._intervalId = null;
			}
			this._manager.removeConnection(this, true);
		}
	} 
	
	async writeString(str: string): Promise<Connection> {
		await this.write(encodeStringToUint8Array(str));

		return this;
	}

	async write(buffer: Uint8Array): Promise<Connection> {
		try {
			await this.conn.write(buffer);
		} catch (err) {
			this._dropped = true;
		}

		return this;
	}

	// TODO (William): Find a way to read async without blocking the entire connection.
	async * readFromConnection(): AsyncGenerator<Uint8Array, any, void> {
		if (this._closed) {
			return new Uint8Array(0);
		}

		const buffer = new Deno.Buffer();
		try {
			while(await Deno.copy(this.conn, buffer)) {
				yield buffer.bytes();
				buffer.empty();
			}
		} catch (err) {
		}
	}
	
	async close(reason: string = "Closed by client") {
		if (!this._closed) {
			this._closed = true;
			this.conn.close();

			if (this._intervalId) {
				clearInterval(this._intervalId);
				this._intervalId = null;
			}

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
}

