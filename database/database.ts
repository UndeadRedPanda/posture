import { Database, MongoDBOptions, PostgresOptions, MySQLOptions, SQLite3Options} from "../deps.ts";
import { Configuration } from "../configuration/mod.ts";
import { CommandMessage } from "../smtp/command.ts";
import { MessageMongo, MessageSQL } from "./models.ts";

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
	private database: Database | undefined;
	private messageModel: typeof MessageMongo | typeof MessageSQL;
	constructor(private opts: DatabaseOptions) {
		this.messageModel = this.opts.type === DatabaseType.MongoDB ? MessageMongo : MessageSQL;
	}

	async setupDatabase() {
		const { debug } = Configuration.getConfig();
		this.database = await new Database({ dialect: this.opts.type, debug}, this.opts.connectionOptions);
		
		if (this.opts.type === DatabaseType.MongoDB) {
			this.database.link([this.messageModel]);
		} else {
			this.database.link([this.messageModel]);
		}

		await this.database.sync();
	}

	async getMessage(id: string | number) {

	}

	async getMessages(count: number = 10, page: number = 0) {
		// TODO Make code responsible to fetch paged messages
	}

	async deleteMessage() {

	}

	async saveMessage(message: CommandMessage) {
		let {mail, rcpt, data} = message;

		await this.messageModel.create({
			mail: <string>mail,
			rcpt: (<string[]>rcpt).join(),
			data: <string>data
		});
	}
}