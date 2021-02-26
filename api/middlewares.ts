import { Context, green, red, Status, white, yellow } from "../deps.ts";

export async function logger(ctx: Context, next: () => void) {
  await next();
  let color = white;
  const { method, url } = ctx.request;
  const { status, headers } = ctx.response;
  const rt = headers.get("X-Response-Time");

  if (status >= 200 && status < 300) {
    color = green;
  } else if (status >= 300 && status < 400) {
    color = yellow;
  } else if (status >= 400) {
    color = red;
  }

  console.log(`${color(status.toString())} ${method} - ${url} - ${rt}ms`);
}

export async function timer(ctx: Context, next: () => void) {
  const start = performance.now();
  await next();
  const end = performance.now();
  ctx.response.headers.set("X-Response-Time", `${end - start}`);
}

export async function cors(ctx: Context, next: () => void) {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS, DELETE",
  );

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = Status.NoContent;
  } else {
    await next();
  }
}
