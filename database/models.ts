import { Model } from '../deps.ts';
import { DataTypes } from '../deps.ts';

const fields = {
	mail: DataTypes.STRING,
	rcpt: DataTypes.STRING,
	data: DataTypes.STRING,
}

class Message extends Model{
	static table = "messages";
	static timestamps = true;
}

export class MessageMongo extends Message {
	static fields = {
		_id: {
			primaryKey: true,
		},
		...fields
	}
}

export class MessageSQL extends Message {
	static fields = {
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
		},
		...fields
	}
}