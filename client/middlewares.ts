import { Context, isHttpError, send, red, yellow, green, white } from '../deps.ts';

export async function logger(ctx: Context, next: Function) {
	await next();
	let color = white;
	let { method, url } = ctx.request;
	let { status, headers } = ctx.response;
	let rt = headers.get("X-Response-Time");

	if (status >= 200 && status < 300) {
		color = green;
	} else if (status >= 300 && status < 400) {
		color = yellow;
	} else if (status >= 400) {
		color = red;
	}

	console.log(`${color(status.toString())} ${method} - ${url} - ${rt}ms`);
}

export async function timer(ctx: Context, next: Function) {
	const start = performance.now();
	await next();
	const end = performance.now();
	ctx.response.headers.set("X-Response-Time", `${end - start}`);
}

export async function staticFiles(ctx: Context, next: Function) {
	const root = `${Deno.cwd()}/client/app`;
	const index = 'index.html';

	try {
		const file = await Deno.stat(`${root}${ctx.request.url.pathname}`);
		if(file.isFile) {
			await send(ctx, ctx.request.url.pathname, {
				root,
				index
			});
			return;
		} 
	} catch (err) { 
		// Do nothing, we don't have this file
	}

	await next();
}

export async function notFound(ctx: Context) {
	await ctx.send({
		root: `${Deno.cwd()}/client/app`,
		path: 'index.html'
	});
	ctx.response.status = 404;
}