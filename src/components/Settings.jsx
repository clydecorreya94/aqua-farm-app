import { useState } from 'react';
import { useApp } from '../AppContext';
import { SectionHead, Card } from './UI';

const THEME_OPTIONS = [
  { v:'auto',  label:'Auto',  desc:'Follows system preference', icon:'🌓' },
  { v:'light', label:'Light', desc:'Always light mode',          icon:'☀️' },
  { v:'dark',  label:'Dark',  desc:'Always dark mode',           icon:'🌙' },
];

export default function Settings() {
  const { state, dispatch, sp, buildDailySummary, sendTelegramNotification } = useApp();
  const { theme, telegramBotToken, telegramChatId, telegramEnabled, telegramTestStatus } = state;

  const [localToken, setLocalToken]  = useState(telegramBotToken);
  const [localChat,  setLocalChat]   = useState(telegramChatId);
  const [localEnabled, setLocalEnabled] = useState(telegramEnabled);
  const [testing, setTesting] = useState(false);

  const saveTelegram = () => {
    dispatch({ type:'SAVE_TELEGRAM', token:localToken, chatId:localChat, enabled:localEnabled });
  };

  const testTelegram = async () => {
    if (!localToken || !localChat) {
      dispatch({ type:'SET_TELEGRAM_STATUS', status:'❌ Please enter both Bot Token and Chat ID first.' });
      return;
    }
    setTesting(true);
    dispatch({ type:'SET_TELEGRAM_STATUS', status:'⏳ Sending test message…' });
    // Save first so sendTelegramNotification has latest values
    dispatch({ type:'SAVE_TELEGRAM', token:localToken, chatId:localChat, enabled:true });
    await new Promise(r => setTimeout(r, 200)); // let state update
    try {
      const resp = await fetch(`https://api.telegram.org/bot${localToken}/sendMessage`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ chat_id:localChat, text:'🐟 Clyde\'s AquaFarm — Test message!\n\nYour Telegram notifications are set up correctly. Daily feed reminders will be sent here.', parse_mode:'HTML' }),
      });
      const data = await resp.json();
      if (data.ok) {
        dispatch({ type:'SET_TELEGRAM_STATUS', status:'✅ Test message sent! Check your Telegram.' });
      } else {
        dispatch({ type:'SET_TELEGRAM_STATUS', status:`❌ Error: ${data.description || 'Check your Bot Token and Chat ID'}` });
      }
    } catch {
      dispatch({ type:'SET_TELEGRAM_STATUS', status:'❌ Network error — check your internet connection.' });
    }
    setTesting(false);
  };

  const sendNowSummary = async () => {
    if (!telegramBotToken || !telegramChatId || !telegramEnabled) {
      dispatch({ type:'SET_TELEGRAM_STATUS', status:'❌ Save and enable Telegram first.' });
      return;
    }
    setTesting(true);
    dispatch({ type:'SET_TELEGRAM_STATUS', status:'⏳ Sending daily summary…' });
    const msg = buildDailySummary();
    const ok = await sendTelegramNotification(msg);
    dispatch({ type:'SET_TELEGRAM_STATUS', status: ok ? '✅ Daily summary sent!' : '❌ Failed to send — check settings.' });
    setTesting(false);
  };

  return (
    <div className="page-content">
      <SectionHead>Appearance</SectionHead>

      {/* Theme toggle */}
      <Card>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>Theme</div>
          <div style={{ fontSize:12, color:'var(--txt-2)', marginBottom:14, lineHeight:1.6 }}>
            Choose how the app looks. Auto follows your device setting.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {THEME_OPTIONS.map(opt => (
              <button key={opt.v} onClick={() => dispatch({ type:'SET_THEME', theme:opt.v })}
                style={{ padding:'14px 10px', borderRadius:12, border:`2px solid ${theme === opt.v ? sp.color : 'var(--border-md)'}`, background: theme === opt.v ? sp.light : 'var(--bg-surface)', textAlign:'center', cursor:'pointer', transition:'all 0.15s' }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{opt.icon}</div>
                <div style={{ fontSize:13, fontWeight:500, color: theme === opt.v ? sp.color : 'var(--txt-1)' }}>{opt.label}</div>
                <div style={{ fontSize:10, color:'var(--txt-3)', marginTop:3, lineHeight:1.5 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <SectionHead>Telegram notifications</SectionHead>

      <Card>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>How to set up Telegram</div>
          <div style={{ background:'var(--bg-surface)', borderRadius:10, padding:'13px 15px', marginBottom:16 }}>
            {[
              ['1', 'Open Telegram and search for @BotFather'],
              ['2', 'Send /newbot — follow prompts to create a bot'],
              ['3', 'Copy the Bot Token BotFather gives you'],
              ['4', 'Search for @userinfobot or open your bot and send /start'],
              ['5', 'Copy your Chat ID (a number like 123456789)'],
              ['6', 'Paste both below and tap Save + Test'],
            ].map(([n, t]) => (
              <div key={n} style={{ display:'flex', gap:11, padding:'7px 0', borderBottom: n < '6' ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:sp.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:sp.color, flexShrink:0 }}>{n}</div>
                <span style={{ fontSize:12, color:'var(--txt-1)', lineHeight:1.55 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Bot token */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Bot Token</div>
            <input type="text"
              value={localToken}
              onChange={e => setLocalToken(e.target.value)}
              placeholder="e.g. 7123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          {/* Chat ID */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--txt-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Chat ID</div>
            <input type="text"
              value={localChat}
              onChange={e => setLocalChat(e.target.value)}
              placeholder="e.g. 123456789"
            />
          </div>

          {/* Enable toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'var(--bg-surface)', borderRadius:10, marginBottom:14 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500 }}>Enable notifications</div>
              <div style={{ fontSize:11, color:'var(--txt-3)', marginTop:2 }}>Sends daily feed summary each morning</div>
            </div>
            <button onClick={() => setLocalEnabled(!localEnabled)}
              style={{ width:44, height:25, borderRadius:99, background: localEnabled ? sp.color : 'var(--border-md)', position:'relative', transition:'background 0.2s', border:'none', cursor:'pointer', flexShrink:0 }}>
              <div style={{ width:19, height:19, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: localEnabled ? 22 : 3, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:8, marginBottom: telegramTestStatus ? 12 : 0 }}>
            <button onClick={saveTelegram}
              style={{ flex:1, padding:'11px', borderRadius:11, background:`linear-gradient(135deg, ${sp.color}, ${sp.dark})`, color:'#fff', fontSize:13, fontWeight:500, border:'none', cursor:'pointer' }}>
              Save settings
            </button>
            <button onClick={testTelegram} disabled={testing}
              style={{ flex:1, padding:'11px', borderRadius:11, border:'1.5px solid var(--border-md)', background:'var(--bg-surface)', color:'var(--txt-2)', fontSize:13, cursor:'pointer' }}>
              {testing ? 'Sending…' : 'Test message'}
            </button>
          </div>

          {telegramTestStatus && (
            <div style={{ marginTop:10, padding:'10px 13px', borderRadius:9, background: telegramTestStatus.includes('✅') ? 'var(--c-ok-l)' : telegramTestStatus.includes('⏳') ? 'var(--bg-surface)' : 'var(--c-danger-l)', fontSize:12, color: telegramTestStatus.includes('✅') ? 'var(--c-ok)' : telegramTestStatus.includes('⏳') ? 'var(--txt-2)' : 'var(--c-danger)', lineHeight:1.6 }}>
              {telegramTestStatus}
            </div>
          )}
        </div>
      </Card>

      {/* Send daily summary now */}
      {telegramEnabled && telegramBotToken && (
        <>
          <SectionHead>Send summary</SectionHead>
          <Card>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>Send daily summary now</div>
              <div style={{ fontSize:12, color:'var(--txt-2)', marginBottom:14, lineHeight:1.6 }}>
                Sends today's feed schedule, growth projections, and daily checklist to your Telegram right now.
              </div>
              <button onClick={sendNowSummary} disabled={testing}
                style={{ width:'100%', padding:'12px', borderRadius:11, background:`linear-gradient(135deg, ${sp.color}, ${sp.dark})`, color:'#fff', fontSize:13, fontWeight:500, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>📨</span>
                {testing ? 'Sending…' : 'Send daily summary to Telegram'}
              </button>
            </div>
          </Card>
        </>
      )}

      {/* What the daily message contains */}
      <SectionHead>Daily message preview</SectionHead>
      <Card>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ fontSize:12, color:'var(--txt-2)', marginBottom:12, lineHeight:1.6 }}>
            The daily message sent to your Telegram includes:
          </div>
          {[
            ['🐠', 'Fish status', 'Species, count, current weight, stage'],
            ['🍽', 'Feeding today', 'Daily total, per meal grams, all meal times, next meal'],
            ['📈', 'Growth progress', 'Next milestone weight and date, harvest date estimate'],
            ['✅', 'Daily checklist', 'Key care tasks for the day'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)', alignItems:'flex-start' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{title}</div>
                <div style={{ fontSize:12, color:'var(--txt-2)' }}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize:12, color:'var(--txt-3)', marginTop:12, lineHeight:1.65 }}>
            💡 <strong>Scheduling tip:</strong> To get this automatically every morning, use a Telegram bot scheduler or set a daily reminder to open Settings → Send daily summary. Full automated scheduling can be added by connecting to a server cron job.
          </div>
        </div>
      </Card>

      <SectionHead>App info</SectionHead>
      <Card>
        <div style={{ padding:'16px 18px' }}>
          {[
            ['App', "Clyde's AquaFarm Kerala"],
            ['Version', 'v5.0'],
            ['Fish', state.fish === 'gift' ? 'GIFT Tilapia' : 'Karimeen (Pearl Spot)'],
            ['Tank', '1000L concrete ring tank · Ernakulam'],
            ['Storage', 'Saved to device (localStorage)'],
          ].map(([l, v], i, arr) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', fontSize:13, borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color:'var(--txt-2)' }}>{l}</span>
              <span style={{ fontWeight:500, color:'var(--txt-1)' }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ height:20 }} />
    </div>
  );
}
