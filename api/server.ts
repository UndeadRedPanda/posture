import { 
	Application, 
	ApplicationOptions, 
	ListenOptions, 
	ListenOptionsBase, 
	ListenOptionsTls,
	Router
} from '../deps.ts';
import { DatabaseType, MessagesDatabase, DatabaseOptions } from "../database/mod.ts";
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
	db: MessagesDatabase,
}

/**
 * APIServer is the server that will return data from the SMTP Server's database.
 */
export class APIServer {
	public app: Application = new Application();

	public router: Router = new Router();

	private _database: MessagesDatabase;

	constructor(opts: APIOptions) {
		this._database = opts.db;
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
	}

	private _setupRoutes() {
		this.router
			.get('/api/v1/messages', async (context) => {
				const page = context.request.url.searchParams.get('page');
				const count = context.request.url.searchParams.get('count');
				const data = await this._database.getMessages((count && Number(count)) || undefined, (page && Number(page)) || undefined);
				context.response.headers.append("Content-Type", "application/json");
				context.response.body = data;
			})
			.get('/api/v1/messages/:id', async (context) => {
				const id = context?.params?.id;
				const data = await this._database.getMessage(id);
				context.response.headers.append("Content-Type", "application/json");
				context.response.body = data;
			})
			.delete('/api/v1/messages', async (context) => {
				const data = await this._database.deleteMessages();
				context.response.headers.append("Content-Type", "application/json");
				context.response.body = data;
			})
			.delete('/api/v1/messages/:id', async (context) => {
				const id = context?.params?.id;
				const data = await this._database.deleteMessage(id);
				context.response.headers.append("Content-Type", "application/json");
				context.response.body = data;
			})
		this.app.use(this.router.routes());
		this.app.use(this.router.allowedMethods());
	}

	private async _startListening(opts: APIOptions) {
		let listeningOptions = this._getOptions(opts);

		console.log(`🌎 API Server listening at ${listeningOptions.hostname}:${listeningOptions.port}.`);
		await this.app.listen(listeningOptions);
	}
}