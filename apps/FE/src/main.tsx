import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import App from './app/app';
import ProgressLoader from './components/ProgressLoader';
import { persistor, store } from './store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<ProgressLoader />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
