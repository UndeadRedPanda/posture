import createSMTPServer from "./smtp";
import { Server } from "net";
import { SMTPOptions } from "./smtp/SMTPOptions";

export default function SMTP(opts: SMTPOptions): Server {
	return createSMTPServer(opts);
}