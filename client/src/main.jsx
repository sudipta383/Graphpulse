
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo/apolloClient';
import Chat from './components/Chat';

import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <Chat />
    </ApolloProvider>
  </React.StrictMode>
);
