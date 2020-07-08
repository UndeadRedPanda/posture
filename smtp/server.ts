import { HTTPOptions, HTTPSOptions } from '../deps.ts';
import { ConnectionManager } from './connection.ts';
import { DBType, Database, DatabaseOptions } from "../database/mod.ts";
import { getValue } from '../utils/mod.ts';
import { Configuration } from './configuration.ts';

/**
 * SMTPOptions lists all options for the SMTPServer.
 * 
 * None are required as SMTPServer has default alternatives set in place.
 */
export interface SMTPOptions {
	port?: number,
	host?: string,
	useTLS?: boolean,
	cert?: string,
	key?: string,
	dbType?: DBType,
	dbName?: string,
	dbPort?: number,
	dbHost?: string,
	dbUser?: string,
	dbPass?: string,
	configPath?: string,
}

/**
 * SMTPServer is the server that will take in SMTP commands and save the results to a database for the server
 */
export class SMTPServer {
	readonly manager: ConnectionManager;
	readonly hostname: string;
	readonly port: number;
	readonly cert: string;
	readonly key: string;

	private _listener: Deno.Listener | undefined;
	get listener() {
		return this._listener;
	}

	constructor(opts: SMTPOptions = {}) {
		this.hostname = opts.host || "0.0.0.0";
		this.port = opts.port || (!!opts.useTLS ? 465 : 25);
		this.cert = getValue(opts, "cert", !!opts.useTLS) as string;
		this.key = getValue(opts, "key", !!opts.useTLS) as string;
		this.manager = new ConnectionManager(this.hostname);
		
		this.manager.initDatabase(opts);

		this._setConfig(opts.configPath);
		this._connect(opts);
	}

	private async _connect(opts: SMTPOptions) {
		this._listener = !!opts.useTLS 
			? Deno.listenTls(this._createHTTPSOptions(opts))
			: Deno.listen(this._createHTTPOptions(opts));

		console.log(`🌎 SMTP Server listening at ${this.hostname}:${this.port}.`);
		
		for await (const conn of this._listener) {
			this.manager.addConnection(conn);
		}
	}

	// private _connectToDb(opts: SMTPOptions): Database {
	// 	let dbOptions: DatabaseOptions = {
	// 		host: opts.dbHost || "localhost",
	// 		port: opts.dbPort || 27017,
	// 		type: opts.dbType || DBType.MongoDB,
	// 		user: opts.dbUser || "",
	// 		pass: opts.dbPass || "",
	// 		name: opts.dbName || "",
	// 	};

	// 	return new Database(dbOptions);
	// }

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

	private _setConfig(config: string | undefined) {
		if (config) {
			Configuration.setConfigWithPath(config);
		}
	}
}