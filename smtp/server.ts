import { HTTPOptions, HTTPSOptions } from '../deps.ts';
import { ConnectionManager } from './connection.ts';
import { DatabaseType, MessagesDatabase, DatabaseOptions } from "../database/mod.ts";
import { getValue } from '../utils/mod.ts';
import { Configuration } from '../configuration/mod.ts';

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
	dbOptions: DatabaseOptions,
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

	constructor(opts: SMTPOptions) {
		this.hostname = opts.host || "0.0.0.0";
		this.port = opts.port || (!!opts.useTLS ? 465 : 25);
		this.cert = getValue(opts, "cert", !!opts.useTLS) as string;
		this.key = getValue(opts, "key", !!opts.useTLS) as string;
		this.manager = new ConnectionManager(this.hostname);
		
		this._connect(opts);
	}

	private async _connect(opts: SMTPOptions) {
		this._listener = !!opts.useTLS 
			? await Deno.listenTls(this._createHTTPSOptions(opts))
			: await Deno.listen(this._createHTTPOptions(opts));

		console.log(`🌎 SMTP Server listening at ${this.hostname}:${this.port}.`);
		
		if (opts.dbOptions) {
			await this.manager.initDatabase(opts.dbOptions);
		}

		for await (const conn of this._listener) {
			this.manager.addConnection(conn);
		}
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