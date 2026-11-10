import { useApp } from '../AppContext';
import { SectionHead, Card, ProgressBar, Checkbox, AlertBanner } from './UI';
import { GIFT_NATURAL_FEEDS } from '../data';
import { daysBetween, formatIsoDate } from '../lib/dates';

const CAT_COLORS = {
  water:'#185FA5', health:'#DC2626', feed:'#854F0B',
  equip:'#0F6E56', growth:'#16A34A', filter:'#639922',
};

function TaskRow({ id, label, sub, checked, cat, isWeekly }) {
  const { dispatch, sp } = useApp();
  const color = CAT_COLORS[cat] || sp.color;
  return (
    <div className={`task-row${checked ? ' done' : ''}`}
      onClick={() => dispatch({ type: isWeekly ? 'TOGGLE_WEEKLY' : 'TOGGLE_DAILY', id })}>
      <div style={{ width:3, alignSelf:'stretch', borderRadius:2, background: checked ? `${color}40` : `${color}CC`, flexShrink:0, minHeight:18, marginTop:2 }} />
      <Checkbox checked={checked} color={color} />
      <div style={{ flex:1, minWidth:0 }}>
        <div className="task-label" style={{ fontSize:13, color:'var(--txt-1)', lineHeight:1.45 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'var(--txt-3)', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Today() {
  const { state, sp, currentStage, dailyFeed, perMeal, meals, nextMeal, effectiveW, growthProjections, projectionAnchorDate, tomorrowProjectedW, tomorrowStage, tomorrowDailyFeed, tomorrowPerMeal, tomorrowMeals } = useApp();
  const { dailyChecked, weeklyChecked, fish } = state;

  const nm = nextMeal();
  const allIds = ['d1','d2','d3','d4','d5','d6','d7', ...meals.map((_,i) => 'm'+i)];
  const done = allIds.filter(id => dailyChecked[id]).length;
  const pct  = Math.round((done / allIds.length) * 100);

  const month = new Date().getMonth();
  const monsoon = [5,6,7,8].includes(month);
  const summer  = [2,3,4].includes(month);
  const giftBand = effectiveW < 25 ? 'juvenile' : 'grower';
  const naturalFeedOptions = fish === 'gift'
    ? GIFT_NATURAL_FEEDS
        .filter(item => effectiveW >= item.minWeight)
        .map(item => ({
          ...item,
          pct: item.replacePct[giftBand],
          grams: +((dailyFeed * item.replacePct[giftBand]) / 100).toFixed(1),
          weeklyText: item.weekly[giftBand],
        }))
    : [];

  // Next 3 projections
  const upcomingMilestones = growthProjections.filter(p => p.daysFromNow > 0).slice(0, 3);
  const harvestMilestone   = growthProjections.find(p => p.isHarvest);

  // Days since anchor
  const daysSinceLog = projectionAnchorDate
    ? daysBetween(projectionAnchorDate)
    : null;

  return (
    <div className="page-content">
      {/* Hero card */}
      <div className="hero-card" style={{ background:`linear-gradient(135deg, ${sp.color} 0%, ${sp.dark} 100%)`, boxShadow:`0 8px 32px ${sp.color}35` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, position:'relative', zIndex:1 }}>
          <div>
            <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.6)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>
              NEXT MEAL · {nm.num} of {currentStage.m}
            </div>
            <div style={{ fontSize:'clamp(36px,10vw,52px)', fontWeight:600, color:'#fff', lineHeight:1, letterSpacing:'-0.025em' }}>
              {perMeal}g
            </div>
            <div style={{ fontSize:13.5, color:'rgba(255,255,255,0.85)', marginTop:6, display:'flex', alignItems:'center', gap:7 }}>
              at {nm.label}
              {nm.minutesAway > 0 && (
                <span style={{ fontSize:11, background:'rgba(255,255,255,0.16)', borderRadius:20, padding:'2px 8px' }}>in {nm.minutesAway}m</span>
              )}
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
            <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Daily total</div>
            <div style={{ fontSize:24, fontWeight:600, color:'#fff' }}>{dailyFeed}g</div>
            <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.55)', marginTop:3 }}>{currentStage.sz} · {currentStage.p}% protein</div>
          </div>
        </div>
        <ProgressBar pct={pct} />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, position:'relative', zIndex:1 }}>
          <span style={{ fontSize:10.5, color:'rgba(255,255,255,0.55)' }}>{done}/{allIds.length} tasks</span>
          <span style={{ fontSize:10.5, color:'#fff', fontWeight:500 }}>{pct}%</span>
        </div>
      </div>

      {/* Growth projection summary on dashboard */}
      {projectionAnchorDate && upcomingMilestones.length > 0 && (
        <Card style={{ marginBottom:10 }}>
          <div style={{ padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>📈 Growth Projections</div>
              {daysSinceLog !== null && (
                <span style={{ fontSize:11, color:'var(--txt-3)' }}>Based on log {daysSinceLog === 0 ? 'today' : `${daysSinceLog}d ago`}</span>
              )}
            </div>
            <div style={{ display:'flex', gap:8, overflowX:'auto' }}>
              {upcomingMilestones.map(m => (
                <div key={m.targetG} style={{ background: m.isHarvest ? sp.light : 'var(--bg-surface)', border:`1px solid ${m.isHarvest ? sp.color : 'var(--border)'}`, borderRadius:10, padding:'10px 13px', flexShrink:0, minWidth:120 }}>
                  <div style={{ fontSize:11, color:'var(--txt-3)', marginBottom:4 }}>{m.date}</div>
                  <div style={{ fontSize:16, fontWeight:600, color: m.isHarvest ? sp.color : 'var(--txt-1)' }}>{m.targetG}g</div>
                  <div style={{ fontSize:10, color:sp.color, marginTop:3 }}>in {m.daysFromNow} days</div>
                </div>
              ))}
              {harvestMilestone && !upcomingMilestones.find(m => m.isHarvest) && (
                <div style={{ background:sp.light, border:`1px solid ${sp.color}`, borderRadius:10, padding:'10px 13px', flexShrink:0, minWidth:120 }}>
                  <div style={{ fontSize:11, color:'var(--txt-3)', marginBottom:4 }}>{harvestMilestone.date}</div>
                  <div style={{ fontSize:16, fontWeight:600, color:sp.color }}>🎯 Harvest</div>
                  <div style={{ fontSize:10, color:sp.color, marginTop:3 }}>in {harvestMilestone.daysFromNow} days</div>
                </div>
              )}
            </div>
            <div style={{ fontSize:11, color:'var(--txt-3)', marginTop:10, lineHeight:1.6 }}>
              Current estimated weight: <strong style={{ color:sp.color }}>~{effectiveW.toFixed(1)}g</strong>
              {projectionAnchorDate && ` · Based on ${formatIsoDate(projectionAnchorDate)}`}
            </div>
          </div>
        </Card>
      )}

      {/* Seasonal alerts */}
      {monsoon && <AlertBanner color="var(--c-amber)" bg="var(--c-amber-l)" borderColor="#EF9F27" icon="🌧️" text={sp.needsSalinity ? "Monsoon: check salinity after rain, pH may drop — keep baking soda ready." : "Monsoon: pH may drop after heavy rain — keep baking soda ready."} />}
      {summer  && <AlertBanner color="var(--c-danger)" bg="var(--c-danger-l)" borderColor="#F09595" icon="☀️" text="Summer alert: increase aeration, shade the tank, shift feedings to early morning and late evening." />}

      {/* Feeding */}
      <SectionHead>Feeding today</SectionHead>
      <Card>
        {meals.map((t, i) => (
          <TaskRow key={'m'+i} id={'m'+i} label={`Meal ${i+1} — ${perMeal}g`} sub={`at ${t}`}
            checked={!!dailyChecked['m'+i]} cat="feed" />
        ))}
      </Card>

      <SectionHead>Feed for tomorrow</SectionHead>
      <Card>
        <div style={{ padding:'14px 16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap:8, marginBottom:12 }}>
            {[
              ['Daily total', `${tomorrowDailyFeed}g`],
              ['Per meal', `${tomorrowPerMeal}g`],
              ['Stage', tomorrowStage.l],
            ].map(([l, v]) => (
              <div key={l} style={{ background:'var(--bg-surface)', borderRadius:10, padding:'10px 12px' }}>
                <div style={{ fontSize:9.5, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:15, fontWeight:600, color:sp.color }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, color:'var(--txt-2)', lineHeight:1.6, marginBottom:10 }}>
            Prepare tomorrow's feed based on an estimated weight of <strong style={{ color:'var(--txt-1)' }}>~{tomorrowProjectedW.toFixed(1)}g</strong>.
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {tomorrowMeals.map((t, i) => (
              <div key={i} style={{ background:sp.light, color:sp.dark, borderRadius:8, padding:'6px 10px', fontSize:11.5, fontWeight:500 }}>
                Meal {i+1}: {tomorrowPerMeal}g at {t}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {naturalFeedOptions.length > 0 && (
        <>
          <SectionHead>Natural feed today</SectionHead>
          <Card>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ fontSize:12, color:'var(--txt-2)', lineHeight:1.6, marginBottom:12 }}>
                Optional green supplements for GIFT. Keep pellet feed as the base ration and stay within the suggested amount.
              </div>
              {naturalFeedOptions.map((item, i) => (
                <div key={item.k} style={{ paddingBottom: i < naturalFeedOptions.length - 1 ? 12 : 0, marginBottom: i < naturalFeedOptions.length - 1 ? 12 : 0, borderBottom: i < naturalFeedOptions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, marginBottom:6 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:sp.color }}>{item.n}</div>
                    <div style={{ fontSize:11, color:sp.dark, background:sp.light, borderRadius:99, padding:'3px 8px', fontWeight:500 }}>{item.pct}% max</div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:8, marginBottom:6 }}>
                    <div style={{ background:'var(--bg-surface)', borderRadius:9, padding:'9px 11px' }}>
                      <div style={{ fontSize:9.5, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:4 }}>Offer today</div>
                      <div style={{ fontSize:15, fontWeight:600, color:sp.color }}>{item.grams}g</div>
                    </div>
                    <div style={{ background:'var(--bg-surface)', borderRadius:9, padding:'9px 11px' }}>
                      <div style={{ fontSize:9.5, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:4 }}>Frequency</div>
                      <div style={{ fontSize:12.5, fontWeight:600, color:'var(--txt-1)' }}>{item.weeklyText}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11.5, color:'var(--txt-2)', lineHeight:1.6 }}>
                    {item.prep}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Daily checks */}
      <SectionHead>Daily checks</SectionHead>
      <Card>
        {[
          ['d1','Check aeration is running (all air stones active)','7:00 AM','equip'],
          ['d2','Observe fish — swimming normally? Any deaths?','7:00 AM','health'],
          ['d3','Remove uneaten feed from water surface','7:15 AM','health'],
          ['d4','Check water temperature (target 28–30°C)','Morning','water'],
          ['d5','Evening aeration and fish behaviour check','6:00 PM','equip'],
          ['d6','Log feeding in app after each meal','After meals','feed'],
          ['d7','Check backup power / inverter battery','Evening','equip'],
        ].map(([id, label, sub, cat]) => (
          <TaskRow key={id} id={id} label={label} sub={sub} checked={!!dailyChecked[id]} cat={cat} />
        ))}
      </Card>

      {/* Weekly */}
      <SectionHead>Weekly tasks</SectionHead>
      <Card>
        {[
          ['w1','Test pH, ammonia and nitrite','water'],
          ['w2','Water change 20–25% (200–250L)','water'],
          ['w3','Clean mechanical filter / sponge','filter'],
          sp.needsSalinity ? ['w4', `Check salinity (${sp.waterTargets?.sal?.[0] || '10–20 ppt'})`, 'water'] : null,
          ['w5','Weigh 3–5 sample fish to track growth','growth'],
          ['w6','Inspect fish for disease signs','health'],
        ].filter(Boolean).map(([id, label, cat]) => (
          <TaskRow key={id} id={id} label={label} checked={!!weeklyChecked[id]} cat={cat} isWeekly />
        ))}
      </Card>

      {pct === 100 && (
        <div className="fade-up" style={{ textAlign:'center', padding:'24px 20px', background:sp.light, borderRadius:18, marginTop:8 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🎉</div>
          <div style={{ fontSize:16, fontWeight:600, color:sp.dark }}>All done for today!</div>
          <div style={{ fontSize:13, color:sp.color, marginTop:5 }}>Your fish are well cared for. See you tomorrow.</div>
        </div>
      )}
    </div>
  );
}
