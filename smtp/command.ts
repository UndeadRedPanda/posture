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

export interface CommandMessage {
	mail?: string;
	rcpt?: string;
	data?: string;
}


export class CommandHandler {
	command: Command | undefined;

	value: string | undefined;

	private _isData: boolean = false;
	get isData() {
		return this._isData;
	}

	private _readyToSend: boolean = false;
	get readyToSend() {
		return this._readyToSend;
	}

	private _message: CommandMessage = {};
	get message() {
		return { ...this._message };
	}

	clear() {
		this._isData = false;
		this._readyToSend = false;
		this._message = {};
	}
	
	getCommandData(): CommandData {
		return {
			command: this.command,
			data: this.value,
		}
	}

	setCommandData(data: string) {
		let command = data.substring(0, 4);
		this.setCommandFromString(command);
		this.value = data.substring(4).trim();

		if (this.command === Command.DATA && !this.isData) {
			this._isData = true;
		} else if (this.command === undefined && this.isData && data.trim() === ".") {
			this._readyToSend = true;
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
}