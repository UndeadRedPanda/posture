export enum DBType {
	MongoDB,
	MySQL, // Currently unsupported
	PostgreSQL, // Currently unsupported
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
	readonly conn: Deno.Conn;
	constructor(opts: DatabaseOptions) {
		this.type = opts.type;
		this._connect(opts);
	}

	private _connect(opts: DatabaseOptions) {

	}
}