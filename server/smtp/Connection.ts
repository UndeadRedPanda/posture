import { ConnectionManager } from "./ConnectionManager.ts";
import { getConfig } from "../config.ts";
import { bold, yellow } from "../deps.ts";

export class Connection {
	readonly connectedAt: Date = new Date();

	private _manager: ConnectionManager;

	private _commands: string[] = [];
	get commands() {
		return [...this._commands];
	}

	private _connection: Deno.Conn;

	// TODO (William): Figure out how to listen to a connection to see when it closes
	private _opened: boolean = true;
	get opened() {
		return this._opened;
	}

	private _extended: boolean = false;
	get extended() {
		return this._extended;
	}

	public requests: AsyncGenerator<Uint8Array, any, void>;

	constructor(conn: Deno.Conn, manager: ConnectionManager) {
		this._connection = conn;
		this._manager = manager;
		this.requests = this.readFromConnection();

		if (getConfig().debug) {
			this._log("New connection opened.");
		}
	}

	getIp(): string {
		return (this._connection.remoteAddr as Deno.NetAddr).hostname;
	}

	getRid(): number {
		return this._connection.rid;
	}
	
	async write(buffer: Uint8Array): Promise<Connection> {
		try {
			await this._connection.write(buffer);
		} catch (err) {
			console.error(err);
		}

		return this;
	}

	async * readFromConnection(): AsyncGenerator<Uint8Array, any, void> {
		const buffer = new Deno.Buffer();
		try {
			while(await Deno.copy(this._connection, buffer)) {
				yield buffer.bytes();
				buffer.empty();
			}
		} catch (err) {
			console.error(err);
		}
	}
	
	close() {
		if (this._opened) {
			this._opened = false;
			this._connection.close();

			if (getConfig().debug) {
				this._log("Connection was closed.");
			}
		}
	}

	extend(): Connection {
		this._extended = true;
		return this;
	}
	
	// TODO (William): Figure out how to read a connection to add commands
	addCommand(command: string): Connection {
		this._commands.push(command);
		return this;
	}

	private _log(message: string) {
		console.log(`ℹ️  ${bold(yellow(`[IP: ${this.getIp()}][RID: ${this.getRid()}]`))} ${bold(this.connectedAt.toISOString())} - ${message}`);
	}
}

