import { Socket } from "net";
import { Connection, makeConnection } from "./Connection";

let connections = {};
let openConnections = 0;

export function createConnection(socket: Socket): Connection {
	// TODO (William): Limit connections to threshold set in configuration
	let id;
	do {
		id = Math.floor(Math.random() * 9999999999);
	} while( connections.hasOwnProperty(`x${id}`));
	
	let c = makeConnection(socket, id);
	connections[`x${id}`] = c;
	openConnections++;
	c.on("close", () => {
		delete connections[`x${id}`];
		openConnections--;
	});
	return c;
}