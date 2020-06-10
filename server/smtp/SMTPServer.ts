import { HTTPOptions, HTTPSOptions } from '../deps.ts';
import { getConfig } from '../config.ts';
import { SMTPOptions } from './SMTPOptions.ts';
import { handleConnection } from './ConnectionHandler.ts';

export async function createSMTPServer(opts: SMTPOptions) {
	const listener = opts.useTLS 
		? Deno.listenTls(createHTTPSOptions(opts))
		: Deno.listen(createHTTPOptions(opts));

	console.log(`🌎 SMTP Server listening at ${opts.host}:${opts.port}.`);

	for await (const conn of listener) {
		handleConnection(conn);
	}
}

function createHTTPOptions(opts: SMTPOptions): HTTPOptions {
	return {
		hostname: opts.host,
		port: opts.port,
	};
}

function createHTTPSOptions(opts: SMTPOptions): HTTPSOptions {
	return {
		hostname: opts.host,
		port: opts.port,
		certFile: opts.cert as string,
		keyFile: opts.key as string,
	 };
}