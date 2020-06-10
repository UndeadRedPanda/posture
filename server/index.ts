import { createSMTPServer } from "./smtp/SMTPServer.ts";
import { SMTPOptions } from "./smtp/SMTPOptions.ts";

export function SMTPServer(opts: SMTPOptions) {
	createSMTPServer(opts);
}