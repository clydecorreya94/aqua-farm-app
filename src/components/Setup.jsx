import { useApp } from '../AppContext';
import { SPECIES } from '../data';
import { cmToG, CM_REF } from '../data';

export default function Setup() {
  const { state, dispatch } = useApp();
  const { setupStep, fish, cnt, setupSizeMode, setupCm, setupGrams } = state;
  const sp = SPECIES[fish];

  const cm = parseFloat(setupCm) || 0;
  const grams = parseFloat(setupGrams) || 0;
  const estW = setupSizeMode === 'cm' ? cmToG(cm) : grams;
  const step1Valid = setupSizeMode === 'cm' ? cm > 0 : grams > 0;

  const density = cnt <= 80
    ? { color: 'var(--c-ok)', bg: 'var(--c-ok-l)', label: 'Safe for beginners' }
    : cnt <= 150
    ? { color: 'var(--c-warn)', bg: 'var(--c-warn-l)', label: 'Moderate — ensure strong filtration' }
    : { color: 'var(--c-danger)', bg: 'var(--c-danger-l)', label: 'High density — advanced setup required' };

  const quickCm = CM_REF.filter(r => r.cm >= 2 && r.cm <= 8);

  return (
    <div className="setup-wrap">
      <div className="setup-card">
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${sp.color}, ${sp.dark})`, padding: '26px 24px 22px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ display: 'flex', gap: 5, marginBottom: 18, position: 'relative', zIndex: 1 }}>
            {[0, 1].map(i => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: '#fff', opacity: i <= setupStep ? 1 : 0.28, transition: 'opacity 0.3s' }} />
            ))}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.015em', position: 'relative', zIndex: 1 }}>
            Clyde's AquaFarm
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3, position: 'relative', zIndex: 1 }}>
            {setupStep === 0 ? 'Kerala · Personal fish farming guide' : 'Your fish details — step 2 of 2'}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', maxHeight: '58vh', overflowY: 'auto' }}>

          {setupStep === 0 && (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>Which fish will you farm?</div>
              <div style={{ fontSize: 13, color: 'var(--txt-2)', marginBottom: 18, lineHeight: 1.65 }}>
                Your choice personalises all feeding, water and care guidance for your 1000L tank in Ernakulam.
              </div>
              {Object.entries(SPECIES).map(([k, v]) => (
                <button key={k} onClick={() => dispatch({ type: 'SETUP_FISH', fish: k })}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 15, borderRadius: 14, border: `2px solid ${fish === k ? v.color : 'var(--border-md)'}`, background: fish === k ? v.light : 'var(--bg-surface)', marginBottom: 10, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: fish === k ? v.color : v.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>
                    {k === 'gift' ? '🐟' : '🐠'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: fish === k ? v.color : 'var(--txt-1)', marginBottom: 2 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt-2)' }}>{v.harvest} to harvest · {v.hw}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${fish === k ? v.color : 'var(--border-md)'}`, background: fish === k ? v.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {fish === k && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </button>
              ))}
            </>
          )}

          {setupStep === 1 && (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>How many fish are you starting with?</div>
              <div style={{ fontSize: 13, color: 'var(--txt-2)', marginBottom: 13, lineHeight: 1.65 }}>
                25–50 fish is ideal for a 1000L beginner setup.
              </div>
              <input type="number" value={cnt} min={1} max={500} step={1}
                onChange={e => dispatch({ type: 'SET', key: 'cnt', value: +e.target.value || 1 })}
                style={{ fontSize: 22, fontWeight: 600, textAlign: 'center', padding: 12, marginBottom: 10 }} />
              <div style={{ background: density.bg, borderRadius: 9, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: density.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: density.color }}>{cnt} fish in 1000L — {density.label}</span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>What size are your fish right now?</div>
              <div style={{ fontSize: 13, color: 'var(--txt-2)', marginBottom: 13, lineHeight: 1.65 }}>
                New fingerlings are usually 3–5cm. This sets your starting feed amounts and growth projections.
              </div>

              <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${sp.color}`, marginBottom: 14 }}>
                {[['cm', '📏  Length (cm)'], ['grams', '⚖  Weight (g)']].map(([m, label]) => (
                  <button key={m} onClick={() => dispatch({ type: 'SET', key: 'setupSizeMode', value: m })}
                    style={{ flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 500, background: setupSizeMode === m ? sp.color : 'transparent', color: setupSizeMode === m ? '#fff' : sp.color, transition: 'all 0.15s' }}>
                    {label}
                  </button>
                ))}
              </div>

              {setupSizeMode === 'cm' ? (
                <>
                  <input type="number" step={0.5} min={0.5} max={30} value={setupCm}
                    placeholder="e.g. 3 or 4.5"
                    onChange={e => dispatch({ type: 'SET', key: 'setupCm', value: e.target.value })}
                    style={{ textAlign: 'center', fontWeight: 600, fontSize: 20, marginBottom: cm > 0 ? 10 : 0 }} />
                  {cm > 0 && (
                    <div style={{ background: sp.light, borderRadius: 10, padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: 13, color: sp.dark }}>{setupCm} cm fish</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: sp.color }}>≈ {estW}g estimated</span>
                    </div>
                  )}
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--txt-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tap a common size</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {quickCm.map(row => (
                      <button key={row.cm} onClick={() => dispatch({ type: 'SET', key: 'setupCm', value: String(row.cm) })}
                        style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${parseFloat(setupCm) === row.cm ? sp.color : 'var(--border-md)'}`, background: parseFloat(setupCm) === row.cm ? sp.light : 'var(--bg-surface)', fontSize: 12, fontWeight: 500, color: parseFloat(setupCm) === row.cm ? sp.color : 'var(--txt-2)', cursor: 'pointer', transition: 'all 0.14s' }}>
                        {row.cm}cm <span style={{ color: 'var(--txt-3)', fontSize: 10 }}>≈{row.g}g</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <input type="number" step={0.1} min={0.1} max={900} value={setupGrams}
                    placeholder="Average weight in grams"
                    onChange={e => dispatch({ type: 'SET', key: 'setupGrams', value: e.target.value })}
                    style={{ textAlign: 'center', fontWeight: 600, fontSize: 20, marginBottom: grams > 0 ? 10 : 0 }} />
                  {grams > 0 && (
                    <div style={{ background: sp.light, borderRadius: 10, padding: '11px 14px', marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: sp.color }}>{setupGrams}g</span>
                      <span style={{ fontSize: 13, color: sp.dark, marginLeft: 8 }}>→ {grams < 5 ? 'Fry stage' : grams < 25 ? 'Juvenile stage' : 'Grower+'}</span>
                    </div>
                  )}
                  <div style={{ background: 'var(--c-warn-l)', borderLeft: '3px solid var(--c-warn)', borderRadius: '0 8px 8px 0', padding: '9px 12px', fontSize: 12, color: 'var(--c-warn)', lineHeight: 1.6 }}>
                    Fish under ~5cm (≈3g) are hard to weigh — switch to <strong>Length (cm)</strong> mode.
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
          {setupStep > 0 && (
            <button onClick={() => dispatch({ type: 'SETUP_BACK' })}
              style={{ flex: 1, padding: 13, borderRadius: 13, border: '1px solid var(--border-md)', fontSize: 14, color: 'var(--txt-2)', background: 'var(--bg-surface)' }}>
              ← Back
            </button>
          )}
          <button
            disabled={setupStep === 1 && !step1Valid}
            onClick={() => {
              if (setupStep === 0) dispatch({ type: 'SETUP_NEXT' });
              else dispatch({ type: 'SETUP_FINISH' });
            }}
            style={{ flex: 2, padding: 13, borderRadius: 13, background: setupStep === 1 && !step1Valid ? 'var(--border-md)' : `linear-gradient(135deg, ${sp.color}, ${sp.dark})`, color: '#fff', fontSize: 14, fontWeight: 500, boxShadow: setupStep === 1 && !step1Valid ? 'none' : `0 4px 16px ${sp.color}40`, transition: 'all 0.2s' }}>
            {setupStep === 0 ? 'Continue →' : 'Start farming 🐟'}
          </button>
        </div>
      </div>
    </div>
  );
}
