// AnimatedPlaceholder.js
import React, { useEffect, useState } from 'react';
import './AnimatedPlaceholder.scss';

export default function AnimatedPlaceholder({ messages, inputFocused, inputHtml }) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [typing, setTyping] = useState(true); // true: digitando, false: apagando

  useEffect(() => {
    let timeout;
    const fullText = messages[placeholderIdx];
    if (typing) {
      if (placeholderText.length < fullText.length) {
        timeout = setTimeout(() => {
          setPlaceholderText(fullText.slice(0, placeholderText.length + 1));
        }, 30);
      } else {
        // Espera antes de começar a apagar
        timeout = setTimeout(() => setTyping(false), 8000);
      }
    } else {
      if (placeholderText.length > 0) {
        timeout = setTimeout(() => {
          setPlaceholderText(fullText.slice(0, placeholderText.length - 1));
        }, 15);
      } else {
        // Troca para a próxima frase e começa a digitar
        timeout = setTimeout(() => {
          setPlaceholderIdx(idx => (idx + 1) % messages.length);
          setTyping(true);
        }, 300);
      }
    }
    return () => clearTimeout(timeout);
  }, [placeholderText, typing, placeholderIdx, messages]);

  // Quando muda a frase, zera o texto
  useEffect(() => {
    setPlaceholderText('');
  }, [placeholderIdx]);

  if ((inputHtml && inputHtml !== '<br>') || inputFocused) return null;

  return (
    <span className="chat-input-placeholder">{placeholderText}</span>
  );
} 