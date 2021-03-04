import React, { useEffect, useState } from "https://esm.sh/react@17.0.1";
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
