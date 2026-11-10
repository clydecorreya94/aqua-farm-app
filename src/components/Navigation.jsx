import { useApp } from '../AppContext';

const NAV_ITEMS = [
  { k: 'today',  label: 'Today',  icon: '☑' },
  { k: 'feed',   label: 'Feed',   icon: '⚖' },
  { k: 'plan',   label: 'Plan',   icon: '📋' },
  { k: 'water',  label: 'Water',  icon: '💧' },
  { k: 'growth', label: 'Growth', icon: '📈' },
  { k: 'learn',  label: 'Learn',  icon: '📖' },
  { k: 'settings', label: 'Settings', icon: '⚙️' },
];

function getCompletion(state, currentStage, meals) {
  const allIds = ['d1','d2','d3','d4','d5','d6','d7', ...meals.map((_,i) => 'm'+i)];
  const done = allIds.filter(id => state.dailyChecked[id]).length;
  return { done, total: allIds.length, pct: Math.round((done/allIds.length)*100) };
}

const THEME_ICONS = { auto: '🌓', light: '☀️', dark: '🌙' };
const THEME_CYCLE = { auto: 'light', light: 'dark', dark: 'auto' };

export function Sidebar() {
  const { state, dispatch, sp, currentStage, dailyFeed, perMeal, getGreeting, meals, effectiveW } = useApp();
  const { tab, cnt, theme, tankLitres } = state;
  const { pct } = getCompletion(state, currentStage, meals);

  const cycleTheme = () => dispatch({ type: 'SET_THEME', theme: THEME_CYCLE[theme] });

  return (
    <div className="sidebar">
      {/* Brand */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${sp.color}, ${sp.dark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${sp.color}35`, fontSize: 18 }}>🐟</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt-1)' }}>Clyde's AquaFarm</div>
            <div style={{ fontSize: 10, color: 'var(--txt-3)' }}>Kerala · {tankLitres}L Tank</div>
          </div>
          {/* Theme toggle */}
          <button onClick={cycleTheme} title={`Theme: ${theme}`}
            style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border-md)', background: 'var(--bg-surface)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {THEME_ICONS[theme]}
          </button>
        </div>
        <div style={{ background: sp.light, borderRadius: 9, padding: '9px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: sp.dark }}>{getGreeting()} 👋</div>
          <div style={{ fontSize: 10.5, color: sp.color, marginTop: 1, opacity: 0.85 }}>{sp.name} · {cnt} fish · ~{effectiveW.toFixed(1)}g</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--txt-3)', letterSpacing: '0.07em', textTransform: 'uppercase', padding: '0 4px 7px' }}>Navigation</div>
        {NAV_ITEMS.map(item => {
          const isActive = tab === item.k;
          const accentStyle = isActive ? { background: sp.light, color: sp.dark } : {};
          return (
            <button key={item.k} className={`nav-item${isActive ? ' active' : ''}`}
              style={accentStyle}
              onClick={() => dispatch({ type: 'SET', key: 'tab', value: item.k })}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
              {item.k === 'today' && pct > 0 && pct < 100 && (
                <span style={{ marginLeft: 'auto', fontSize: 9, background: sp.light, color: sp.color, padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{pct}%</span>
              )}
              {item.k === 'today' && pct === 100 && <span style={{ marginLeft: 'auto' }}>✅</span>}
            </button>
          );
        })}
      </nav>

      {/* Stats + reset */}
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
          {[['Daily', dailyFeed+'g'], ['Meal', perMeal+'g']].map(([l,v]) => (
            <div key={l} style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: 'var(--txt-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: sp.color }}>{v}</div>
            </div>
          ))}
        </div>
        <button onClick={() => dispatch({ type: 'SET', key: 'showResetConfirm', value: true })}
          style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', color: 'var(--c-danger)', fontSize: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          ↺ Reset app
        </button>
      </div>
    </div>
  );
}

export function BottomNav() {
  const { state, dispatch, sp, currentStage, meals } = useApp();
  const { tab } = state;
  const { pct } = getCompletion(state, currentStage, meals);
  return (
    <div className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button key={item.k} className={`bottom-nav-btn${tab === item.k ? ' active' : ''}`}
          style={tab === item.k ? { background: sp.light, color: sp.color } : {}}
          onClick={() => dispatch({ type: 'SET', key: 'tab', value: item.k })}
          title={item.label}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          <span>{item.label}</span>
          {item.k === 'today' && pct > 0 && pct < 100 && (
            <div style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: '50%', background: sp.color }} />
          )}
        </button>
      ))}
    </div>
  );
}

export function MobileHeader() {
  const { state, dispatch, sp, effectiveW, currentStage } = useApp();
  const { cnt, theme } = state;
  const cycleTheme = () => dispatch({ type: 'SET_THEME', theme: THEME_CYCLE[theme] });
  return (
    <div className="show-mobile" style={{ display: 'none', background: `linear-gradient(135deg, ${sp.color}, ${sp.dark})`, padding: '14px 18px 13px', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Clyde's AquaFarm 🐟</div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{sp.name} · Ernakulam</div>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <button onClick={cycleTheme} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {THEME_ICONS[theme]}
          </button>
          <button onClick={() => dispatch({ type: 'SET', key: 'showResetConfirm', value: true })}
            style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>↺</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
        {[['Fish', cnt], ['~Weight', effectiveW.toFixed(1)+'g'], ['Stage', currentStage.l]].map(([l,v]) => (
          <div key={l} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 9, padding: '7px 10px' }}>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)' }}>{l}</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: '#fff', marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
