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
	private isSQL: boolean;
	constructor(private opts: DatabaseOptions) {
		this.isSQL = this.opts.type !== DatabaseType.MongoDB;
		this.messageModel = this.isSQL ? MessageSQL : MessageMongo;
	}

	async setupDatabase() {
		const { debug } = Configuration.getConfig();
		this.database = await new Database({ dialect: this.opts.type, debug}, this.opts.connectionOptions);
		this.database.link([this.messageModel]);
		await this.database.sync();
	}

	async getMessage(id: string | undefined) {
		let field = this.isSQL ? 'id' : '_id';
		const data =  await this.messageModel
			.select("id", "mail", "rcpt", "data", "createdAt")
			.where(field, id)
			.first();

		return { data };
	}

	async getMessages(perPage: number = 1, page: number = 1) {
		const clampedPage = Math.max(1, page)
		const offset = (clampedPage - 1) * perPage;
		const limit = this.isSQL ? perPage : perPage + offset;
		const count = await this.messageModel.count();
		const data = await this.messageModel
			.select("id", "mail", "rcpt", "data", "createdAt")
			.offset(offset)
			.limit(limit)
			.orderBy("createdAt", "desc")
			.get();

		return {
			data,
			page,
			perPage,
			count,
		};
	}

	async deleteMessage(id: string | undefined) {
		let field = this.isSQL ? 'id' : '_id';
		const data = await this.messageModel.where(field, id).delete();
		return { data };
	}

	async deleteMessages() {
		let field = this.isSQL ? 'id' : '_id';
		const data = await this.messageModel.select(field).delete();
		return { data };
	}

	async saveMessage(message: CommandMessage) {
		let {mail, rcpt, data} = message;

		const messageData = await this.messageModel.create({
			mail: <string>mail,
			rcpt: (<string[]>rcpt).join(),
			data: <string>data
		});

		return { data: messageData };
	}
}