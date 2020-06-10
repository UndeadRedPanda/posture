import { SMTPServer } from './server/index.ts';

SMTPServer({
	port: 25,
	host: '0.0.0.0',
	useTLS: false,
});