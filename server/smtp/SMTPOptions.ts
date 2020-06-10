import { DBType } from "../db.ts";

export interface SMTPOptions {
	port: number,
	host: string,
	useTLS: boolean,
	cert?: string,
	key?: string,
	dbType?: DBType,
	dbName?: string,
	dbPort?: number,
	dbHost?: string,
	dbUser?: string,
	dbPass?: string,
}