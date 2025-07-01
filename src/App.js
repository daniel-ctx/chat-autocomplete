import React from 'react';
import Chat from './components/Chat';
import './styles/App.scss';
import { IconArrowRight } from '@tabler/icons-react';

function App() {
  return <div className='main'>
    <div className='text-description'>
      <div>
        <h1>Chat autocomplete</h1>
        <h2>Feature para seleção de bases proprietárias do usuários</h2>
        <div className='point'><IconArrowRight /><p>Clique no botão de @inserir ou digite "@" para pesquisar e selecionar a base desejada.</p></div>
        <div className='point'><IconArrowRight /><p>Clique com enter ou com o mouse para inserir a referência no prompt.</p></div>
        <div className='point'><IconArrowRight /><p>Só é possível uma base por prompt.</p></div>
        
      </div>
    </div>
    <div className='content'><Chat /></div>
  </div>;
}

export default App;
