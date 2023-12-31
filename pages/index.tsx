import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  MessageModel,
  ConversationHeader,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import { useEffect, useState } from "react";
import { MessageDirection } from "@chatscope/chat-ui-kit-react/src/types/unions";
import { useUserCredits } from "@chipp/nextjs-chipp/client";

function Home() {
  const [messageList, setMessageList] = useState<MessageModel[]>([]);
  const [msgInputValue, setMsgInputValue] = useState("");
  const [responseGenerating, setResponseGenerating] = useState(false);

  const {
    userCredits,
    refreshBalance,
    isLoading: balanceLoading,
  } = useUserCredits();

  useEffect(() => {
    refreshBalance();
  }, [messageList]);

  // Persist all messages to localStorage
  useEffect(() => {
    // Only load messages from localStorage if there are no messages in state
    if (messageList.length === 0) {
      const messages = JSON.parse(localStorage.getItem("messages") || "[]");
      if (messages.length > 0) {
        setMessageList(messages);
      }
    }

    // Save messages to localStorage
    localStorage.setItem("messages", JSON.stringify(messageList));
  }, [messageList]);

  const handleSend = async (message: string) => {
    setResponseGenerating(true);

    const newList = [
      ...messageList,
      {
        message,
        sentTime: "just now",
        sender: "Me",
        direction: "outgoing" as MessageDirection,
        position: "normal" as MessageModel["position"],
      },
    ];

    setMessageList(newList);
    setMsgInputValue("");

    const response = await fetch("/api/openai", {
      method: "POST",
      body: JSON.stringify({ messageList: newList }),
    });

    const reply = (await response.json()).content;

    const newReplyList = [
      ...newList,
      {
        message: reply,
        sentTime: "just now",
        sender: "OpenAI",
        direction: "incoming" as MessageDirection,
        position: "normal" as MessageModel["position"],
      },
    ];

    setMessageList(newReplyList);
    setResponseGenerating(false);
  };

  return (
    <main>
      <section>
        <div className="h-screen w-screen">
          <MainContainer>
            <ChatContainer>
              <ConversationHeader>
                <Avatar
                  src={
                    "https://ih1.redbubble.net/image.4882611619.7688/st,small,507x507-pad,600x600,f8f8f8.u2.jpg"
                  }
                  name="OpenAI"
                />
                <ConversationHeader.Content
                  userName="PirateGPT"
                  info="GPT-4 by OpenAI"
                />
                <ConversationHeader.Actions>
                  <div className="flex gap-8">
                    <div
                      className={`text-xl font-bold text-center ${
                        balanceLoading ? "opacity-50" : ""
                      }`}
                    >
                      Chipps:{" "}
                      {balanceLoading ? "loading..." : userCredits?.balance}
                    </div>
                  </div>
                </ConversationHeader.Actions>
              </ConversationHeader>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  responseGenerating && (
                    <TypingIndicator content="PirateGPT is thinking" />
                  )
                }
              >
                {messageList.map((message, i) => (
                  <Message key={i} model={message} />
                ))}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                onSend={handleSend}
                onChange={setMsgInputValue}
                value={msgInputValue}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </section>
    </main>
  );
}

export default Home;
