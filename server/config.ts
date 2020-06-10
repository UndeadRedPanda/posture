// TODO (William): Allow config to be set outside of this file.

export interface Configuration {
	connectionLimit: number;
	debug: boolean;
}

export function getConfig(): Configuration {
	return {
		connectionLimit: 1,
		debug: true,
	}
}