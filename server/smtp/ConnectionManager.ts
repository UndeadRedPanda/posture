import { Connection } from "./Connection.ts";
import { encodeStringToUint8Array } from "../utils.ts";
import { getConfig } from "../config.ts";

// const limit = getConfig().connectionLimit;
const limit = 1;

export class ConnectionManager {
	private _connections: Connection[] = [];
	
	async addConnection(conn: Deno.Conn): Promise<Connection> {
		const connection = new Connection(conn, this);

		if (this._connections.length >= limit) {
			await connection.write(encodeStringToUint8Array("Connection limit exceeded"));
			await this.removeConnection(connection);
		} else {
			console.log(Deno.resources());
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

export const connectionManager = new ConnectionManager();
