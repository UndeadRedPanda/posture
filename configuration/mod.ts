// TODO (William): Allow config to be set outside of this file.

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
    const data = await Deno.readTextFile(configPath);
    const json: unknown = JSON.parse(data);
    this.setConfig(json as ConfigurationOptions);
  }

  static setConfig(newConfig: ConfigurationOptions): void {
    config = { ...config, ...newConfig };
  }

  static isDebug(): boolean {
    return config.debug;
  }

  static maxConnections(): number {
    return config.maxConnections;
  }
}
