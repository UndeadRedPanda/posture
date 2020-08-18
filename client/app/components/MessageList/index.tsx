import React from 'https://jspm.dev/react@16.13.1';
import { MessagesData } from '../../@types/index.ts';
import { Link, useRouteMatch } from 'https:///jspm.dev/react-router-dom@5.2.0';
import { MessageListItem } from '../MessageListItem/index.tsx';

interface MessageListProps {
	messages: MessagesData;
}

export const MessageList: React.FC<MessageListProps> = ({messages}: MessageListProps) => {
	return (
		<aside className="message-list">
			<header className="message-list__header">
				<h2>{messages?.data?.length} messages</h2>
			</header>
			{/* <>{messages.data.map((message) => <MessageListItem message={message}>)}</> */}
		</aside>
	);
};