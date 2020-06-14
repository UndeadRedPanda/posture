export enum Command {
	HELO = "HELO",
	EHLO = "EHLO",
	MAIL = "MAIL",
	RCPT = "RCPT",
	DATA = "DATA",
	RSET = "RSET",
	VRFY = "VRFY",
	NOOP = "NOOP",
	QUIT = "QUIT",
	EXPN = "EXPN",
	HELP = "HELP"
};

export interface CommandData {
	command?: Command;
	data?: string;
}

export class CommandParser {
	command: Command | undefined;
	value: string | undefined;

	setCommandData(data: string) {
		let index = data.indexOf(" ");
		let command = data.substring(0, index > -1 ? index : undefined);
		this.setCommandFromString(command);

		if (this.command !== undefined) {
			this.value = data.substring(index + 1);
		}
	}

	setCommandFromString(word: string): void {
		switch(word.toUpperCase()) {
			case Command.HELO:
				this.command = Command.HELO;
				break;
			case Command.EHLO:
				this.command = Command.EHLO;
				break;
			case Command.MAIL:
				this.command = Command.MAIL;
				break;
			case Command.RCPT:
				this.command = Command.RCPT;
				break;
			case Command.DATA:
				this.command = Command.DATA;
				break;
			case Command.RSET:
				this.command = Command.RSET;
				break;
			case Command.VRFY:
				this.command = Command.VRFY;
				break;
			case Command.NOOP:
				this.command = Command.NOOP;
				break;
			case Command.QUIT:
				this.command = Command.QUIT;
				break;
			case Command.EXPN:
				this.command = Command.EXPN;
				break;
			case Command.HELP:
				this.command = Command.HELP;
				break;
			default:
				this.command = undefined;
				break;
		}
	}

	setValueFromString(value: string): void {
		this.value = value;
	}
	
	getCommandData(): CommandData {
		return {
			command: this.command,
			data: this.value,
		}
	}
}