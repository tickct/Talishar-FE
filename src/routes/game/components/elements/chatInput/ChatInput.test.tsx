import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import ChatInput from './ChatInput';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <ChatInput />
    </Provider>
  );
});
