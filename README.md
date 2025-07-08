**https://daniel-ctx.github.io/chat-autocomplete/**

# Chat Autocomplete UX

Este projeto implementa um componente de input para chat com autocomplete de menções a "bases" (tags), servindo como referência para desenvolvedores que desejam criar experiências de prompt avançadas e interativas.

## Funcionalidades Implementadas

### 1. **Autocomplete de Menções (@bases)**
- Digite `@` para abrir uma lista suspensa de sugestões de "bases".
- Sugestões são filtradas dinamicamente conforme o texto digitado após o `@`.
- Navegação na lista por teclado (setas, Enter) e mouse (hover, clique).
- Seleção de sugestão insere uma tag estilizada no input.

### 2. **Tags Estilizadas e Edição Livre**
- Tags de base são renderizadas como elementos destacados e removíveis.
- O usuário pode editar livremente o texto ao redor das tags.
- Apenas uma tag de base é permitida por prompt (comportamento configurável).
- Tentativas de inserir múltiplas tags exibem tooltip informativo.

### 3. **Envio de Mensagem e Loading**
- Mensagem pode ser enviada por Enter (quando dropdown fechado) ou botão de enviar.
- Botão de enviar exibe ícone de seta e muda para ícone de stop durante o processamento da resposta da IA.
- Animação de loading suave (blink) no botão enquanto a IA está processando.
- O botão de enviar fica desabilitado durante o loading, exceto para a função de stop.

### 4. **Função Stop/Cancelar**
- Durante o processamento da resposta da IA, o botão de enviar se transforma em um botão de stop (ícone de stop).
- Ao clicar no botão de stop, o carregamento é imediatamente cancelado e o componente retorna ao estado inicial, pronto para nova entrada.
- O cancelamento é visualmente sinalizado e impede o recebimento da resposta da IA.

### 5. **UX Avançada**
- Placeholder animado e responsivo.
- Botão dedicado para inserir menção abre o dropdown no cursor.
- Scroll automático na lista suspensa para manter item selecionado visível.
- Tooltip informativo para restrições de uso de tags.
- Suporte a contexto: se houver contexto selecionado, permite referenciar a base do contexto no texto.
- Se o usuário tentar enviar apenas o contexto, a tag de base é enviada automaticamente.
- Permite referenciar a tag de contexto no texto, mas impede múltiplas menções.

### 6. **Acessibilidade e Usabilidade**
- Totalmente navegável por teclado e mouse.
- Foco e seleção mantidos ao inserir tags ou navegar na lista.
- Feedback visual claro para estados ativos, loading, restrições e cancelamento.

