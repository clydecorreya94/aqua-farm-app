import { useApp } from '../AppContext';
import { SectionHead, Card, StatCard, GrowthRing, Sparkline, DeleteBtn } from './UI';
import { CM_REF } from '../data';

export default function Growth() {
  const { state, dispatch, sp, currentStage, dailyFeed, perMeal, getStage, effectiveW, projectedW, growthProjections } = useApp();
  const { avgW, cnt, growthLog, growthInput, cmInput, growthMode, anchorDate, anchorWeight } = state;

  const tgt = sp.growth[sp.growth.length - 1].g;
  const pct = Math.min(100, Math.round((effectiveW / tgt) * 100));
  const weightEntries = growthLog.filter(g => g.type === 'weight');
  const sparkData = weightEntries.length >= 2 ? [...weightEntries].reverse().slice(0, 8).map(g => g.w) : null;

  const { cmToEstimatedG } = (() => {
    const { CM_LUT } = { CM_LUT: {1:.05,1.5:.1,2:.2,2.5:.4,3:.7,3.5:1.1,4:1.6,4.5:2.2,5:3,5.5:4,6:5.5,7:8,8:12,9:18,10:25} };
    return {
      cmToEstimatedG: (cm) => {
        const keys = Object.keys(CM_LUT).map(Number).sort((a,b)=>a-b);
        if (cm <= keys[0]) return CM_LUT[keys[0]];
        if (cm >= keys[keys.length-1]) return CM_LUT[keys[keys.length-1]];
        for (let i=0; i<keys.length-1; i++) {
          const lo=keys[i],hi=keys[i+1];
          if (cm>=lo && cm<=hi) { const t=(cm-lo)/(hi-lo); return +(CM_LUT[lo]+t*(CM_LUT[hi]-CM_LUT[lo])).toFixed(2); }
        }
        return 0;
      }
    };
  })();

  const cmPreview = cmInput ? cmToEstimatedG(parseFloat(cmInput) || 0) : null;

  // Days since last log
  const lastLog = growthLog[0];
  const daysSinceLastLog = lastLog ? Math.floor((Date.now() - new Date(lastLog.iso || Date.now())) / 86400000) : null;

  // Suggestion based on current stage
  const suggestion = () => {
    if (!anchorDate) return null;
    const stage = getStage(effectiveW);
    const nextStage = sp.stages[sp.stages.indexOf(stage) + 1];
    const daysToNext = nextStage ? Math.ceil((nextStage.mn - effectiveW) / (sp.growthRatePerDay[stage.l] || 1)) : null;
    return { stage, nextStage, daysToNext };
  };
  const sug = suggestion();

  const upcomingProjections = growthProjections.filter(p => p.daysFromNow > 0).slice(0, 6);

  const ModeToggle = () => (
    <div style={{ display:'flex', borderRadius:10, overflow:'hidden', border:`1.5px solid ${sp.color}`, marginBottom:14 }}>
      {[['weight','⚖  Weight (g)'],['length','📏  Length (cm)']].map(([m, label]) => (
        <button key={m} onClick={() => dispatch({ type:'SET', key:'growthMode', value:m })}
          style={{ flex:1, padding:'11px 0', fontSize:13, fontWeight:500, background: growthMode===m ? sp.color : 'transparent', color: growthMode===m ? '#fff' : sp.color, transition:'all 0.14s', border:'none', cursor:'pointer' }}>
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="page-content">
      <SectionHead>Growth tracker</SectionHead>

      {/* Hero ring card */}
      <Card elevated>
        <div style={{ padding:'20px 18px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:18 }}>
            <GrowthRing pct={pct} color={sp.color} size={92} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Progress to harvest</div>
              <div style={{ fontSize:30, fontWeight:600, color:sp.color, letterSpacing:'-0.02em', lineHeight:1 }}>
                ~{effectiveW.toFixed(1)}g
                <span style={{ fontSize:15, color:'var(--txt-2)', fontWeight:400, marginLeft:6 }}>/ {tgt}g</span>
              </div>
              {anchorDate && projectedW !== avgW && (
                <div style={{ fontSize:11, color:'var(--txt-3)', marginTop:4 }}>
                  Last logged: {avgW}g · Projected today: ~{projectedW.toFixed(1)}g
                </div>
              )}
              <div style={{ fontSize:12, color:'var(--txt-2)', marginTop:6 }}>{sp.harvest} · target {sp.hw}</div>
            </div>
          </div>

          {sparkData && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:7 }}>Weight trend</div>
              <Sparkline data={sparkData} color={sp.color} />
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:8 }}>
            {[['Fish count', cnt], ['Stage', currentStage.l], ['Daily feed', dailyFeed+'g'], ['Per meal', perMeal+'g']].map(([l,v]) => (
              <StatCard key={l} label={l} value={v} accent={sp.color} />
            ))}
          </div>
        </div>
      </Card>

      {/* Stage suggestion banner */}
      {sug && sug.nextStage && (
        <div style={{ background:sp.light, borderLeft:`3px solid ${sp.color}`, borderRadius:'0 12px 12px 0', padding:'12px 16px', marginBottom:8 }}>
          <div style={{ fontSize:13, fontWeight:600, color:sp.dark, marginBottom:4 }}>
            📊 Current suggestion: {sug.stage.l} stage
          </div>
          <div style={{ fontSize:12, color:sp.dark, lineHeight:1.65 }}>
            Using <strong>{sug.stage.sz}</strong> pellets at <strong>{sug.stage.p}% protein</strong>, {sug.stage.m} meals/day.
            {sug.daysToNext && <><br />Expect to reach <strong>{sug.nextStage.l}</strong> stage (~{sug.nextStage.mn}g) in approx. <strong>{sug.daysToNext} days</strong>.</>}
          </div>
        </div>
      )}

      {/* Log reading */}
      <SectionHead>Log size reading</SectionHead>
      <Card>
        <div style={{ padding:'16px 18px' }}>
          {lastLog && daysSinceLastLog !== null && daysSinceLastLog > 6 && (
            <div style={{ background:'var(--c-warn-l)', borderLeft:'3px solid var(--c-warn)', borderRadius:'0 8px 8px 0', padding:'9px 12px', marginBottom:14, fontSize:12, color:'var(--c-warn)', lineHeight:1.6 }}>
              ⚠️ Last log was <strong>{daysSinceLastLog} days ago</strong>. Weekly measurements give the most accurate projections.
            </div>
          )}

          <ModeToggle />

          {growthMode === 'weight' ? (
            <>
              {effectiveW < 3 && (
                <div style={{ background:'var(--c-warn-l)', borderLeft:'3px solid var(--c-warn)', borderRadius:'0 8px 8px 0', padding:'9px 12px', marginBottom:12, fontSize:12, color:'var(--c-warn)', lineHeight:1.6 }}>
                  Fish under ~5cm/3g are hard to weigh accurately. Switch to <strong>Length (cm)</strong> mode above.
                </div>
              )}
              <div style={{ fontSize:13, color:'var(--txt-2)', marginBottom:12, lineHeight:1.65 }}>
                Weigh 3–5 fish, enter the average. Updates all feed calculations and growth projections automatically.
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input type="number" step={0.1} min={0.1} max={900}
                  value={growthInput} placeholder="Average weight in grams"
                  onChange={e => dispatch({ type:'SET', key:'growthInput', value:e.target.value })}
                  style={{ flex:1, textAlign:'center', fontSize:16, fontWeight:500 }} />
                <button onClick={() => dispatch({ type:'ADD_GROWTH_WEIGHT', weight:growthInput })}
                  style={{ padding:'0 20px', background:sp.color, color:'#fff', borderRadius:10, fontSize:13, fontWeight:500, height:42, whiteSpace:'nowrap', flexShrink:0, border:'none', cursor:'pointer' }}>
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ background:sp.light, borderRadius:10, padding:'10px 13px', marginBottom:12, fontSize:12, color:sp.dark, lineHeight:1.65 }}>
                For fry too small to weigh (under ~5cm/3g): measure mouth to tail tip with a ruler. The app estimates the weight and updates projections.
              </div>
              <div style={{ display:'flex', gap:8, marginBottom: cmPreview !== null ? 10 : 0 }}>
                <input type="number" step={0.5} min={0.5} max={30}
                  value={cmInput} placeholder="Length in cm (e.g. 3.5)"
                  onChange={e => dispatch({ type:'SET', key:'cmInput', value:e.target.value })}
                  style={{ flex:1, textAlign:'center', fontSize:16, fontWeight:500 }} />
                <button onClick={() => dispatch({ type:'ADD_GROWTH_LENGTH', cm:cmInput })}
                  style={{ padding:'0 20px', background:sp.color, color:'#fff', borderRadius:10, fontSize:13, fontWeight:500, height:42, whiteSpace:'nowrap', flexShrink:0, border:'none', cursor:'pointer' }}>
                  Log
                </button>
              </div>
              {cmPreview !== null && (
                <div style={{ background:sp.light, borderRadius:9, padding:'10px 14px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:sp.dark }}>{cmInput} cm</span>
                  <span style={{ fontSize:14, fontWeight:600, color:sp.color }}>≈ {cmPreview}g estimated</span>
                </div>
              )}
              {/* cm reference table — tappable */}
              <div style={{ fontSize:11, fontWeight:600, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Length → weight reference (tap to use)</div>
              <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'58px 68px 1fr', background:'var(--bg-surface)', padding:'7px 13px', borderBottom:'1px solid var(--border)' }}>
                  {['Length','Est. wt','Note'].map(h => <span key={h} style={{ fontSize:9.5, fontWeight:600, color:'var(--txt-3)', textTransform:'uppercase' }}>{h}</span>)}
                </div>
                {CM_REF.map((row, i) => {
                  const isSel = parseFloat(cmInput) === row.cm;
                  const isSwitch = row.note && row.note.includes('→');
                  return (
                    <div key={i} onClick={() => dispatch({ type:'SET', key:'cmInput', value:String(row.cm) })}
                      style={{ display:'grid', gridTemplateColumns:'58px 68px 1fr', alignItems:'center', padding:'8px 13px', borderBottom: i < CM_REF.length-1 ? '1px solid var(--border)' : 'none', background: isSel ? sp.light : isSwitch ? 'var(--bg-surface)' : 'transparent', cursor:'pointer', transition:'background 0.1s' }}>
                      <span style={{ fontSize:12.5, fontWeight:500, color: isSel ? sp.color : 'var(--txt-1)' }}>{row.cm} cm</span>
                      <span style={{ fontSize:12.5, color:'var(--txt-2)' }}>≈{row.g}g</span>
                      <span style={{ fontSize:11, color: isSwitch ? sp.color : 'var(--txt-3)', fontWeight: isSwitch ? 600 : 400 }}>{row.note}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Growth projections timeline */}
      {upcomingProjections.length > 0 && (
        <>
          <SectionHead>Growth projections</SectionHead>
          <Card>
            <div style={{ padding:'6px 0' }}>
              {anchorDate && (
                <div style={{ padding:'10px 16px 6px', fontSize:11, color:'var(--txt-3)', borderBottom:'1px solid var(--border)' }}>
                  Projected from {new Date(anchorDate).toLocaleDateString('en-IN')} · {anchorWeight}g starting weight
                </div>
              )}
              {upcomingProjections.map((m, i) => (
                <div key={i} className="proj-row" style={{ background: m.isHarvest ? sp.light : 'transparent', borderBottom: i < upcomingProjections.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background: m.isHarvest ? sp.color : 'var(--border-md)', border:`2px solid ${m.isHarvest ? sp.color : 'var(--border-md)'}`, flexShrink:0 }} />
                    {i < upcomingProjections.length-1 && <div style={{ width:1.5, height:16, background:'var(--border)', margin:'3px 0' }} />}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight: m.isHarvest ? 600 : 400, color: m.isHarvest ? sp.color : 'var(--txt-1)' }}>
                      {m.isHarvest ? '🎯 Harvest ready' : `Reach ${m.targetG}g`}
                    </div>
                    <div style={{ fontSize:11, color:'var(--txt-3)', marginTop:2 }}>{m.stage}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:500, color: m.isHarvest ? sp.color : 'var(--txt-1)' }}>{m.date}</div>
                    <div style={{ fontSize:11, color:sp.color, marginTop:2 }}>in {m.daysFromNow} days</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Target milestones */}
      <SectionHead>Species growth timeline</SectionHead>
      <Card>
        {sp.growth.map((d, i, arr) => {
          const isCur = effectiveW >= d.g && (arr[i+1] === undefined || effectiveW < arr[i+1].g);
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 16px', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none', background: isCur ? sp.light : 'transparent' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background: isCur ? sp.color : 'var(--border-md)', border:`2px solid ${isCur ? sp.color : 'var(--border-md)'}`, flexShrink:0 }} />
                {i < arr.length-1 && <div style={{ width:1.5, height:16, background:'var(--border)', margin:'3px 0' }} />}
              </div>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:12, color:'var(--txt-2)' }}>Month {d.m}</span>
              </div>
              <div style={{ fontSize:14, fontWeight:500, color: isCur ? sp.color : 'var(--txt-1)' }}>{d.g}g</div>
              <div style={{ fontSize:11, color:'var(--txt-3)', minWidth:55, textAlign:'right' }}>
                {i === arr.length-1 ? '🎯 Harvest' : getStage(d.g).l}
              </div>
            </div>
          );
        })}
        <div style={{ padding:'11px 16px', background:'var(--c-ok-l)', display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--c-ok)', flexShrink:0 }} />
          <span style={{ fontSize:12, color:'var(--c-ok)', fontWeight:500 }}>Harvest target: {sp.hw} at {sp.harvest}</span>
        </div>
      </Card>

      {/* Log history */}
      {growthLog.length > 0 && (
        <>
          <SectionHead>Growth logs</SectionHead>
          <Card>
            {growthLog.map((g, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', borderBottom: i < growthLog.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:500 }}>{g.d}</div>
                  <div style={{ fontSize:11, color:'var(--txt-3)', marginTop:2 }}>{g.c} fish · {g.type === 'length' ? 'length measurement' : 'weight reading'}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ textAlign:'right' }}>
                    {g.type === 'weight' ? (
                      <div style={{ fontSize:15, fontWeight:600, color:sp.color }}>{g.w}g</div>
                    ) : (
                      <>
                        <div style={{ fontSize:15, fontWeight:600, color:sp.color }}>{g.cm} cm</div>
                        <div style={{ fontSize:11, color:'var(--txt-3)' }}>≈{g.estG}g est.</div>
                      </>
                    )}
                  </div>
                  <DeleteBtn onClick={() => dispatch({ type:'SET', key:'confirmDel', value:{ type:'growth', idx:i, label: g.type==='weight' ? `Weight log: ${g.w}g on ${g.d}` : `Length log: ${g.cm}cm on ${g.d}` } })} />
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
