import React from "https://esm.sh/react";

import { MessagesData } from "../../@types/index.ts";
import { MessageListItem } from "../MessageListItem/index.tsx";

interface MessageListProps {
  messages: MessagesData;
}

export const MessageList: React.FC<MessageListProps> = (
  { messages }: MessageListProps,
) => {
  return (
    <aside className="message-list">
      <header className="message-list__header">
        <h2>{messages?.count} message{messages?.count !== 1 ? "" : "s"}</h2>
      </header>
      {messages.data?.map((message: MessageData) => (
        <MessageListItem key={message.id} message={message} />
      ))}
    </aside>
  );
};
