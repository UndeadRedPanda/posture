import { SMTPServer } from './smtp/mod.ts';
import { APIServer } from './api/mod.ts';
import { DatabaseType } from './database/mod.ts';
import { Configuration } from './configuration/mod.ts';

Configuration.setConfigWithPath('./posture.json');

const dbOpts = {
	type: DatabaseType.MongoDB,
	connectionOptions: {
		uri: 'mongodb://127.0.0.1:27017',
		database: 'posture-smtp'
	}
};

new SMTPServer({
	dbOptions: dbOpts
});

new APIServer({
	dbOptions: dbOpts
});
