

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

export function readMessage(data: Buffer): Command {
	return Command.QUIT;
}

export function isExtendedMode() {

}