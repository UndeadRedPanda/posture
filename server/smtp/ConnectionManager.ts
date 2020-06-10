import { Connection } from "./Connection.ts";
import { encodeStringToUint8Array } from "../utils.ts";
import { getConfig } from "../config.ts";

const limit = getConfig().connectionLimit;

export class ConnectionManager {
	private _connections: Connection[] = [];

	async addConnection(conn: Deno.Conn): Promise<Connection> {
		const connection = new Connection(conn, this);
		
		this._connections.push(connection);

		if (this._connections.length > limit) {
			await connection.write(encodeStringToUint8Array("Connection limit exceeded"));
			this.removeConnection(connection);
		}

		return connection;
	}

	removeConnection(connection: Connection) {
		const index = this._connections.indexOf(connection);
		this._connections.splice(index, 1);
		if (connection.opened) {
			connection.close();
		}
	}
}

export const connectionManager = new ConnectionManager();
