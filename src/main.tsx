import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';

// worker.start()는 MSW에서 브라우저 환경에서 요청을 가로채기 위해 사용되는 메소드입니다. 그러나 Node.js 환경에서의 테스트에서는 worker.start()가 필요하지 않고, 대신 server.listen()을 사용합니다.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
