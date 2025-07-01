import React, { useRef, useState, useEffect } from 'react';
import './ChatPromptInput.scss';
import { IconAt, IconPlayerStop, IconX } from '@tabler/icons-react';
import { ArrowUpOutlined } from '@ant-design/icons';
import AnimatedPlaceholder from '../AnimatedPlaceholder';

const BASE_SUGGESTIONS = [
  'areas_quentes',
  'base_1',
  'base_2',
  'lojas jun-2025',
  'lojas mai-2025',
  'lojas abr-2025'
];

export default function ChatPromptInput({ value, onChange, onSend, onInsertBase, aiTyping, onCancelAi }) {
  const inputRef = useRef();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredBases, setFilteredBases] = useState(BASE_SUGGESTIONS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lastCaret, setLastCaret] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [focused, setFocused] = useState(false);
  const [hasText, setHasText] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const tooltipTimeoutRef = useRef();
  const [selectedTag, setSelectedTag] = useState(null);
  const itemRefs = useRef([]);

  // Atualiza value externo e estado de texto
  useEffect(() => {
    if (onChange) onChange(getPlainText());
    setHasText(!!getPlainText().trim() || selectedTag !== null);
    // eslint-disable-next-line
  }, []);

  // Helper para pegar texto puro
  function getPlainText() {
    return inputRef.current?.innerText || '';
  }

  // Helper para inserir HTML no cursor
  function insertHtmlAtCaret(html) {
    let sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node, lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        // Move caret após a tag
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }

  // Helper para contar tags
  function hasTag() {
    return selectedTag !== null;
  }

  // Verifica se o texto digitado é uma referência à tag já selecionada
  function isReferencingSelectedTag(text) {
    if (!selectedTag) return false;
    const match = text.match(/@([\w\u00C0-\u017F-]*)$/);
    if (!match) return false;
    return match[1].toLowerCase() === selectedTag.toLowerCase();
  }

  // Detecta @ e abre dropdown (apenas se não houver tag)
  function handleInput(e) {
    if (hasTag()) {
      const textUntilCursor = inputRef.current.innerText;
      const match = textUntilCursor.match(/@([\w\u00C0-\u017F-]*)$/);
      if (match && selectedTag) {
        if (selectedTag.toLowerCase().startsWith(match[1].toLowerCase())) {
          setShowDropdown(true);
          setFilteredBases([selectedTag]);
          setSelectedIdx(0);
          if (onChange) onChange(inputRef.current.innerText);
          setHasText(!!inputRef.current.innerText.trim() || selectedTag !== null);
          return;
        } else if (match[1].length > 0) {
          // Se digitou algo diferente, mostra tooltip
          setShowDropdown(false);
          setFilteredBases(BASE_SUGGESTIONS);
          setSelectedIdx(0);
          if (onChange) onChange(inputRef.current.innerText);
          setHasText(!!inputRef.current.innerText.trim() || selectedTag !== null);
          setTooltip(true);
          clearTimeout(tooltipTimeoutRef.current);
          tooltipTimeoutRef.current = setTimeout(() => setTooltip(false), 2000);
          return;
        }
      }
      setShowDropdown(false);
      setFilteredBases(BASE_SUGGESTIONS);
      setSelectedIdx(0);
      if (onChange) onChange(inputRef.current.innerText);
      setHasText(!!inputRef.current.innerText.trim() || selectedTag !== null);
      // Mostra tooltip apenas se tentar digitar exatamente o caractere @
      const isAtAttempt = (e.inputType === 'insertText' && e.data === '@') ||
        (!e.inputType && inputRef.current.innerText.endsWith('@'));
      if (isAtAttempt) {
        setTooltip(true);
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = setTimeout(() => setTooltip(false), 2000);
      }
      return;
    }
    const sel = window.getSelection();
    setLastCaret(sel && sel.getRangeAt && sel.rangeCount ? sel.getRangeAt(0) : null);
    let textUntilCursor = '';
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(inputRef.current);
      preRange.setEnd(range.endContainer, range.endOffset);
      textUntilCursor = preRange.toString();
    } else {
      textUntilCursor = inputRef.current.innerText;
    }
    const match = textUntilCursor.match(/@([\w\u00C0-\u017F-]*)$/);
    if (match) {
      setShowDropdown(true);
      filterBases(match[1]);
    } else {
      setShowDropdown(false);
      setFilteredBases(BASE_SUGGESTIONS);
      setSelectedIdx(0);
    }
    if (onChange) onChange(inputRef.current.innerText);
    setHasText(!!inputRef.current.innerText.trim() || selectedTag !== null);
  }

  function filterBases(query) {
    if (!query) {
      setFilteredBases(BASE_SUGGESTIONS);
      setSelectedIdx(0);
      return;
    }
    const q = query.toLowerCase();
    const filtered = BASE_SUGGESTIONS.filter(b => b.toLowerCase().includes(q));
    setFilteredBases(filtered);
    setSelectedIdx(0);
  }

  // Navegação teclado
  function handleKeyDown(e) {
    if (showDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(idx => (idx + 1) % filteredBases.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(idx => (idx - 1 + filteredBases.length) % filteredBases.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredBases.length > 0) {
          handleSelectBase(filteredBases[selectedIdx]);
        }
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      if (aiTyping) {
        e.preventDefault(); // Não envia nada enquanto loading
        return;
      }
      e.preventDefault();
      if (onSend) onSend(getTextToSend());
      inputRef.current.innerHTML = '';
      if (onChange) onChange('');
      setHasText(false);
      setSelectedTag(null);
    }
  }

  // Seleciona base
  function handleSelectBase(base) {
    const cameFromDropdown = showDropdown;
    // Se já existe contexto e tentar selecionar outra base, mostra tooltip
    if (selectedTag && base.toLowerCase() !== selectedTag.toLowerCase()) {
      setTooltip(true);
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => setTooltip(false), 2000);
      setShowDropdown(false);
      return;
    }
    setShowDropdown(false);
    setSelectedTag(base);
    setHasText(!!getPlainText().trim() || base !== null);
    if (cameFromDropdown) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        // Move o range para cobrir o @palavra antes do cursor
        const node = range.startContainer;
        let text = node.textContent;
        const match = text.slice(0, range.startOffset).match(/@([\w\u00C0-\u017F-]*)$/);
        if (match) {
          const start = range.startOffset - match[0].length;
          range.setStart(node, start);
          // Remove o @palavra
          range.deleteContents();
          // Insere a tag
          const el = document.createElement('span');
          el.className = 'chat-tag';
          el.contentEditable = 'false';
          el.textContent = `@${base}`;
          range.insertNode(el);
          // Espaço após a tag
          const space = document.createTextNode(' ');
          el.after(space);
          // Move o cursor após o espaço
          range.setStartAfter(space);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
    if (onChange) onChange(getPlainText());
    setTimeout(() => inputRef.current.focus(), 0);
  }

  // Botão inserir base (só se não houver tag)
  function handleInsertBase() {
    if (hasTag()) return;
    inputRef.current.focus();
    insertHtmlAtCaret('@');
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.setStart(range.endContainer, range.endOffset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    setShowDropdown(true);
    setFilteredBases(BASE_SUGGESTIONS);
    setSelectedIdx(0);
  }

  // Inserir contexto via botão (sem modificar texto)
  function handleInsertContext() {
    if (hasTag()) return;
    // Abre dropdown para seleção
    setShowDropdown(true);
    setFilteredBases(BASE_SUGGESTIONS);
    setSelectedIdx(0);
    inputRef.current.focus();
  }

  // Permite apagar tags normalmente
  function handleBeforeInput(e) {
    // Permite edição normal
  }

  // Clique na tag para remover
  function handleClick(e) {
    if (e.target.classList.contains('chat-tag')) {
      e.preventDefault();
      e.target.remove();
      setSelectedTag(null);
      if (onChange) onChange(getPlainText());
    }
  }

  // Remove tag do botão
  function handleRemoveTag() {
    setSelectedTag(null);
    setHasText(!!getPlainText().trim());
    // Remove a tag do input também
    const tagElement = inputRef.current?.querySelector('.chat-tag');
    if (tagElement) {
      tagElement.remove();
      if (onChange) onChange(getPlainText());
    }
  }

  // Limpa timeout do tooltip ao desmontar
  useEffect(() => {
    return () => clearTimeout(tooltipTimeoutRef.current);
  }, []);

  // Helper para pegar texto a ser enviado
  function getTextToSend() {
    const plainText = getPlainText().trim();
    if (plainText) {
      return plainText;
    }
    // Se não há texto mas há contexto selecionado, envia o nome da tag com @
    if (selectedTag) {
      return `@${selectedTag}`;
    }
    return '';
  }

  useEffect(() => {
    if (showDropdown && itemRefs.current[selectedIdx]) {
      itemRefs.current[selectedIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx, showDropdown]);

  return (
    <div className="chat-prompt-input-wrapper" style={{ position: 'relative' }}>
      {tooltip && (
        <span className="chat-tooltip">Só é possível inserir uma base por mensagem.</span>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
        <div
          className="chat-prompt-input"
          contentEditable
          ref={inputRef}
          spellCheck={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          onClick={handleClick}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          data-placeholder="Digite sua mensagem. Use @ para inserir uma base."
          style={{ minHeight: 60, outline: 'none', whiteSpace: 'pre-wrap', flex: 1, position: 'relative' }}
        />
        <div className='input-actions'>
          <button
            type="button"
            className="chat-add-context"
            onClick={handleInsertContext}
            disabled={hasTag()}
          >
            <IconAt size={12} />
            Inserir contexto
          </button>
          {selectedTag && (
            <button
              type="button"
              className="chat-context"
              
            >
              <IconAt  />
              {selectedTag}
              <IconX className='close-ic' onClick={handleRemoveTag}/>
            </button>
          )}
          <button
            className={`chat-send-btn${hasText && !aiTyping ? ' active' : ''}${aiTyping ? ' loading' : ''}`}
            type="button"
            onClick={() => {
              if (aiTyping) {
                if (onCancelAi) onCancelAi();
              } else {
                if (!showDropdown && onSend && hasText) {
                  onSend(getTextToSend());
                  inputRef.current.innerHTML = '';
                  if (onChange) onChange('');
                  setHasText(false);
                  setSelectedTag(null);
                }
              }
            }}
            disabled={aiTyping && !onCancelAi || !hasText && !aiTyping}
          >
            {aiTyping ? <IconPlayerStop /> : <ArrowUpOutlined />}
          </button>
        </div>
      </div>
      {/* Placeholder animado sobre o input */}
      {(!inputRef.current || !inputRef.current.innerText.trim()) && !focused && (
        <AnimatedPlaceholder
          messages={[
            'Digite aqui para adicionar uma nova camada ao mapa',
            'Tem alguma dúvida? Escreva aqui',
            'Digite aqui para criar uma camada ou para tirar uma dúvida',
            'Descreva a camada a ser criada ou pergunte algo',
            'Digite @ para inserir um contexto de uma base de dados',
            'Precisa de ajuda com o mapa? Fale aqui',
            'Vamos explorar o mapa juntos? Escreva aqui a sua ideia',
          ]}
          inputFocused={focused}
          inputHtml={inputRef.current ? inputRef.current.innerHTML : ''}
        />
      )}
      {showDropdown && (
        <div className="chat-suggestions-dropdown">
          <h3>Bases disponíveis</h3>
          <ul>
            {filteredBases.length === 0 ? (
              <li className="no-suggestion">Resultado não encontrado</li>
            ) : (
              filteredBases.map((base, i) => (
                <li
                  ref={el => itemRefs.current[i] = el}
                  key={base}
                  className={(hoveredIdx === i || (hoveredIdx === null && selectedIdx === i)) ? 'selected' : ''}
                  onMouseDown={e => e.preventDefault()}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={e => {
                    e.preventDefault();
                    handleSelectBase(base);
                  }}
                >
                  {base}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}