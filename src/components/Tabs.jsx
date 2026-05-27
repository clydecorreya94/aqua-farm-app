import { useApp } from '../AppContext';
import { SectionHead, Card, InfoRow, Chip, StatCard, DeleteBtn } from './UI';
import { MEAL_TIMES, SHOPS, GOVT, TEMP_ADVICE, DISEASES, GIFT_NATURAL_FEEDS, GIFT_NATURAL_FEED_TIPS, GIFT_NATURAL_FEED_AVOID, GIFT_NATURAL_FEED_DOS_DONTS } from '../data';

const lbl = (text) => (
  <div style={{ fontSize:11, color:'var(--txt-3)', marginBottom:6, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>{text}</div>
);

// ═══════════════════════════════════════════════════════════════════════════
// FEED TAB
// ═══════════════════════════════════════════════════════════════════════════
export function Feed() {
  const { state, dispatch, sp, getStage, feedW, feedC } = useApp();
  const { feedWStr, feedCStr, fish } = state;

  const lSt    = getStage(feedW);
  const lBio   = feedC * feedW;
  const lDaily = +(lBio * lSt.r / 100).toFixed(1);
  const lMeal  = +(lDaily / lSt.m).toFixed(1);
  const meals  = MEAL_TIMES[lSt.m] || MEAL_TIMES[3];
  const giftBand = feedW < 25 ? 'juvenile' : 'grower';

  return (
    <div className="page-content">
      <SectionHead>Feed calculator</SectionHead>

      <Card elevated>
        <div style={{ padding:'18px 18px 0' }}>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:12, marginBottom:16 }}>
            <div>
              {lbl('Avg fish weight (g)')}
              <input type="number" value={feedWStr} min={0.1} max={900} step={0.5}
                onChange={e => dispatch({ type:'SET', key:'feedWStr', value:e.target.value })}
                onBlur={e => { const v=parseFloat(e.target.value); if(!v||v<=0) dispatch({type:'SET',key:'feedWStr',value:'1'}); }}
                style={{ textAlign:'center', fontWeight:600, fontSize:18 }} />
            </div>
            <div>
              {lbl('Number of fish')}
              <input type="number" value={feedCStr} min={1} max={500} step={1}
                onChange={e => dispatch({ type:'SET', key:'feedCStr', value:e.target.value })}
                onBlur={e => { const v=parseInt(e.target.value); if(!v||v<=0) dispatch({type:'SET',key:'feedCStr',value:'1'}); }}
                style={{ textAlign:'center', fontWeight:600, fontSize:18 }} />
            </div>
          </div>

          <div style={{ background:`linear-gradient(135deg, ${sp.color}, ${sp.dark})`, borderRadius:14, padding:'18px 16px', display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap:8, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-24, right:-24, width:96, height:96, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
            {[['Daily total', lDaily+'g'], ['Per meal', lMeal+'g'], ['Meals/day', lSt.m+'×']].map(([l,v]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginBottom:5, letterSpacing:'0.05em', textTransform:'uppercase' }}>{l}</div>
                <div style={{ fontSize:'clamp(18px,4vw,24px)', fontWeight:600, color:'#fff', letterSpacing:'-0.02em' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:'14px 18px 18px' }}>
          {lbl(`All ${lSt.m} meal times`)}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {meals.map((t,i) => (
              <div key={i} style={{ background:sp.light, color:sp.dark, borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:500 }}>
                Meal {i+1}: {t}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <SectionHead>Stage: {lSt.l} ({lSt.mn}–{lSt.mx}g)</SectionHead>
      <Card>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:8, marginBottom:16 }}>
            {[['Pellet size', lSt.sz], ['Protein', lSt.p+'%'], ['Feed rate', lSt.r+'%/day'], ['Meals/day', lSt.m+'×']].map(([l,v]) => (
              <StatCard key={l} label={l} value={v} />
            ))}
          </div>
          {lbl('Recommended feed — Ernakulam shops')}
          <div style={{ fontSize:14, fontWeight:500, marginBottom:3 }}>{lSt.brand}</div>
          <div style={{ fontSize:13, color:sp.color, marginBottom:14 }}>{lSt.price}</div>
          <div style={{ background:sp.light, borderLeft:`3px solid ${sp.color}`, borderRadius:'0 10px 10px 0', padding:'11px 14px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:sp.dark, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:5 }}>Say this to the shopkeeper</div>
            <div style={{ fontSize:13, color:sp.dark, lineHeight:1.6 }}>{lSt.tip}</div>
          </div>
        </div>
      </Card>

      <SectionHead>All growth stages</SectionHead>
      <Card>
        {sp.stages.map((st, i, arr) => (
          <div key={i} style={{ padding:'11px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', background: st.l===lSt.l ? sp.light : 'transparent', transition:'background 0.15s' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: st.l===lSt.l ? sp.color : 'var(--border-md)', flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight: st.l===lSt.l ? 500 : 400, color: st.l===lSt.l ? sp.color : 'var(--txt-1)' }}>
                  {st.l}{st.l===lSt.l ? ' ← now' : ''}
                </span>
              </div>
              <span style={{ fontSize:11, color:'var(--txt-3)' }}>{st.mn}–{st.mx}g · {st.sz} · {st.r}%/day</span>
            </div>
          </div>
        ))}
      </Card>

      {fish === 'gift' && (
        <>
          <SectionHead>Natural feed add-ons</SectionHead>
          <Card>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ fontSize:12, color:'var(--txt-2)', lineHeight:1.7, marginBottom:12 }}>
                Use these as <strong>supplements</strong> to pellet feed for GIFT. The amounts below are calculated from your current daily ration of <strong style={{ color:'var(--txt-1)' }}>{lDaily}g/day</strong>.
              </div>
              {GIFT_NATURAL_FEEDS.map((item, i) => {
                const ready = feedW >= item.minWeight;
                const pct = item.replacePct[giftBand];
                const grams = +((lDaily * pct) / 100).toFixed(1);
                return (
                  <div key={item.k} style={{ padding: i < GIFT_NATURAL_FEEDS.length - 1 ? '0 0 14px' : '0', marginBottom: i < GIFT_NATURAL_FEEDS.length - 1 ? 14 : 0, borderBottom: i < GIFT_NATURAL_FEEDS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:7 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:sp.color }}>{item.n}</div>
                        <div style={{ fontSize:11.5, color:'var(--txt-3)', marginTop:2 }}>{item.kind} · {item.bestFor}</div>
                      </div>
                      <Chip label={ready ? `${pct}% of today's ration` : `Wait until ${item.minWeight}g+`} color={ready ? sp.color : 'var(--c-warn)'} bg={ready ? sp.light : 'var(--c-warn-l)'} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:8, marginBottom:10 }}>
                      <StatCard label="Offer" value={ready ? `${grams}g` : 'Not yet'} accent={sp.color} />
                      <StatCard label="Frequency" value={item.weekly[giftBand]} accent={sp.color} />
                    </div>
                    <div style={{ fontSize:12, color:'var(--txt-2)', lineHeight:1.65, marginBottom:6 }}>
                      <strong style={{ color:'var(--txt-1)' }}>How to use:</strong> {item.prep}
                    </div>
                    <div style={{ fontSize:12, color:'var(--txt-2)', lineHeight:1.65, marginBottom:6 }}>
                      <strong style={{ color:'var(--txt-1)' }}>Why:</strong> {item.why}
                    </div>
                    <div style={{ fontSize:12, color:'var(--txt-2)', lineHeight:1.65, marginBottom:6 }}>
                      <strong style={{ color:'var(--txt-1)' }}>Local source idea:</strong> {item.source}
                    </div>
                    <div style={{ fontSize:12, color:'var(--c-warn)', lineHeight:1.65 }}>
                      <strong>Caution:</strong> {item.caution}
                    </div>
                  </div>
                );
              })}
              <div style={{ background:'var(--bg-surface)', borderRadius:10, padding:'11px 13px', fontSize:12, color:'var(--txt-2)', lineHeight:1.65, marginTop:12 }}>
                Practical rule: if fish do not finish the green supplement in 15-20 minutes, reduce the next serving. If they finish it consistently, stay within the suggested percentage rather than increasing freely.
              </div>
            </div>
          </Card>

          <SectionHead>Best practice</SectionHead>
          <Card>
            <div style={{ padding:'14px 16px' }}>
              {GIFT_NATURAL_FEED_TIPS.map((tip, i) => (
                <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom: i < GIFT_NATURAL_FEED_TIPS.length - 1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
                  <div style={{ width:18, height:18, borderRadius:5, background:sp.light, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round"><path d="M1.5 4.5l2 2.5L8 1.5" /></svg>
                  </div>
                  <span style={{ fontSize:12.5, lineHeight:1.6 }}>{tip}</span>
                </div>
              ))}
            </div>
          </Card>

          <SectionHead>Avoid these leaves</SectionHead>
          <Card>
            {GIFT_NATURAL_FEED_AVOID.map((item, i) => (
              <div key={item.n} style={{ padding:'12px 16px', borderBottom: i < GIFT_NATURAL_FEED_AVOID.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--c-danger)', marginBottom:3 }}>{item.n}</div>
                <div style={{ fontSize:12, color:'var(--txt-2)', lineHeight:1.6 }}>{item.why}</div>
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionHead>Local feed shops</SectionHead>
      {SHOPS.map((sh,i) => (
        <Card key={i}>
          <div style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{sh.n}</div>
            <div style={{ fontSize:12, color:'var(--txt-2)', marginBottom:4 }}>{sh.p} · {sh.t}</div>
            <div style={{ fontSize:12, color:sp.color }}>{sh.note}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN TAB
// ═══════════════════════════════════════════════════════════════════════════
export function Plan() {
  const { state, dispatch, sp, calcFeedForCycle, feedW, feedC } = useApp();
  const { feedBought, feedBoughtInput, feedBoughtUnit } = state;

  const stIdx  = sp.stages.findIndex(st => feedW >= st.mn && feedW < st.mx);
  const curSt  = sp.stages[stIdx] || sp.stages[0];
  const nextSt = sp.stages[stIdx + 1];
  const kgCur  = calcFeedForCycle(curSt, feedC);
  const kgNext = nextSt ? calcFeedForCycle(nextSt, feedC) : 0;
  const bought    = parseFloat(feedBought[curSt.l]) || 0;
  const remaining = Math.max(0, +(kgCur - bought).toFixed(3));
  const pct       = Math.min(100, Math.round((bought / kgCur) * 100));
  const totalKg   = sp.stages.reduce((acc,st) => acc + calcFeedForCycle(st, feedC), 0).toFixed(1);

  const fmt = (kg) => kg >= 1 ? `${kg.toFixed(2)} kg` : `${(kg*1000).toFixed(0)} g (${kg.toFixed(3)} kg)`;

  const handleLog = () => {
    const val = parseFloat(feedBoughtInput);
    if (!val || val <= 0) return;
    dispatch({ type:'LOG_FEED_BOUGHT', stage:curSt.l, amount:feedBoughtInput, unit:feedBoughtUnit });
  };

  const UnitToggle = () => (
    <div style={{ display:'flex', borderRadius:8, overflow:'hidden', border:`1.5px solid ${sp.color}`, flexShrink:0 }}>
      {['g','kg'].map(u => (
        <button key={u} onClick={() => dispatch({ type:'SET', key:'feedBoughtUnit', value:u })}
          style={{ padding:'0 16px', height:42, fontSize:13, fontWeight:500, background: feedBoughtUnit===u ? sp.color : 'transparent', color: feedBoughtUnit===u ? '#fff' : sp.color, transition:'all 0.14s', border:'none', cursor:'pointer' }}>
          {u}
        </button>
      ))}
    </div>
  );

  return (
    <div className="page-content">
      <SectionHead>Feed purchase planner</SectionHead>
      <Card elevated>
        <div style={{ padding:18 }}>
          <div style={{ fontSize:12, color:'var(--txt-2)', marginBottom:14, lineHeight:1.65 }}>
            Based on <strong style={{ color:'var(--txt-1)' }}>{feedC} fish at {feedW}g</strong>. Plan your next shopping trip.
          </div>
          <div style={{ background:sp.light, borderRadius:14, padding:16, marginBottom:16 }}>
            <div style={{ fontSize:11, color:sp.dark, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:6 }}>Current stage: {curSt.l}</div>
            <div style={{ fontSize:'clamp(22px,6vw,30px)', fontWeight:600, color:sp.color, lineHeight:1, marginBottom:4 }}>
              {kgCur} kg <span style={{ fontSize:13, color:'var(--txt-2)', fontWeight:400 }}>total needed</span>
            </div>
            <div style={{ fontSize:12, color:sp.dark, marginBottom:12 }}>{curSt.sz} pellet · {curSt.p}% protein · ~{Math.max(1, Math.round(kgCur/25))} bags of 25kg</div>
            <div style={{ height:8, background:'rgba(0,0,0,0.1)', borderRadius:4, marginBottom:8, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:sp.color, borderRadius:4, transition:'width 0.5s ease' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:sp.dark }}>
              <span>Purchased: {fmt(bought)}</span>
              <span>Still need: <strong>{fmt(remaining)}</strong></span>
            </div>
          </div>

          {lbl('Log feed purchased')}
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <input type="number"
              step={feedBoughtUnit==='g' ? 5 : 0.1}
              min={feedBoughtUnit==='g' ? 5 : 0.005}
              value={feedBoughtInput}
              placeholder={feedBoughtUnit==='g' ? 'e.g. 500 g' : 'e.g. 2.5 kg'}
              onChange={e => dispatch({ type:'SET', key:'feedBoughtInput', value:e.target.value })}
              style={{ flex:1 }} />
            <UnitToggle />
            <button onClick={handleLog}
              style={{ padding:'0 16px', background:sp.color, color:'#fff', borderRadius:10, fontSize:13, fontWeight:500, height:42, whiteSpace:'nowrap', flexShrink:0, border:'none', cursor:'pointer' }}>
              Log
            </button>
          </div>
          <div style={{ fontSize:11, color:'var(--txt-3)', lineHeight:1.6 }}>
            Use <strong>g</strong> for small amounts (50g, 200g, 500g) or <strong>kg</strong> for full 25kg bags.
          </div>
        </div>
      </Card>

      {nextSt && (
        <>
          <SectionHead>Next stage: {nextSt.l}</SectionHead>
          <Card>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:8, marginBottom:14 }}>
                {[['Feed needed', kgNext+' kg'], ['Pellet size', nextSt.sz], ['Protein', nextSt.p+'%'], ['Est. bags', Math.max(1,Math.round(kgNext/25))+'×25kg']].map(([l,v]) => (
                  <StatCard key={l} label={l} value={v} />
                ))}
              </div>
              <div style={{ background:sp.light, borderLeft:`3px solid ${sp.color}`, borderRadius:'0 10px 10px 0', padding:'11px 14px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:sp.dark, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4 }}>Next shopkeeper phrase</div>
                <div style={{ fontSize:13, color:sp.dark, lineHeight:1.6 }}>{nextSt.tip}</div>
              </div>
            </div>
          </Card>
        </>
      )}

      <SectionHead>Full cycle feed plan</SectionHead>
      <Card>
        {sp.stages.map((st,i,arr) => {
          const kg = calcFeedForCycle(st, feedC);
          const isCur = st.l === curSt.l;
          return (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', background: isCur ? sp.light : 'transparent' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: isCur ? sp.color : 'var(--border-md)', flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:13, fontWeight: isCur ? 500 : 400, color: isCur ? sp.color : 'var(--txt-1)' }}>{st.l}{isCur ? ' ← current' : ''}</div>
                  <div style={{ fontSize:11, color:'var(--txt-3)' }}>{st.sz} · {st.p}% protein</div>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:500, color: isCur ? sp.color : 'var(--txt-1)' }}>{kg} kg</div>
                <div style={{ fontSize:11, color:'var(--txt-3)' }}>≈₹{Math.round(kg*55).toLocaleString('en-IN')}</div>
              </div>
            </div>
          );
        })}
        <div style={{ padding:'12px 16px', background:'var(--bg-surface)', display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)' }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Total for full cycle</span>
          <span style={{ fontSize:13, fontWeight:600, color:sp.color }}>{totalKg} kg</span>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WATER TAB
// ═══════════════════════════════════════════════════════════════════════════
export function Water() {
  const { state, dispatch, sp, getWaterStatus, waterLog } = useApp();
  const { waterHistory, waterSaved, tempOpen } = state;

  const target = sp.waterTargets || {};
  const params = [
    ['pH',   'pH',            target.pH?.[0] || '7.0–8.0',  'PH'],
    ['temp', 'Temperature',   target.temp?.[0] || '28–30°C', 'Temp'],
    ['do_',  'Dissolved O₂',  target.do_?.[0] || '> 5 mg/L', 'DO'],
    ['nh3',  'Ammonia (TAN)', target.nh3?.[0] || '< 0.1 mg/L', 'NH3'],
    ['no2',  'Nitrite NO₂',   target.no2?.[0] || '< 0.1 mg/L', 'NO2'],
    ...(sp.needsSalinity ? [['sal','Salinity', target.sal?.[0] || '10–20 ppt','Sal']] : []),
  ];

  const handleSave = () => {
    if (!waterLog.pH) return;
    dispatch({ type:'SAVE_WATER' });
    setTimeout(() => dispatch({ type:'WATER_SAVED_RESET' }), 2000);
  };

  return (
    <div className="page-content">
      <SectionHead>Log water parameters</SectionHead>
      <Card elevated>
        <div style={{ padding:18 }}>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:12, marginBottom:16 }}>
            {params.map(([k, l, ideal, field]) => {
              const st = getWaterStatus(k, waterLog[k]);
              return (
                <div key={k}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:11, color:'var(--txt-3)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>{l}</span>
                    {st
                      ? <Chip label={st.l} color={st.color} bg={st.bg} />
                      : <span style={{ fontSize:10, color:'var(--txt-3)' }}>{ideal}</span>
                    }
                  </div>
                  <input type="number" step="0.1"
                    placeholder={ideal.replace(/[<>≥]/g, '')}
                    value={waterLog[k]}
                    onChange={e => dispatch({ type:'SET_WATER_PARAM', field, value:e.target.value })} />
                </div>
              );
            })}
          </div>
          <button onClick={handleSave}
            style={{ width:'100%', padding:13, borderRadius:12, background: waterSaved ? 'var(--c-ok)' : `linear-gradient(135deg, ${sp.color}, ${sp.dark})`, color:'#fff', fontSize:14, fontWeight:500, transition:'background 0.3s ease', border:'none', cursor:'pointer' }}>
            {waterSaved ? '✓ Saved successfully!' : 'Save water reading'}
          </button>
        </div>
      </Card>

      <SectionHead>Temperature solutions — Kerala climate</SectionHead>
      {TEMP_ADVICE.map((ta, ti) => (
        <div key={ti} style={{ background:'var(--bg-card)', borderRadius:'var(--r-md)', border:'1px solid var(--border)', overflow:'hidden', marginBottom:8, transition:'box-shadow 0.14s' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer' }}
            onClick={() => dispatch({ type:'TOGGLE_TEMP', idx:ti })}>
            <div style={{ width:42, height:42, borderRadius:12, background:ta.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{ta.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{ta.season}</div>
              <div style={{ fontSize:11, color:'var(--txt-2)', marginTop:2 }}>{ta.water} · Risk: {ta.risk}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--txt-3)" strokeWidth="1.5" strokeLinecap="round"
              style={{ transform: tempOpen[ti] ? 'rotate(180deg)' : 'none', transition:'transform 0.22s ease', flexShrink:0 }}>
              <path d="M3 5.5l5 5 5-5" />
            </svg>
          </div>
          {tempOpen[ti] && (
            <div className="slide-down" style={{ padding:'4px 16px 16px' }}>
              {ta.actions.map((action, ai) => (
                <div key={ai} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom: ai<ta.actions.length-1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:ta.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:ta.color, flexShrink:0 }}>{ai+1}</div>
                  <span style={{ fontSize:13, color:'var(--txt-1)', lineHeight:1.65 }}>{action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <SectionHead>Target parameters</SectionHead>
      <Card>
        <div style={{ padding:'14px 16px' }}>
          {params.map(([k, l, ideal], i, arr) => (
            <InfoRow key={k} label={l} value={ideal} border={i < arr.length-1} />
          ))}
          <div style={{ background:sp.light, borderRadius:9, padding:'10px 12px', marginTop:12, fontSize:12, color:sp.dark, lineHeight:1.6 }}>
            {sp.salt}
          </div>
        </div>
      </Card>

      {waterHistory.length > 0 && (
        <>
          <SectionHead>Water logs</SectionHead>
          <Card>
            {waterHistory.map((h,i) => (
              <div key={i} style={{ padding:'11px 16px', borderBottom: i<waterHistory.length-1 ? '1px solid var(--border)' : 'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:500 }}>{h.date} · {h.time}</div>
                  <div style={{ fontSize:11, color:'var(--txt-3)', marginTop:3 }}>
                    pH:{h.pH||'—'} · {h.temp||'—'}°C · DO:{h.do_||'—'} · NH₃:{h.nh3||'—'}
                    {sp.needsSalinity && h.sal ? ` · Sal:${h.sal}ppt` : ''}
                  </div>
                </div>
                <DeleteBtn onClick={() => dispatch({ type:'SET', key:'confirmDel', value:{ type:'water', idx:i, label:`Water log: ${h.date} ${h.time}` } })} />
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionHead>Government support</SectionHead>
      {GOVT.map((g,i) => (
        <Card key={i}>
          <div style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:13, fontWeight:500, marginBottom:3 }}>{g.n}</div>
            <div style={{ fontSize:12, color:'var(--txt-2)', marginBottom:4 }}>{g.r}</div>
            <div style={{ fontSize:12, color:sp.color }}>{g.c}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARN TAB
// ═══════════════════════════════════════════════════════════════════════════
export function Learn() {
  const { state, dispatch, sp } = useApp();
  const { learnSub } = state;

  const subs = [
    { k:'ref', label:'Quick ref' },
    { k:'disease', label:'Disease guide' },
    { k:'scale', label:'Scale up' },
    { k:'tips', label:'Kerala tips' },
  ];

  return (
    <div className="page-content">
      {/* Sub-tab bar */}
      <div style={{ display:'flex', gap:8, padding:'16px 0 10px', overflowX:'auto' }}>
        {subs.map(t => (
          <button key={t.k}
            onClick={() => dispatch({ type:'SET', key:'learnSub', value:t.k })}
            style={{ padding:'7px 16px', borderRadius:99, border:`1px solid ${learnSub===t.k ? sp.color : 'var(--border-md)'}`, background: learnSub===t.k ? sp.color : 'var(--bg-card)', color: learnSub===t.k ? '#fff' : 'var(--txt-2)', fontSize:13, fontWeight: learnSub===t.k ? 500 : 400, whiteSpace:'nowrap', flexShrink:0, transition:'all 0.14s', cursor:'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {learnSub === 'ref' && <LearnRef sp={sp} />}
      {learnSub === 'disease' && <LearnDisease state={state} dispatch={dispatch} />}
      {learnSub === 'scale' && <LearnScale sp={sp} state={state} dispatch={dispatch} />}
      {learnSub === 'tips' && <LearnTips sp={sp} />}
    </div>
  );
}

function LearnRef({ sp }) {
  const target = sp.waterTargets || {};
  const rows = [
    ['pH', target.pH?.[1] || '7.0–8.0', target.pH?.[2] || '< 6.5 or > 9 = danger'],
    ['Temperature', target.temp?.[1] || '28–30°C', target.temp?.[2] || '< 24°C or > 33°C = stress'],
    ['Dissolved O₂', target.do_?.[1] || '> 5 mg/L', target.do_?.[2] || '< 3 mg/L = lethal'],
    ['Ammonia TAN', target.nh3?.[1] || '< 0.1 mg/L', target.nh3?.[2] || 'Higher pH = more toxic ammonia'],
    ['Nitrite NO₂', target.no2?.[1] || '< 0.1 mg/L', target.no2?.[2] || '> 0.5 mg/L = toxic'],
    ...(sp.needsSalinity ? [['Salinity', target.sal?.[1] || '10–20 ppt', target.sal?.[2] || 'Keep stable']] : [['Alkalinity', target.alkalinity?.[1] || '80–150 ppm', target.alkalinity?.[2] || '< 50 ppm = pH crash risk']]),
  ];

  return (
    <>
      <Card>
        {rows.map(([p, ideal, note], i, arr) => (
          <div key={p} style={{ padding:'10px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:13, fontWeight:500 }}>{p}</span>
              <span style={{ fontSize:11, fontWeight:500, color:sp.color, background:sp.light, padding:'2px 8px', borderRadius:99 }}>{ideal}</span>
            </div>
            <div style={{ fontSize:11.5, color:'var(--txt-3)' }}>{note}</div>
          </div>
        ))}
      </Card>

      <SectionHead>Essential equipment checklist</SectionHead>
      <Card>
        <div style={{ padding:'14px 16px' }}>
          {['1000L concrete ring tank', 'Air pump ≥5W (must run 24/7)', 'Air stones × 2 across tank floor', 'Filter sump 200L with bio-media', 'Ceramic rings or bio-balls', 'pH test kit (weekly)', 'Ammonia test kit', 'Digital thermometer', sp.needsSalinity ? 'Salinity refractometer' : 'Non-iodised salt (1g/L always)', 'Dechlorinator', 'Battery inverter backup for air pump', 'Floating feeding tray'].map((e,i,arr) => (
            <div key={e} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', fontSize:13, alignItems:'center' }}>
              <div style={{ width:18, height:18, borderRadius:5, background:sp.light, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke={sp.color} strokeWidth="2" strokeLinecap="round"><path d="M1.5 4.5l2 2.5L8 1.5" /></svg>
              </div>
              <span>{e}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function LearnDisease({ state, dispatch }) {
  const { diseaseSearch, diseaseOpen } = state;
  const sevColors = { low:['#16A34A','#DCFCE7'], med:['#B45309','#FEF3C7'], high:['#DC2626','#FEE2E2'] };
  const filtered = diseaseSearch
    ? DISEASES.filter(d => (d.s + d.d).toLowerCase().includes(diseaseSearch.toLowerCase()))
    : DISEASES;

  return (
    <>
      <div style={{ marginBottom:10 }}>
        <input type="text" value={diseaseSearch} placeholder="Search symptom or disease name…"
          onChange={e => dispatch({ type:'SET', key:'diseaseSearch', value:e.target.value })} />
      </div>
      {filtered.map(d => {
        const ri = DISEASES.indexOf(d);
        const isOpen = diseaseOpen === ri;
        const sc = sevColors[d.sev];
        return (
          <div key={ri} style={{ background:'var(--bg-card)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', borderLeft:`3px solid ${sc[0]}`, overflow:'hidden', marginBottom:8 }}>
            <div style={{ padding:'13px 16px', cursor:'pointer' }} onClick={() => dispatch({ type:'SET', key:'diseaseOpen', value: isOpen ? -1 : ri })}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5 }}>
                <span style={{ fontSize:13, fontWeight:500, flex:1, paddingRight:8, lineHeight:1.4 }}>{d.s}</span>
                <Chip label={d.sev} color={sc[0]} bg={sc[1]} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11.5, color:'var(--txt-2)' }}>Likely: {d.d}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--txt-3)" strokeWidth="1.5" strokeLinecap="round"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}>
                  <path d="M2.5 5l4.5 4.5L11.5 5" />
                </svg>
              </div>
            </div>
            {isOpen && (
              <div className="slide-down" style={{ borderTop:'1px solid var(--border)' }}>
                <div style={{ margin:'11px 14px', background:'var(--bg-surface)', borderRadius:9, padding:'10px 12px', fontSize:12, color:'var(--txt-2)', lineHeight:1.6 }}>
                  🔍 Search <strong>"{d.d}"</strong> on Google Images to identify visually
                </div>
                <div style={{ padding:'0 14px 14px' }}>
                  <div style={{ fontSize:10, fontWeight:600, color:'var(--txt-3)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:10 }}>Step-by-step treatment</div>
                  {d.steps.map((step, si) => (
                    <div key={si} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom: si<d.steps.length-1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
                      <div style={{ width:24, height:24, borderRadius:'50%', background:sc[1], display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:sc[0], flexShrink:0 }}>{si+1}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, marginBottom:3 }}>{step.n}</div>
                        <div style={{ fontSize:12.5, color:'var(--txt-2)', lineHeight:1.65 }}>{step.t}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function LearnScale({ sp, state, dispatch }) {
  const { scaleTarget } = state;
  const tanks = Math.ceil(scaleTarget / 80);
  return (
    <>
      <Card elevated>
        <div style={{ padding:'16px 18px' }}>
          {lbl('Target fish count')}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <input type="range" min={25} max={500} step={25} value={scaleTarget}
              onChange={e => dispatch({ type:'SET', key:'scaleTarget', value:+e.target.value })}
              style={{ flex:1 }} />
            <input type="number" value={scaleTarget} min={25} max={500} step={25}
              onChange={e => dispatch({ type:'SET', key:'scaleTarget', value:+e.target.value||scaleTarget })}
              style={{ width:80, textAlign:'center', fontWeight:600, flexShrink:0 }} />
          </div>
          <div style={{ fontSize:36, fontWeight:600, color:sp.color, textAlign:'center', margin:'10px 0', letterSpacing:'-0.02em' }}>{scaleTarget} fish</div>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:8 }}>
            {[['Tanks needed', tanks+'×1000L'], ['Total water', (tanks*1000)+'L'], ['Filter volume', (tanks*200)+'L'], sp.needsSalinity ? ['Marine salt', tanks*12+'kg'] : ['Salt/month', tanks+'kg']].map(([l,v]) => (
              <StatCard key={l} label={l} value={v} accent={sp.color} />
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <div style={{ padding:'14px 16px' }}>
          {[['FRP tanks ×'+tanks,'₹'+(tanks*7000).toLocaleString('en-IN')],['Air pumps','₹'+(tanks*1800).toLocaleString('en-IN')],['Filter pumps','₹'+(tanks*2500).toLocaleString('en-IN')],['Bio-media','₹'+(tanks*2000).toLocaleString('en-IN')],['Fingerlings ('+scaleTarget+')','₹'+(scaleTarget*(sp.name.includes('Karimeen') ? 4 : sp.name.includes('Seabass') ? 30 : sp.name.includes('Shrimp') ? 2 : 2)).toLocaleString('en-IN')],['Feed/month','₹'+Math.round(scaleTarget*5*0.03*30*65/1000).toLocaleString('en-IN')],['Electricity/month','₹'+(tanks*1200).toLocaleString('en-IN')]].map(([l,v],i,arr) => (
            <InfoRow key={l} label={l} value={v} border={i<arr.length-1} />
          ))}
        </div>
      </Card>
      <div style={{ background:sp.light, borderLeft:`3px solid ${sp.color}`, borderRadius:'0 11px 11px 0', padding:'10px 13px', fontSize:13, color:sp.dark, lineHeight:1.6 }}>
        Stabilise 1 tank for 2–3 months before adding the next. Never jump to full scale at once.
      </div>
    </>
  );
}

function LearnTips({ sp }) {
  return (
    <>
      {sp.tips.map((tip, i) => {
        const [title, ...rest] = tip.split(' — ');
        return (
          <Card key={i}>
            <div style={{ padding:'13px 16px' }}>
              <div style={{ fontSize:13, fontWeight:500, color:sp.color, marginBottom:4 }}>{title}</div>
              <div style={{ fontSize:13, color:'var(--txt-2)', lineHeight:1.6 }}>{rest.join(' — ')}</div>
            </div>
          </Card>
        );
      })}
      <SectionHead>Do's and don'ts</SectionHead>
      <Card>
        {[{ok:true,t:"Acclimate new fish slowly — 30–60 min drip method"},{ok:true,t:"Cycle biofilter 2+ weeks before adding any fish"},{ok:true,t:"Remove uneaten feed within 5 minutes every meal"},{ok:true,t:"Use dechlorinated, temperature-matched water for changes"},{ok:false,t:"Never use iodised table salt — it kills fish"},{ok:false,t:"Never do more than 30% water change at once"},{ok:false,t:"Never switch off aeration — even 2 hours can be fatal"},{ok:false,t:"Do not overfeed — ammonia kills faster than hunger"}].map(({ok,t},i,arr) => (
          <div key={i} style={{ display:'flex', gap:10, padding:'10px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start', fontSize:13 }}>
            <div style={{ width:18, height:18, borderRadius:5, background: ok ? '#DCFCE7' : '#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
              {ok
                ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round"><path d="M1.5 4.5l2 2.5L8 1.5" /></svg>
                : <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"><path d="M1.5 1.5l6 6M7.5 1.5l-6 6" /></svg>
              }
            </div>
            <span style={{ lineHeight:1.5 }}>{t}</span>
          </div>
        ))}
      </Card>

      {sp.name === 'GIFT Tilapia' && (
        <>
          <SectionHead>Natural feed do's and don'ts</SectionHead>
          <Card>
            {[...GIFT_NATURAL_FEED_DOS_DONTS.dos.map(t => ({ ok:true, t })), ...GIFT_NATURAL_FEED_DOS_DONTS.donts.map(t => ({ ok:false, t }))].map(({ ok, t }, i, arr) => (
              <div key={i} style={{ display:'flex', gap:10, padding:'10px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start', fontSize:13 }}>
                <div style={{ width:18, height:18, borderRadius:5, background: ok ? '#DCFCE7' : '#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                  {ok
                    ? <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round"><path d="M1.5 4.5l2 2.5L8 1.5" /></svg>
                    : <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round"><path d="M1.5 1.5l6 6M7.5 1.5l-6 6" /></svg>
                  }
                </div>
                <span style={{ lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}
