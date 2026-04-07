import { useState } from 'react';
import Header from './components/Header.jsx';
import LoadingOverlay from './components/LoadingOverlay.jsx';
import StudioTab from './components/StudioTab.jsx';
import ScheduleTab from './components/ScheduleTab.jsx';
import DashboardTab from './components/DashboardTab.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  function handleLoading(visible, msg = '') {
    setLoading(visible);
    setLoadingMsg(msg);
  }

  return (
    <>
      <LoadingOverlay visible={loading} message={loadingMsg} />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {activeTab === 'studio'    && <StudioTab onLoading={handleLoading} />}
        {activeTab === 'schedule'  && <ScheduleTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
      </main>
    </>
  );
}
