import React, { useState, useRef, useEffect } from 'react';
import { RightOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { marked } from 'marked';
import logo from './img/logo.svg';
import './Chat.scss';
import aiResponses from './aiResponses';
import { IconSparkles } from '@tabler/icons-react';
import ContentEditable from 'react-contenteditable';

const UserMessage = ({ text }) => (
  <div className="user-message">
    <span>{text}</span>
  </div>
);

const AiMessage = ({ text, typewriter, onTypewriterEnd }) => {
  const [displayed, setDisplayed] = useState(typewriter ? '' : text);
  useEffect(() => {
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

const getRandomAiResponse = () => {
  const idx = Math.floor(Math.random() * aiResponses.length);
  return aiResponses[idx];
};

const initialAiGreeting = { sender: 'ai', text: 'Olá! Como posso ajudar você hoje?' };

const highlightTags = (text) => {
  return text.replace(/(@\w+)/g, '<span class="chat-tag">$&</span>\u200B');
};

// Sugestões de exemplo (pode ser importado de outro arquivo se desejar)
const TAG_SUGGESTIONS = [
  'casa', 'carro', 'academia', 'trabalho', 'parque', 'escola', 'restaurante', 'mercado', 'farmacia', 'padaria',
  'praia', 'shopping', 'hospital', 'hotel', 'igreja', 'cinema', 'bar', 'piscina', 'universidade', 'petshop', 'banco'
];

const Chat = () => {
  const [messages, setMessages] = useState([initialAiGreeting]);
  const [inputHtml, setInputHtml] = useState('');
  const [tags, setTags] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [pendingAiMsg, setPendingAiMsg] = useState('');
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const messagesEndRef = useRef(null);
  const contentEditableRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping, showTypewriter]);

  const handleSend = (e) => {
    e.preventDefault();
    const textToSend = contentEditableRef.current.el.current.innerText.trim();

    if (!textToSend) return;

    setMessages([...messages, { sender: 'user', text: textToSend }]);

    setInputHtml('');
    setTags([]);
    setAiTyping(true);
    setShowTypewriter(false);
    const aiMsg = getRandomAiResponse();
    setPendingAiMsg(aiMsg);
    setTimeout(() => {
      setShowTypewriter(true);
    }, 2000);
  };

  const handleInputChange = (e) => {
    const rawText = contentEditableRef.current.el.current.innerText;
    const cleanText = rawText.replace(/\u200B/g, '');
    const newHtml = highlightTags(cleanText);
    setInputHtml(newHtml);

    // Detecta se está digitando uma tag
    const match = /(^|\s)@(\w*)$/.exec(cleanText);
    if (match) {
      const search = match[2].toLowerCase();
      const filtered = TAG_SUGGESTIONS.filter(item => item.toLowerCase().includes(search) && !tags.includes(item));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setSelectedSuggestion(prev => {
        if (e.key === 'ArrowDown') return (prev + 1) % suggestions.length;
        if (e.key === 'ArrowUp') return (prev - 1 + suggestions.length) % suggestions.length;
        return prev;
      });
      return;
    }
    if (showSuggestions && e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        insertTagFromSuggestion(suggestions[selectedSuggestion]);
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  function insertTagFromSuggestion(tag) {
    // Substitui o @texto atual pela sugestão escolhida
    const rawText = contentEditableRef.current.el.current.innerText.replace(/\u200B/g, '');
    const newText = rawText.replace(/(@\w*)$/, `@${tag} `);
    setInputHtml(highlightTags(newText));
    setShowSuggestions(false);
  }

  const handleTagRemove = (removedTag) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleTypewriterEnd = () => {
    setMessages((msgs) => [
      ...msgs,
      { sender: 'ai', text: pendingAiMsg }
    ]);
    setAiTyping(false);
    setShowTypewriter(false);
    setPendingAiMsg('');
  };

  const handleLogoClick = () => {
    setMessages([initialAiGreeting]);
    setInputHtml('');
    setTags([]);
    setAiTyping(false);
    setPendingAiMsg('');
    setShowTypewriter(false);
  };

  return (
    <div className="chat-onmaps">
      <header className="chat-header">
        <img src={logo} alt="logo" style={{ cursor: 'pointer' }} onClick={handleLogoClick} />
        <span className="chat-chevron"><RightOutlined /></span>
      </header>
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
            <span className="ai-typing-dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}
        {aiTyping && showTypewriter && (
          <AiMessage text={pendingAiMsg} typewriter={true} onTypewriterEnd={handleTypewriterEnd} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-footer" onSubmit={handleSend}>
        <div className="chat-input-wrapper" onClick={() => contentEditableRef.current?.el.current?.focus()}>
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleTagRemove(tag)}
            >
              @{tag}
            </Tag>
          ))}
          <ContentEditable
            ref={contentEditableRef}
            className="chat-input"
            html={inputHtml}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            tagName="div"
          />
          {showSuggestions && (
            <ul className="chat-suggestions">
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  className={i === selectedSuggestion ? 'selected' : ''}
                  onMouseDown={() => insertTagFromSuggestion(s)}
                >
                  @{s}
                </li>
              ))}
            </ul>
          )}
        <button className="chat-send-btn" type="submit">
          <ArrowUpOutlined />
        </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 