import { SMTPServer } from './smtp/mod.ts';

new SMTPServer({
	configPath: './posture-smtp.json'
});