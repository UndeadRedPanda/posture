import { SMTPServer } from './smtp/mod.ts';
import { APIServer } from './api/mod.ts';
import { DatabaseType, MessagesDatabase } from './database/mod.ts';
import { Configuration } from './configuration/mod.ts';

Configuration.setConfigWithPath('./posture.json');

const db = new MessagesDatabase({
	type: DatabaseType.MongoDB,
	connectionOptions: {
		uri: 'mongodb://127.0.0.1:27017',
		database: 'posture-smtp'
	}
});

await db.setupDatabase();

new SMTPServer({ db });

new APIServer({ db });
