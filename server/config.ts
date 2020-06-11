// TODO (William): Allow config to be set outside of this file.

export interface Configuration {
	connectionLimit: number;
	debug: boolean;
	pingInterval: number;
}

export function getConfig(): Configuration {
	return {
		connectionLimit: 1,
		debug: true,
		pingInterval: 10000,
	}
}