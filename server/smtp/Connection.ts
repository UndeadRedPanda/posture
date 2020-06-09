import { Socket } from "net";

export interface Connection {
	readonly id: number;
	readonly connectionTime: Date;
	readonly isExtended: boolean;
	readonly commands: string[];
	readonly socket: Socket;
	ip(): string;
	on(event: string, listener: (...args: any[]) => void): Connection;
	off(event: string, listener: (...args: any[]) => void): Connection;
	write(buffer: string, cb?: (err?: Error) => void): boolean;
	end(cb?: (err?: Error) => void): void;
	extend(): void;
	addCommand(command: string): void;
}

export function makeConnection(socket: Socket, randomId: number): Connection {
	let _date = new Date();
	let _commands = [];
	let _extended = false;
	let c = {
		get id() { return randomId; },
		get connectionTime() { return _date; },
		get isExtended() { return _extended; },
		get commands() { return [..._commands]; },
		get socket() {
			return socket;
		},
		
		ip: () => {
			return socket.remoteAddress;
		},
	
		on: (event, listener) => {
			socket.on(event, listener.bind(c));
			return c;
		},
		
		off: (event, listener) => {
			socket.off(event, listener.bind(c));
			return c;
		},
		
		write: (buffer, cb?) => {
			return socket.write(buffer, cb);
		},
		
		end: (cb?) => {
			socket.end(cb);
		},

		extend: () => {
			_extended = true;
		},
		
		addCommand: (command) => {
			_commands.push(command);
		},
	};
	return c;
}

