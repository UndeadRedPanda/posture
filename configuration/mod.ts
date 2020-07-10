// TODO (William): Allow config to be set outside of this file.

import { readJson } from "../deps.ts";

export interface ConfigurationOptions {
	maxConnections: number;
	debug: boolean;
} 

let config: ConfigurationOptions = {
	maxConnections: 1,
	debug: false,
};

export class Configuration {
	static getConfig() {
		return { ...config };
	}

	static async setConfigWithPath(configPath: string) {
		let json: unknown = await readJson(configPath);
		this.setConfig(json as ConfigurationOptions);
	}

	static setConfig(newConfig: ConfigurationOptions): void {
		config = { ...config, ...newConfig};
	}

	static isDebug(): boolean {
		return config.debug;
	}

	static maxConnections(): number {
		return config.maxConnections;
	}
}