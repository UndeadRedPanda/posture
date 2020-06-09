import { DBType } from "../db/DBType";

export interface SMTPOptions {
	port?: Number,
	host?: String,
	dbType?: DBType,
	dbName?: String,
	dbPort?: Number,
	dbHost?: String,
	dbUser?: String,
	dbPass?: String,
}