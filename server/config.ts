// TODO (William): Allow config to be set outside of this file.

export interface Configuration {
	connection: {
		limit: number,
		buffer: number,
	};
	debug: boolean;
}

export function getConfig(): Configuration {
	return {
		connection: {
			limit: 1,
			buffer: 1024
		},
		debug: true,
	}
}