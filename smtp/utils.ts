import {
	red,
	yellow,
	blue
} from './deps.ts';

export function getValue<T, K extends keyof T>(opts: T, key: K, isMandatory: boolean):T[K] {
	if (!opts[key] && isMandatory) {
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