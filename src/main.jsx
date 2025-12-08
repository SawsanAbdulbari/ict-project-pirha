// This is the main entry point of the React application.
// It is responsible for rendering the main `App` component into the DOM and setting up global providers like `I18nextProvider`.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Global styles for the application.
import App from './App.jsx' // The main application component.
import { Buffer } from 'buffer'; // Buffer polyfill for Node.js Buffer in the browser.
import { I18nextProvider } from 'react-i18next'; // Provides the i18n context to all components.
import i18n from './i18n'; // The i18n configuration instance.
// This line polyfills Node.js Buffer in the browser, which might be needed by some dependencies.
window.Buffer = Buffer;
// This mounts the React application to the DOM.
createRoot(document.getElementById('root')).render(
  // StrictMode helps in highlighting potential problems in an application.
  <StrictMode>
    {/* I18nextProvider makes the i18n instance available to all components within the App component's tree. */}
    <I18nextProvider i18n={i18n}>
      <App /> {/* The main application component is rendered here. */}
    </I18nextProvider>
  </StrictMode>,
)
