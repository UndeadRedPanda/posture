import {
  Database,
  MongoDBConnector,
  MongoDBOptions,
  MySQLConnector,
  MySQLOptions,
  PostgresConnector,
  PostgresOptions,
  SQLite3Connector,
  SQLite3Options,
} from "../deps.ts";
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
  type: DatabaseType;
  connectionOptions:
    | MongoDBOptions
    | PostgresOptions
    | MySQLOptions
    | SQLite3Options;
}

type DatabaseConnector =
  | MongoDBConnector
  | PostgresConnector
  | MySQLConnector
  | SQLite3Connector;

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

    this.database = await new Database({
      connector: this._getConnector(),
      debug,
    });

    this.database.link([this.messageModel]);

    await this.database.sync();
  }

  private _getConnector(): DatabaseConnector {
    switch (this.opts.type) {
      case DatabaseType.MongoDB:
        return new MongoDBConnector(
          this.opts.connectionOptions as MongoDBOptions,
        );
      case DatabaseType.PostgreSQL:
        return new PostgresConnector(
          this.opts.connectionOptions as PostgresOptions,
        );
      case DatabaseType.MySQL:
        return new MySQLConnector(this.opts.connectionOptions as MySQLOptions);
      case DatabaseType.SQLite:
        return new SQLite3Connector(
          this.opts.connectionOptions as SQLite3Options,
        );
    }
  }

  async getMessage(id: string) {
    const field = this.isSQL ? "id" : "_id";
    const data = await this.messageModel
      .select("id", "mail", "rcpt", "data", "createdAt")
      .where(field, id)
      .first();

    return { data };
  }

  async getMessages(perPage = 10, page = 1) {
    const clampedPage = Math.max(1, page);
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

  async deleteMessage(id: string) {
    const field = this.isSQL ? "id" : "_id";
    const data = await this.messageModel.where(field, id).delete();
    return { data };
  }

  async deleteMessages() {
    const field = this.isSQL ? "id" : "_id";
    const data = await this.messageModel.select(field).delete();
    return { data };
  }

  async saveMessage(message: CommandMessage) {
    const { mail, rcpt, data } = message;

    const messageData = await this.messageModel.create({
      mail: <string> mail,
      rcpt: (<string[]> rcpt).join(),
      data: <string> data,
    });

    return { data: messageData };
  }
}
