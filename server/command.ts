export enum Command {
	HELO,
	FROM,
	TO,
	DATA,
	RESET,
	VERIFY,
	NOOP,
	QUIT,
	// Extended SMTP commands
	EHLO,
	AUTH,
	TLS,
	SIZE,
	HELP
};

export class CommandParser {
	
}