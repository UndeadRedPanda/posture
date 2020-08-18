import React, {useState, useEffect} from 'https://jspm.dev/react@16.13.1';
import { MessageList } from '../../components/MessageList/index.tsx';
import { Message } from '../../components/Message/index.tsx';

export const Messages = () => {
	const [messages, setMessages] = useState({});
	
	useEffect(() => {
		(async () => {
			const response = await fetch('/api/v1/messages');
			const json = await response.json();
			setMessages(json);
		})();
	}, [setMessages]);

	return (
		<>
			<MessageList messages={messages} />
			<Message />
		</>
	);
};