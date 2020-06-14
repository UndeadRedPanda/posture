export enum Command {
	// Basic Commands
	HELO = "HELO",
	FROM = "FROM",
	TO = "TO",
	DATA = "DATA",
	RESET = "RESET",
	VERIFY = "VERIFY",
	NOOP = "NOOP",
	QUIT = "QUIT",
	// Extended Commands
	EHLO = "EHLO",
	AUTH = "AUTH",
	TLS = "TLS",
	SIZE = "SIZE",
	HELP = "HELP"
};

// export type NormalCommand = "HELO" | "FROM" | "TO" | "DATA" | "RESET" | "VERIFY" | "NOOP" | "QUIT";

// export type ExtendedCommand = "EHLO" | "AUTH" | "TLS" | "SIZE" | "HELP";

// export type Command = NormalCommand | ExtendedCommand;

export class CommandParser {
	command: string | undefined;
	value: string | undefined;

	setCommandFromString(word: string): void {
		switch(word.toUpperCase()) {
			case Command.HELO:
				this.command = Command.HELO;
				break;
			case Command.FROM:
				this.command = Command.FROM;
				break;
			case Command.TO:
				this.command = Command.TO;
				break;
			case Command.DATA:
				this.command = Command.DATA;
				break;
			case Command.RESET:
				this.command = Command.RESET;
				break;
			case Command.VERIFY:
				this.command = Command.VERIFY;
				break;
			case Command.NOOP:
				this.command = Command.NOOP;
				break;
			case Command.QUIT:
				this.command = Command.QUIT;
				break;
			case Command.EHLO:
				this.command = Command.EHLO;
				break;
			case Command.AUTH:
				this.command = Command.AUTH;
				break;
			case Command.TLS:
				this.command = Command.TLS;
				break;
			case Command.SIZE:
				this.command = Command.SIZE;
				break;
			case Command.HELP:
				this.command = Command.HELP;
				break;
			default:
				this.command = undefined;
		}
	}
}