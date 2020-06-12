import {
	red,
	yellow,
	blue
} from './deps.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function decodeUint8ArrayToString(buffer: Uint8Array): string {
	return decoder.decode(buffer);
}

export function encodeStringToUint8Array(str: string): Uint8Array {
	return encoder.encode(str);
}

export function getValue<T extends Object, V>(opts: T, key: string, isMandatory: boolean):V {
	if (!opts.hasOwnProperty(key) && isMandatory) {
		throw new Deno.errors.BadResource(`Key ${key} is mandatory for this object`);
	}

	return opts[key];
}

export const log = {
	default: (message: string) => {
		console.log(message);
	},
	warn: (message: string) => {
		console.warn(`⚠️ ${yellow(message)}`);
	},
	info: (message: string) => {
		console.warn(`ℹ️ ${blue(message)}`);
	},
	error: (message: string | Error) => {
		const toLog = message instanceof Error ? message : `🛑 ${red(message)}`;
		console.error(toLog);
	},
}