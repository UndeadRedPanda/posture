
import { 
	serve, 
	serveTLS, 
	HTTPOptions, 
	HTTPSOptions 
} from 'https://deno.land/std@0.56.0/http/server.ts';

import { SMTPOptions } from './SMTPOptions.ts';
// import connectionHandler from './ConnectionHandler';

export async function createSMTPServer(opts: SMTPOptions) {
	const server = opts.useTLS 
		? serveTLS(createHTTPSOptions(opts))
		: serve(createHTTPOptions(opts));

	console.log(`🌎 SMTP Server listening at ${opts.host}:${opts.port}.`);

	for await (const request of server) {
		console.log(request);
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