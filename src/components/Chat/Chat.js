import React, { useState, useRef, useEffect } from 'react';
import { RightOutlined } from '@ant-design/icons';
import logo from '../../img/logo.svg';
import './Chat.scss';
import aiResponses from './aiResponses';

import MessageLog from '../MessageLog';
import ChatPromptInput from '../ChatPromptInput';
import { useRef as useReactRef } from 'react';


const getRandomAiResponse = () => {
  const idx = Math.floor(Math.random() * aiResponses.length);
  return aiResponses[idx];
};

const initialAiGreeting = { sender: 'ai', text: 'Olá! Sou o Cortex AI, estou aqui para te ajudar a explorar, analisar e entender seus dados geográficos. O que deseja fazer agora?' };

// Retorna um tempo aleatório inteiro de segundos entre min e max (em ms)
function getRandomDelay(min = 1, max = 8) {
  const seconds = Math.floor(Math.random() * (max - min + 1)) + min;
  return seconds * 1000;
}

const Chat = () => {
  const [messages, setMessages] = useState([initialAiGreeting]);
  const [mentionsValue, setMentionsValue] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [pendingAiMsg, setPendingAiMsg] = useState('');
  const [showTypewriter, setShowTypewriter] = useState(false);
  const messagesEndRef = useRef(null);
  const [prompt, setPrompt] = useState('');
  const aiTimeoutRef = useReactRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping, showTypewriter]);

  const handleSend = (e) => {
    e.preventDefault();
    const textToSend = mentionsValue.trim();
    if (!textToSend) return;
    setMessages([...messages, { sender: 'user', text: textToSend }]);
    setMentionsValue('');
    setAiTyping(true);
    setShowTypewriter(false);
    const aiMsg = getRandomAiResponse();
    setPendingAiMsg(aiMsg);
    aiTimeoutRef.current = setTimeout(() => {
      setShowTypewriter(true);
    }, getRandomDelay());
  };

  const handleCancelAi = () => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setAiTyping(false);
    setShowTypewriter(false);
    setPendingAiMsg('');
  };

  return (
    <div className="chat-onmaps">
      <header className="chat-header">
        <img src={logo} alt="logo" style={{ cursor: 'pointer' }} onClick={() => setMessages([initialAiGreeting])} />
        <span className="chat-chevron"><RightOutlined /></span>
      </header>
      <MessageLog
        messages={messages}
        aiTyping={aiTyping}
        showTypewriter={showTypewriter}
        pendingAiMsg={pendingAiMsg}
        onTypewriterEnd={() => {
          setMessages((msgs) => [
            ...msgs,
            { sender: 'ai', text: pendingAiMsg }
          ]);
          setAiTyping(false);
          setShowTypewriter(false);
          setPendingAiMsg('');
        }}
        messagesEndRef={messagesEndRef}
      />
      <form className="chat-footer" onSubmit={handleSend}>
        <ChatPromptInput
          value={prompt}
          onChange={setPrompt}
          onSend={text => {
            if (!text.trim()) return;
            setMessages([...messages, { sender: 'user', text }]);
            setPrompt('');
            setAiTyping(true);
            setShowTypewriter(false);
            const aiMsg = getRandomAiResponse();
            setPendingAiMsg(aiMsg);
            aiTimeoutRef.current = setTimeout(() => {
              setShowTypewriter(true);
            }, getRandomDelay());
          }}
          aiTyping={aiTyping}
          onCancelAi={handleCancelAi}
        />
      </form>
    </div>
  );
};

export default Chat; 