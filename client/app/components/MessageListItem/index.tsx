import React from "https://esm.sh/react@17.0.1";
import { Link } from "https://esm.sh/react-router-dom@5.2.0";

import { MessageData } from "../../@types/index.ts";

interface MessageListItemProps {
  message: MessageData;
}

export const MessageListItem: React.FC<MessageListItemProps> = ({
  message,
}) => {
  console.log(message);

  return (
    <Link to={`/message/${message.id}`} className="message-item">
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
