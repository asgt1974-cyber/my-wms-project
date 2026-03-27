import { useState } from 'react';
import WMSScanner from './components/WMSScanner';
import AdminItems from './components/AdminItems';

type Screen = 'wms' | 'admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('wms');

  return (
    <>
      {currentScreen === 'wms' && (
        <WMSScanner onAdminClick={() => setCurrentScreen('admin')} />
      )}
      {currentScreen === 'admin' && (
        <AdminItems onBack={() => setCurrentScreen('wms')} />
      )}
    </>
  );
}

export default App;
