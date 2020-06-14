// TODO (William): Replace with ws?

export enum DBType {
	MongoDB,
}

export interface DatabaseOptions {
	type: DBType,
	host: string,
	port: number,
	user: string,
	pass: string,
	name: string,
}

export class Database {
	readonly type: DBType;
	private _conn: Deno.Conn | undefined;

	constructor(opts: DatabaseOptions) {
		this.type = opts.type;
		// this._connect(opts);
	}

	private async _connect(opts: DatabaseOptions) {
		this._conn = await Deno.connect({
			hostname: this._getHostFromType(this.type, opts),
			port: opts.port,
		});
	}

	private _getHostFromType(type: DBType, opts: DatabaseOptions): string {
		switch(type) {
			case DBType.MongoDB:
				return `mongodb://${opts.user}:${opts.pass}@${opts.host}:${opts.port}/?replicaSet=${opts.name}`;
			default:
				throw new Deno.errors.BadResource("Unsupported Database type");
		}
	}
}