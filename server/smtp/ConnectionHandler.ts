import {
	ServerRequest
} from 'https://deno.land/x/std/http/server';

import { createConnection } from './ConnectionManager';
import { Command, readMessage } from './CommandHandler';

export default function connectionHandler(r: ServerRequest) {
	let c = createConnection(r);
	c.on("data", handleData);
	c.off("data", handleData);
}

function handleData(data: Buffer) {
	let command: Command = readMessage(data);
	console.log(command);
	console.log(this);
	switch (command) {
		case Command.HELO:
			break;
		case Command.FROM:
			break;
		case Command.TO:
			break;
		case Command.DATA:
			break;
		case Command.RESET:
			break;
		case Command.VERIFY:
			break;
		case Command.NOOP:
			break;
		case Command.QUIT:
			break;
		default:
			break;
	}
}