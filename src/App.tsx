import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import MultiStepForm from './components/MultiStepForm';

function App() {
  return (
    <LanguageProvider>
      <MultiStepForm />
    </LanguageProvider>
  );
}

export default App;