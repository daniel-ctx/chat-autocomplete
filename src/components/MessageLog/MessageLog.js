import React from 'react';
import './MessageLog.scss';
import { IconSparkles } from '@tabler/icons-react';
import { marked } from 'marked';

export const UserMessage = ({ text }) => (
  <div className="user-message">
    <span>{text}</span>
  </div>
);

export const AiMessage = ({ text, typewriter, onTypewriterEnd }) => {
  const [displayed, setDisplayed] = React.useState(typewriter ? '' : text);
  React.useEffect(() => {
    if (typewriter) {
      setDisplayed('');
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i === text.length) {
          clearInterval(interval);
          if (onTypewriterEnd) onTypewriterEnd();
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [text, typewriter, onTypewriterEnd]);

  return (
    <div className="ai-message">
      <span className="chat-ai-icon"><IconSparkles size={20} stroke={2} /></span>
      <p
        className="ai-message-markdown"
        dangerouslySetInnerHTML={{ __html: marked.parse(typewriter ? displayed : text) }}
      />
      {typewriter && displayed.length < text.length && (
        <span className="ai-typing-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      )}
    </div>
  );
};

export default function MessageLog({ messages, aiTyping, showTypewriter, pendingAiMsg, onTypewriterEnd, messagesEndRef }) {
  return (
    <div className="message-log">
      {messages.map((msg, idx) =>
        msg.sender === 'user' ? (
          <UserMessage key={idx} text={msg.text} />
        ) : (
          <AiMessage key={idx} text={msg.text} typewriter={false} />
        )
      )}
      {aiTyping && !showTypewriter && (
        <div className="ai-message">
          <span className="chat-ai-icon"><IconSparkles size={20} stroke={2} /></span>
          <span className="ai-typing-dots"><span>Processando.</span><span>.</span><span>.</span></span>
        </div>
      )}
      {aiTyping && showTypewriter && (
        <AiMessage text={pendingAiMsg} typewriter={true} onTypewriterEnd={onTypewriterEnd} />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
} 