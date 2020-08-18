interface MessagesData {
	data: MessageData[];
	perPage: number;
	page: number;
	count: number;
}

interface MessageData {
	id: string | number;
	from: string;
	to: string;
	data: string;
}