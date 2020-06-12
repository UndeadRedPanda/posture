import { HTTPOptions, HTTPSOptions } from './deps.ts';
import { Connection, ConnectionManager } from './connection.ts';
import { DBType, Database, DatabaseOptions } from "./database.ts";
import { getValue } from './utils';

export interface SMTPOptions {
	port?: number,
	host?: string,
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

export class SMTPServer {
	readonly manager: ConnectionManager;
	readonly database: Database;
	readonly hostname: string;
	readonly port: number;
	readonly cert: string;
	readonly key: string;

	private _listener: Deno.Listener;
	get listener() {
		return this._listener;
	}

	constructor(opts: SMTPOptions) {
		this.hostname = opts.host || "0.0.0.0";
		this.port = opts.port || (opts.useTLS ? 465 : 25);
		this.cert = getValue(opts, "cert", !!opts.useTLS);
		this.key = getValue(opts, "key", !!opts.useTLS);
		this.database = this._connectToDb(opts);
		this.manager = new ConnectionManager(this.database);
		
		this._connect(opts);
	}

	private async _connect(opts: SMTPOptions) {
		this._listener = opts.useTLS 
			? Deno.listenTls(this._createHTTPSOptions(opts))
			: Deno.listen(this._createHTTPOptions(opts));

		console.log(`🌎 SMTP Server listening at ${opts.host}:${opts.port}.`);
		
		for await (const conn of this.listener) {
			this.manager.addConnection(conn);
		}
	}

	private _connectToDb(opts: SMTPOptions): Database {
		let dbOptions: DatabaseOptions = {
			host: opts.dbHost || "localhost",
			port: opts.dbPort || 27017,
			type: opts.dbType || DBType.MongoDB,
			user: opts.dbUser || "",
			pass: opts.dbPass || "",
			name: opts.dbName || "",
		};

		return new Database(dbOptions);
	}

	private _createHTTPOptions(opts: SMTPOptions): HTTPOptions {
		return {
			hostname: this.hostname,
			port: this.port,
		};
	}
	
	private _createHTTPSOptions(opts: SMTPOptions): HTTPSOptions {
		return {
			hostname: this.hostname,
			port: this.port,
			certFile: this.cert,
			keyFile: this.key,
		 };
	}
}