import { SMTP } from './server/index.ts';

SMTP({
	port: 25,
	host: '0.0.0.0',
	useTLS: false,
});