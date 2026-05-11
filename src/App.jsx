import { useApp } from './AppContext';
import Setup from './components/Setup';
import { Sidebar, BottomNav, MobileHeader } from './components/Navigation';
import Today from './components/Today';
import { Feed, Plan, Water, Learn } from './components/Tabs';
import Growth from './components/Growth';
import Settings from './components/Settings';
import { ConfirmModal, ResetConfirmModal } from './components/UI';

function MainApp() {
  const { state } = useApp();
  const { tab } = state;

  const content = {
    today:    <Today />,
    feed:     <Feed />,
    plan:     <Plan />,
    water:    <Water />,
    growth:   <Growth />,
    learn:    <Learn />,
    settings: <Settings />,
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrap">
        <MobileHeader />
        <div className="fade-up" key={tab} style={{ flex:1, display:'flex', flexDirection:'column' }}>
          {content[tab] || <Today />}
        </div>
      </div>
      <BottomNav />
      <ConfirmModal />
      <ResetConfirmModal />
    </div>
  );
}

export default function App() {
  const { state } = useApp();
  return state.screen === 'setup' ? <Setup /> : <MainApp />;
}
