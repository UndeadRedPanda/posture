// import { Command, readMessage } from './CommandHandler.ts';

import { connectionManager } from "./ConnectionManager.ts";
import { decodeUint8ArrayToString } from "../utils.ts";

export async function handleConnection(c: Deno.Conn) {
	const connection = await connectionManager.addConnection(c);
	if (connection.opened) {
		for await(let buffer of connection.requests) {
			console.log("buffer");
			console.log(buffer);
		}
	}
}

// function handleData(data: Buffer) {
// 	let command: Command = readMessage(data);
// 	console.log(command);
// 	console.log(this);
// 	switch (command) {
// 		case Command.HELO:
// 			break;
// 		case Command.FROM:
// 			break;
// 		case Command.TO:
// 			break;
// 		case Command.DATA:
// 			break;
// 		case Command.RESET:
// 			break;
// 		case Command.VERIFY:
// 			break;
// 		case Command.NOOP:
// 			break;
// 		case Command.QUIT:
// 			break;
// 		default:
// 			break;
// 	}
// }