import React from 'react';
import Chat from './Chat'; 

function App() {
  return <div className='main'>
    <div className='text-description'>
      <div>
        <h1>Chat autocomplete</h1>
        <h2>Feature para seleção de bases proprietárias do usuários</h2>
        <p>Clique no botão de @inserir ou digite "@" para pesquisar e selecionar a base desejada</p>
        <p>Clique com enter ou com o mouse para inserir a referência no prompt.  </p>
      </div>
    </div>
    <div className='content'><Chat /></div>
  </div>;
}

export default App;
