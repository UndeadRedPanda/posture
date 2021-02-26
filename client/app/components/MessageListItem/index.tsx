import React from "https://jspm.dev/react@16.13.1";
import { MessageData } from "../../@types/index.ts";
import { Link, useRouteMatch } from "https:///jspm.dev/react-router-dom@5.2.0";

interface MessageListItemProps {
  message: MessageData;
}

export const MessageListItem: React.FC<MessageListItemProps> = (
  { message }: MessageListItemProps,
) => {
  const { url } = useRouteMatch();
  return (
    <Link to={`${url}/${message.id}`} className="message-item">
      {JSON.stringify(message)}
      <div className="message-item__details">
        <span className="message-item__title">Message title</span>
        <span className="message-item__preview">Preview message</span>
      </div>
      <div className="message-item__info">
        <time title="Monday, 20 December 2020 at 12:00">12:00</time>
      </div>
    </Link>
  );
};
