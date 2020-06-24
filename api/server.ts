import { 
	Application, 
	ApplicationOptions, 
	ListenOptions, 
	ListenOptionsBase, 
	ListenOptionsTls,
	Router
} from '../deps.ts';
import { DBType, Database } from "../database/mod.ts";
import { logger, timer, cors } from './middlewares.ts';
import { getValue } from '../utils/mod.ts';

/**
 * APIOptions lists all options for the APIServer.
 * 
 * None are required as APIServer has default alternatives set in place.
 */
export interface APIOptions {
	port?: number,
	host?: string,
	useTLS?: boolean,
	cert?: string,
	key?: string,
	dbType?: DBType,
	dbName?: string,
	dbPort?: number,
	dbHost?: string,
	dbUser?: string,
	dbPass?: string,
}

/**
 * APIServer is the server that will return data from the SMTP Server's database.
 */
export class APIServer {
	public app: Application = new Application();

	public router: Router = new Router();

	constructor(opts: APIOptions = {}) {
		this._setupMiddlewares();
		this._setupRoutes();
		this._startListening(opts);
	}

	private _getOptions(opts: APIOptions): ListenOptions {
		opts.host = opts.host || "0.0.0.0";
		opts.port = opts.port || 3000;

		return opts.useTLS ? this._getTLSOptions(opts) : this._getBaseOptions(opts);
	}

	private _getBaseOptions(opts: APIOptions): ListenOptionsBase {
		return {
			hostname: opts.host,
			port: opts.port as number
		};
	}

	private _getTLSOptions(opts: APIOptions):ListenOptionsTls {
		return {
			hostname: opts.host,
			port: opts.port as number,
			certFile: getValue(opts, "cert", true) as string,
			keyFile: getValue(opts, "key", true) as string,
			secure: true,
		}
	}

	private _setupMiddlewares() {
		this.app.use(logger);
		this.app.use(timer);
		this.app.use(cors);
		// TODO WT: Add a graphql middleware?
	}

	private _setupRoutes() {
		// TODO WT: Setup fetching routes
		this.app.use(this.router.routes());
	}

	private async _startListening(opts: APIOptions) {
		let listeningOptions = this._getOptions(opts);

		console.log(`🌎 API Server listening at ${listeningOptions.hostname}:${listeningOptions.port}.`);
		await this.app.listen(listeningOptions);
	}
}