import { useApp } from '../AppContext';

export function Chip({ label, color, bg }) {
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:500, whiteSpace:'nowrap', color, background:bg }}>{label}</span>;
}

export function SectionHead({ children }) {
  return <div className="sec-head">{children}</div>;
}

export function Card({ children, style, elevated, onClick }) {
  return (
    <div className={`card${elevated ? ' elevated' : ''}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}

export function InfoRow({ label, value, border = true }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', fontSize:13, borderBottom: border ? '1px solid var(--border)' : 'none' }}>
      <span style={{ color:'var(--txt-2)' }}>{label}</span>
      <span style={{ fontWeight:500 }}>{value}</span>
    </div>
  );
}

export function StatCard({ label, value, accent }) {
  return (
    <div style={{ background:'var(--bg-surface)', borderRadius:10, padding:'11px 12px' }}>
      <div style={{ fontSize:9, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:17, fontWeight:600, color: accent || 'var(--txt-1)', lineHeight:1.1 }}>{value}</div>
    </div>
  );
}

export function ProgressBar({ pct, color = '#fff', bg = 'rgba(255,255,255,0.2)', height = 5 }) {
  return (
    <div style={{ height, background:bg, borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:color, borderRadius:99, transition:'width 0.5s ease' }} />
    </div>
  );
}

export function Checkbox({ checked, color = '#0F6E56' }) {
  return (
    <div style={{ width:19, height:19, borderRadius:5, border: checked ? 'none' : '1.5px solid var(--border-md)', background: checked ? color : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.14s', marginTop:1 }}>
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5.5l2.5 2.5 4.5-4.5" />
        </svg>
      )}
    </div>
  );
}

export function AlertBanner({ color, bg, borderColor, icon, text }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', borderRadius:'0 10px 10px 0', borderLeft:`3px solid ${borderColor||color}`, background:bg, fontSize:13, lineHeight:1.6, marginBottom:10 }}>
      <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
      <span style={{ color }}>{text}</span>
    </div>
  );
}

export function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width:28, height:28, borderRadius:7, background:'var(--c-danger-l)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'none' }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--c-danger)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 3.5h9M4.5 3.5V2.5h4v1M5 5.5v4M8 5.5v4M2.5 3.5l.5 7h7l.5-7" />
      </svg>
    </button>
  );
}

export function GrowthRing({ pct, color, size = 90 }) {
  const r = size * 0.35;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, pct) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-md)" strokeWidth={size*0.09} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*0.09}
        strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
        strokeDashoffset={(circ*0.25).toFixed(1)} strokeLinecap="round" />
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={size*0.17} fontWeight="600" fill={color} fontFamily="Outfit,sans-serif">{pct}%</text>
    </svg>
  );
}

export function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:36 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, height:`${Math.max(12, (v/max)*100)}%`, background: i === data.length-1 ? color : `${color}55`, borderRadius:'2px 2px 0 0', minWidth:4, transition:'height 0.4s ease' }} />
      ))}
    </div>
  );
}

export function ConfirmModal() {
  const { state, dispatch } = useApp();
  if (!state.confirmDel) return null;
  const { type, idx, label } = state.confirmDel;
  const handleConfirm = () => {
    if (type === 'water') dispatch({ type: 'DELETE_WATER', idx });
    if (type === 'growth') dispatch({ type: 'DELETE_GROWTH', idx });
  };
  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'SET', key: 'confirmDel', value: null })}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--c-danger-l)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--c-danger)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M11 7v5M11 15v.5M3 11a8 8 0 1016 0 8 8 0 00-16 0z" />
          </svg>
        </div>
        <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Delete this log?</div>
        <div style={{ fontSize:13, color:'var(--txt-2)', marginBottom:22, lineHeight:1.6 }}>{label}</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => dispatch({ type: 'SET', key: 'confirmDel', value: null })}
            style={{ flex:1, padding:12, borderRadius:12, border:'1px solid var(--border-md)', fontSize:13, color:'var(--txt-2)', background:'var(--bg-surface)' }}>Cancel</button>
          <button onClick={handleConfirm}
            style={{ flex:1, padding:12, borderRadius:12, background:'var(--c-danger)', color:'#fff', fontSize:13, fontWeight:500 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export function ResetConfirmModal() {
  const { state, dispatch } = useApp();
  if (!state.showResetConfirm) return null;
  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'SET', key: 'showResetConfirm', value: false })}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign:'center' }}>
        <div style={{ fontSize:36, marginBottom:14 }}>↺</div>
        <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Reset the app?</div>
        <div style={{ fontSize:13, color:'var(--txt-2)', marginBottom:22, lineHeight:1.6 }}>
          All logs, water readings, growth records and settings will be cleared. You'll return to the setup screen.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => dispatch({ type: 'SET', key: 'showResetConfirm', value: false })}
            style={{ flex:1, padding:12, borderRadius:12, border:'1px solid var(--border-md)', fontSize:13, color:'var(--txt-2)', background:'var(--bg-surface)' }}>Cancel</button>
          <button onClick={() => dispatch({ type: 'RESET' })}
            style={{ flex:1, padding:12, borderRadius:12, background:'var(--c-danger)', color:'#fff', fontSize:13, fontWeight:500 }}>Yes, reset</button>
        </div>
      </div>
    </div>
  );
}
