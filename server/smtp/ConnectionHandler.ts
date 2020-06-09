import { createConnection } from './ConnectionManager';
import { Socket } from "net";
import { Command, readMessage } from './CommandHandler';

export default function connectionHandler(s: Socket) {
	let c = createConnection(s);
	c.on("data", handleData);
	c.off("data", handleData);
}

function handleData(data: Buffer) {
	let command: Command = readMessage(data);
	console.log(command);
	console.log(this);
	switch (command) {
		case Command.HELO:
		case Command.EHLO:
			break;
		case Command.FROM:
			break;
		case Command.TO:
			break;
		case Command.DATA:
			break;
		case Command.QUIT:
			break;
		default:
			break;
	}
}