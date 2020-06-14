// TODO (William): Allow config to be set outside of this file.

export interface ConfigurationOptions {
	maxConnections: number;
	debug: boolean;
	saveEmailsToDatabase: boolean;
} 

let config: ConfigurationOptions = {
	maxConnections: 1,
	debug: false,
	saveEmailsToDatabase: false,
};

export class Configuration {
	static getConfig() {
		return { ...config };
	}

	static setConfig(newConfig: Configuration): void {
		config = { ...config, ...newConfig};
	}

	static setConfigWithPath(configPath: string) {
		
	}

	static isDebug(): boolean {
		return config.debug;
	}

	static maxConnections(): number {
		return config.maxConnections;
	}

	static saveEmailsToDatabase(): boolean {
		return config.saveEmailsToDatabase;
	}
}