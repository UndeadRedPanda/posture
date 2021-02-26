import React, { useEffect, useState } from "https://jspm.dev/react@16.13.1";
import { MessageList } from "../../components/MessageList/index.tsx";
import { Message } from "../../components/Message/index.tsx";

export const Messages = () => {
  const [messages, setMessages] = useState({});

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/v1/messages");
      const json = await response.json();
      setMessages(json);
    })();
  }, []);

  return (
    <>
      <MessageList messages={messages} />
      <Message />
    </>
  );
};
