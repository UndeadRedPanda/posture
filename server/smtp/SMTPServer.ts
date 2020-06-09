
import { createServer, Server, AddressInfo } from 'net';
import { SMTPOptions } from './SMTPOptions';
import connectionHandler from './ConnectionHandler';

export function createSMTPServer(opts: SMTPOptions): Server {
	let server = createServer();
	server.on('connection', connectionHandler);
	server.listen(25, () => {
		let address: any = server.address();
		console.log(`SMTP Server listening at ${address.address}:${address.port}.`)
	});
	return server;
}
