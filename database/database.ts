import { Database, MongoDBOptions, PostgresOptions, MySQLOptions, SQLite3Options} from "../deps.ts";
import { Configuration } from "../configuration/mod.ts";
import { CommandMessage } from "../smtp/command.ts";

export enum DatabaseType {
	PostgreSQL = "postgres",
	SQLite = "sqlite3",
	MySQL = "mysql",
	MongoDB = "mongo",
}

export interface DatabaseOptions { 
	type: DatabaseType 
	connectionOptions: 
		| MongoDBOptions 
		| PostgresOptions 
		| MySQLOptions 
		| SQLite3Options
}


export class MessagesDatabase {
	database: Database;
	constructor(opts: DatabaseOptions) {
		const { debug } = Configuration.getConfig();
		this.database = new Database({ dialect: opts.type, debug}, opts.connectionOptions);
	}

	getMessages(count: number = 10, offset: number = 0) {
		// TODO Make code responsible to fetch paged messages
	}

	getMessage(id: string | number) {

	}

	saveMessage(message: CommandMessage) {

	}
}