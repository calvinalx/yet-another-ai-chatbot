import React, { useState, useRef } from 'react';
import { ArrowDown, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isStreaming?: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showScrollIcon, setShowScrollIcon] = useState(false);

  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const lastCardRef = useRef<HTMLDivElement>(null);
  const lastUserCardRef = useRef<HTMLDivElement>(null);

  const getNextMessageId = () => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  };

  const sampleResponses = [
    "Thank you for your message! I'm processing your request...",
    'stream '.repeat(1 * 130),
  ];

  const streamMessage = async (messageId: number) => {
    const response =
      sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
    let streamedText = '';

    for (let i = 0; i < response.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      streamedText += response[i];
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, text: streamedText } : msg
        )
      );
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      )
    );

    if (getContainerHeight() === 0) {
      setShowScrollIcon(true);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message with explicit user flag
    const userMessageId = getNextMessageId();
    const botMessageId = getNextMessageId();

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        text: inputValue,
        isUser: true,
      },
      {
        id: botMessageId,
        text: '',
        isUser: false,
        isStreaming: true,
      },
    ]);

    // Clear input and begin streaming the response
    setInputValue('');
    setTimeout(() => {
      handleScrollDown();
    }, 100);
    streamMessage(botMessageId);

  };

  const handleScrollDown = () => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getContainerHeight = () => {
    const containerHeight = messageContainerRef.current?.clientHeight ?? 0;
    const lastCardHeight = lastCardRef.current?.clientHeight ?? 0;
    const secondLastCardHeight = lastUserCardRef.current?.clientHeight ?? 0;
    const calculatedHeight = containerHeight - (lastCardHeight + secondLastCardHeight);
    return calculatedHeight < 0 ? 0 : calculatedHeight - 24;
  };

  const handleScroll = () => {
    setShowScrollIcon(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="bg-indigo-600 text-white p-4">
            <h1 className="text-xl font-semibold">Yet Another AI Chatbot</h1>
          </div>

          {/* Messages Container */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto p-4 relative"
            onScroll={handleScroll}
          >
            {messages.map((message, i) => {
              const isLastMessage = i === messages.length - 1;
              const isSecondLastMessage = i === messages.length - 2;
              
              return (
                <div
                  ref={
                    isLastMessage
                      ? lastCardRef
                      : isSecondLastMessage
                      ? lastUserCardRef
                      : null
                  }
                  key={message.id}
                  className={`flex mb-2 ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse ml-1" />
                    )}
                  </div>
                </div>
              );
            })}
            <div
              style={{
                height: getContainerHeight(),
              }}
              ref={messagesEndRef}
            />
            {showScrollIcon && <div className="absolute bottom-10 right-9 p-4">
              <div className="fixed flex items-center justify-center">
                <button className="bg-gray-400 text-white p-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ArrowDown size={20} onClick={handleScrollDown} />
                </button>
              </div>
            </div>}
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="flex items-end space-x-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] max-h-32"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
