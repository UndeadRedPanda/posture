import { createSMTPServer } from "./smtp/SMTPServer.ts";
import { SMTPOptions } from "./smtp/SMTPOptions.ts";

export function SMTP(opts: SMTPOptions) {
	createSMTPServer(opts);
}