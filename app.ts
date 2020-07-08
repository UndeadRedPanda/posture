import { SMTPServer } from './smtp/mod.ts';
import { APIServer } from './api/mod.ts';

new APIServer();
new SMTPServer({
	configPath: './posture.json'
});
