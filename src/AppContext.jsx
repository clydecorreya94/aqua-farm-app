/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { SPECIES, MEAL_TIMES, cmToG } from './data';

const AppContext = createContext(null);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function weekKeyFor(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function entryWeight(entry) {
  if (!entry) return null;
  return entry.type === 'length' ? entry.estG : entry.w;
}

function normalizeRecurringChecks(state) {
  const today = todayIso();
  const weekKey = weekKeyFor();
  const nextState = { ...state };

  if (nextState.dailyCheckedDate !== today) {
    nextState.dailyChecked = {};
    nextState.dailyCheckedDate = today;
  }

  if (nextState.weeklyCheckedKey !== weekKey) {
    nextState.weeklyChecked = {};
    nextState.weeklyCheckedKey = weekKey;
  }

  return nextState;
}

// ── Growth projection engine ───────────────────────────────────────────────
// Given a starting weight on a start date, project future weights day by day
export function projectGrowth(startW, startDateStr, species) {
  const sp = SPECIES[species];
  const milestones = [];
  let w = startW;
  const startDate = new Date(startDateStr);

  // Project up to harvest
  const harvestTarget = sp.growth[sp.growth.length - 1].g;
  let day = 0;
  const maxDays = 400;

  while (w < harvestTarget && day < maxDays) {
    const stage = sp.stages.find(s => w >= s.mn && w < s.mx) || sp.stages[sp.stages.length - 1];
    const ratePerDay = sp.growthRatePerDay[stage.l] || 1;
    w = +(w + ratePerDay).toFixed(2);
    day++;

    // Record milestones
    const milestoneWeights = [5, 10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600];
    for (const mw of milestoneWeights) {
      if (w >= mw && !milestones.find(m => m.targetG === mw)) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + day);
        milestones.push({
          targetG: mw,
          date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          daysFromNow: Math.max(0, day - Math.floor((Date.now() - startDate) / 86400000)),
          stage: stage.l,
        });
      }
    }
  }

  // Add harvest milestone
  if (w >= harvestTarget) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + day);
    milestones.push({
      targetG: harvestTarget,
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      daysFromNow: Math.max(0, day - Math.floor((Date.now() - startDate) / 86400000)),
      stage: 'Harvest',
      isHarvest: true,
    });
  }

  return milestones;
}

// Current projected weight based on start date + start weight
export function currentProjectedWeight(startW, startDateStr, species) {
  return projectedWeightFrom(startW, startDateStr, species, 0);
}

export function projectedWeightFrom(startW, startDateStr, species, extraDays = 0) {
  const sp = SPECIES[species];
  const startDate = new Date(startDateStr);
  const daysPassed = Math.max(0, Math.floor((Date.now() - startDate) / 86400000) + extraDays);
  let w = startW;
  for (let d = 0; d < daysPassed; d++) {
    const stage = sp.stages.find(s => w >= s.mn && w < s.mx) || sp.stages[sp.stages.length - 1];
    const ratePerDay = sp.growthRatePerDay[stage.l] || 1;
    w = +(w + ratePerDay).toFixed(2);
  }
  return w;
}

// ── Initial state ──────────────────────────────────────────────────────────
const initialState = {
  screen: 'setup',
  setupStep: 0,
  fish: 'gift',
  cnt: 25,
  setupSizeMode: 'cm',
  setupCm: '3',
  setupGrams: '',

  // The "anchor" — set once from first log or setup, never changes unless user resets
  anchorDate: null,       // ISO date string of first size entry
  anchorWeight: null,     // grams at anchor date
  avgW: 0.7,

  tab: 'today',
  theme: 'auto',          // 'auto' | 'light' | 'dark'

  dailyChecked: {},
  dailyCheckedDate: null,
  weeklyChecked: {},
  weeklyCheckedKey: null,

  // Water — individual keys to avoid stale closure bug
  waterPH: '', waterTemp: '', waterDO: '', waterNH3: '', waterNO2: '', waterSal: '',
  waterHistory: [],
  waterSaved: false,

  growthLog: [],
  growthInput: '',
  cmInput: '',
  growthMode: 'weight',

  feedWStr: '3',
  feedCStr: '25',

  scaleTarget: 100,
  feedBought: {},
  feedBoughtInput: '',
  feedBoughtUnit: 'g',

  learnSub: 'ref',
  diseaseSearch: '',
  diseaseOpen: -1,
  tempOpen: {},

  confirmDel: null,
  showResetConfirm: false,

  // Telegram settings
  telegramBotToken: '',
  telegramChatId: '',
  telegramEnabled: false,
  telegramTestStatus: '',
};

// ── Reducer ────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET': return { ...state, [action.key]: action.value };
    case 'SET_MANY': return { ...state, ...action.payload };

    case 'SETUP_FISH': return { ...state, fish: action.fish };
    case 'SETUP_NEXT': return { ...state, setupStep: state.setupStep + 1 };
    case 'SETUP_BACK': return { ...state, setupStep: Math.max(0, state.setupStep - 1) };

    case 'SETUP_FINISH': {
      let avgW;
      if (state.setupSizeMode === 'cm') {
        avgW = cmToG(parseFloat(state.setupCm) || 3);
      } else {
        avgW = parseFloat(state.setupGrams) || 1;
      }
      const today = todayIso();
      return {
        ...state,
        screen: 'main',
        setupStep: 0,
        avgW,
        anchorWeight: avgW,
        anchorDate: today,
        feedWStr: String(avgW),
        feedCStr: String(state.cnt),
      };
    }

    case 'TOGGLE_DAILY': {
      const currentDate = todayIso();
      const dailyChecked = state.dailyCheckedDate === currentDate ? state.dailyChecked : {};
      return {
        ...state,
        dailyCheckedDate: currentDate,
        dailyChecked: { ...dailyChecked, [action.id]: !dailyChecked[action.id] },
      };
    }
    case 'TOGGLE_WEEKLY': {
      const currentWeek = weekKeyFor();
      const weeklyChecked = state.weeklyCheckedKey === currentWeek ? state.weeklyChecked : {};
      return {
        ...state,
        weeklyCheckedKey: currentWeek,
        weeklyChecked: { ...weeklyChecked, [action.id]: !weeklyChecked[action.id] },
      };
    }

    case 'SET_WATER_PARAM':
      return { ...state, ['water' + action.field]: action.value };

    case 'SAVE_WATER': {
      const entry = {
        pH: state.waterPH, temp: state.waterTemp, do_: state.waterDO,
        nh3: state.waterNH3, no2: state.waterNO2, sal: state.waterSal,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      return {
        ...state,
        waterHistory: [entry, ...state.waterHistory.slice(0, 19)],
        waterPH:'', waterTemp:'', waterDO:'', waterNH3:'', waterNO2:'', waterSal:'',
        waterSaved: true,
      };
    }
    case 'WATER_SAVED_RESET': return { ...state, waterSaved: false };

    case 'ADD_GROWTH_WEIGHT': {
      const w = parseFloat(action.weight);
      if (!w || w <= 0) return state;
      const today = todayIso();
      const entry = { type: 'weight', w, c: state.cnt, d: new Date().toLocaleDateString('en-IN'), iso: today };
      return {
        ...state,
        growthLog: [entry, ...state.growthLog.slice(0, 29)],
        avgW: w,
        anchorDate: state.anchorDate || today,
        anchorWeight: state.anchorWeight || w,
        growthInput: '',
        feedWStr: String(w),
      };
    }

    case 'ADD_GROWTH_LENGTH': {
      const cm = parseFloat(action.cm);
      if (!cm || cm <= 0) return state;
      const estG = cmToG(cm);
      const today = todayIso();
      const entry = { type: 'length', cm, estG, c: state.cnt, d: new Date().toLocaleDateString('en-IN'), iso: today };
      return {
        ...state,
        growthLog: [entry, ...state.growthLog.slice(0, 29)],
        avgW: estG,
        anchorDate: state.anchorDate || today,
        anchorWeight: state.anchorWeight || estG,
        cmInput: '',
        feedWStr: String(estG),
      };
    }

    case 'DELETE_WATER': {
      const wh = [...state.waterHistory];
      wh.splice(action.idx, 1);
      return { ...state, waterHistory: wh, confirmDel: null };
    }
    case 'DELETE_GROWTH': {
      const gl = [...state.growthLog];
      gl.splice(action.idx, 1);
      const latest = gl[0];
      const latestWeight = entryWeight(latest);
      const fallbackWeight = state.anchorWeight || state.avgW;
      const nextAvgW = latestWeight ?? fallbackWeight;
      return {
        ...state,
        growthLog: gl,
        avgW: nextAvgW,
        feedWStr: String(nextAvgW),
        confirmDel: null,
      };
    }

    case 'LOG_FEED_BOUGHT': {
      const raw = parseFloat(action.amount);
      if (!raw || raw <= 0) return state;
      const kgVal = action.unit === 'g' ? +(raw / 1000).toFixed(4) : +raw.toFixed(3);
      const prev = parseFloat(state.feedBought[action.stage]) || 0;
      return {
        ...state,
        feedBought: { ...state.feedBought, [action.stage]: +(prev + kgVal).toFixed(4) },
        feedBoughtInput: '',
      };
    }

    case 'TOGGLE_TEMP':
      return { ...state, tempOpen: { ...state.tempOpen, [action.idx]: !state.tempOpen[action.idx] } };

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'SAVE_TELEGRAM':
      return { ...state, telegramBotToken: action.token, telegramChatId: action.chatId, telegramEnabled: action.enabled };

    case 'SET_TELEGRAM_STATUS':
      return { ...state, telegramTestStatus: action.status };

    case 'RESET': return { ...initialState };

    default: return state;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    // Persist to localStorage
    try {
      const saved = localStorage.getItem('aquafarm_v5');
      return saved ? normalizeRecurringChecks({ ...init, ...JSON.parse(saved) }) : normalizeRecurringChecks(init);
    } catch { return normalizeRecurringChecks(init); }
  });

  // Save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem('aquafarm_v5', JSON.stringify(state));
    } catch {
      // Ignore storage write failures in restricted/private browsing contexts.
    }
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') root.setAttribute('data-theme', 'dark');
    else if (state.theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  }, [state.theme]);

  useEffect(() => {
    const syncRecurringChecks = () => {
      const normalized = normalizeRecurringChecks(state);
      if (
        normalized.dailyCheckedDate !== state.dailyCheckedDate ||
        normalized.weeklyCheckedKey !== state.weeklyCheckedKey
      ) {
        dispatch({
          type: 'SET_MANY',
          payload: {
            dailyChecked: normalized.dailyChecked,
            dailyCheckedDate: normalized.dailyCheckedDate,
            weeklyChecked: normalized.weeklyChecked,
            weeklyCheckedKey: normalized.weeklyCheckedKey,
          },
        });
      }
    };

    syncRecurringChecks();
    const intervalId = setInterval(syncRecurringChecks, 60000);
    return () => clearInterval(intervalId);
  }, [state.dailyCheckedDate, state.weeklyCheckedKey, state.dailyChecked, state.weeklyChecked]);

  const sp = SPECIES[state.fish];

  const getStage = useCallback((w) => {
    const stages = sp.stages;
    return stages.find(s => w >= s.mn && w < s.mx) || stages[stages.length - 1];
  }, [sp]);

  const feedW = Math.max(0.1, parseFloat(state.feedWStr) || 1);
  const feedC = Math.max(1, parseInt(state.feedCStr) || 1);
  const latestGrowthEntry = state.growthLog[0] || null;
  const latestLoggedWeight = entryWeight(latestGrowthEntry);
  const projectionAnchorDate = latestGrowthEntry?.iso || state.anchorDate;
  const projectionAnchorWeight = latestLoggedWeight ?? state.anchorWeight;

  // Use projected current weight if we have an anchor
  const projectedW = projectionAnchorDate && projectionAnchorWeight
    ? currentProjectedWeight(projectionAnchorWeight, projectionAnchorDate, state.fish)
    : state.avgW;
  const tomorrowProjectedW = projectionAnchorDate && projectionAnchorWeight
    ? projectedWeightFrom(projectionAnchorWeight, projectionAnchorDate, state.fish, 1)
    : state.avgW;

  // Use the latest logged size when available, otherwise fall back to projection.
  const effectiveW = latestLoggedWeight ?? projectedW;
  const tomorrowStage = getStage(tomorrowProjectedW);
  const tomorrowBiomass = state.cnt * tomorrowProjectedW;
  const tomorrowDailyFeed = +(tomorrowBiomass * tomorrowStage.r / 100).toFixed(1);
  const tomorrowPerMeal = +(tomorrowDailyFeed / tomorrowStage.m).toFixed(1);
  const tomorrowMeals = MEAL_TIMES[tomorrowStage.m] || MEAL_TIMES[3];

  const currentStage = getStage(effectiveW);
  const biomass = state.cnt * effectiveW;
  const dailyFeed = +(biomass * currentStage.r / 100).toFixed(1);
  const perMeal = +(dailyFeed / currentStage.m).toFixed(1);
  const meals = MEAL_TIMES[currentStage.m] || MEAL_TIMES[3];

  const nextMeal = useCallback(() => {
    const now = new Date();
    const tot = now.getHours() * 60 + now.getMinutes();
    const minsArr = meals.map(t => {
      const [hm, ap] = t.split(' ');
      let [h, m] = hm.split(':').map(Number);
      if (ap === 'PM' && h !== 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    });
    const idx = minsArr.findIndex(m => m > tot);
    return {
      label: idx >= 0 ? meals[idx] : meals[0] + ' (tomorrow)',
      num: idx >= 0 ? idx + 1 : 1,
      minutesAway: idx >= 0 ? minsArr[idx] - tot : 0,
    };
  }, [meals]);

  const waterLog = {
    pH: state.waterPH, temp: state.waterTemp, do_: state.waterDO,
    nh3: state.waterNH3, no2: state.waterNO2, sal: state.waterSal,
  };

  const getWaterStatus = useCallback((key, val) => {
    const n = parseFloat(val);
    if (isNaN(n) || val === '') return null;
    const good = { pH:[7,8], temp:[28,30], do_:[5,8], nh3: state.fish==='gift'?[0,0.3]:[0,0.05], no2:[0,0.05], sal:[10,20] };
    const warn = { pH:[6.5,8.5], temp:[24,33], do_:[4,8], nh3: state.fish==='gift'?[0,0.5]:[0,0.1], no2:[0,0.2], sal:[5,25] };
    const [gl, gh] = good[key] || [0, 100];
    if (n >= gl && n <= gh) return { l:'Good', color:'#16A34A', bg:'#DCFCE7' };
    const [wl, wh] = warn[key] || [0, 100];
    if (n >= wl && n <= wh) return { l:'Check', color:'#B45309', bg:'#FEF3C7' };
    return { l:'Danger', color:'#DC2626', bg:'#FEE2E2' };
  }, [state.fish]);

  const calcFeedForCycle = useCallback((st, fishCount) => {
    const avgW = (st.mn + st.mx) / 2;
    const days = Math.round((st.mx - st.mn) / (avgW * st.r / 100));
    return +((fishCount * avgW * st.r / 100) * days / 1000).toFixed(2);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  // Growth projections based on anchor
  const growthProjections = projectionAnchorDate && projectionAnchorWeight
    ? projectGrowth(projectionAnchorWeight, projectionAnchorDate, state.fish)
    : [];

  // Send Telegram notification
  const sendTelegramNotification = useCallback(async (message) => {
    if (!state.telegramEnabled || !state.telegramBotToken || !state.telegramChatId) return false;
    try {
      const resp = await fetch(`https://api.telegram.org/bot${state.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: state.telegramChatId, text: message, parse_mode: 'HTML' }),
      });
      const data = await resp.json();
      return data.ok;
    } catch {
      return false;
    }
  }, [state.telegramEnabled, state.telegramBotToken, state.telegramChatId]);

  // Build daily summary message
  const buildDailySummary = useCallback(() => {
    const s = SPECIES[state.fish];
    const stage = getStage(effectiveW);
    const meals_ = MEAL_TIMES[stage.m] || MEAL_TIMES[3];
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const nextM = nextMeal();
    const proj = growthProjections.find(p => !p.isHarvest && p.daysFromNow > 0);
    const harvest = growthProjections.find(p => p.isHarvest);

    return `🐟 <b>Clyde's AquaFarm — Daily Update</b>
📅 ${today}

<b>🐠 Fish Status</b>
Species: ${s.name}
Count: ${state.cnt} fish
Current weight: ~${effectiveW.toFixed(1)}g
Stage: ${stage.l} (${stage.sz} pellet)

<b>🍽 Feeding Today</b>
Daily total: ${dailyFeed}g
Per meal: ${perMeal}g (${stage.m} meals)
Meal times: ${meals_.join(', ')}
Next meal: ${nextM.label}${nextM.minutesAway > 0 ? ` (in ${nextM.minutesAway} min)` : ''}

<b>📈 Growth Progress</b>
${proj ? `Next milestone: ${proj.targetG}g by ${proj.date} (${proj.daysFromNow} days)` : ''}
${harvest ? `🎯 Harvest target: ${harvest.date} (${harvest.daysFromNow} days away)` : ''}

<b>✅ Daily checklist</b>
${['Check aeration is running', 'Observe fish behaviour', 'Remove uneaten feed after meals', 'Check water temperature (28–30°C)', 'Log feeding after each meal'].map(t => `• ${t}`).join('\n')}

<i>Sent by Clyde's AquaFarm Kerala 🌿</i>`;
  }, [state, effectiveW, dailyFeed, perMeal, growthProjections, getStage, nextMeal]);

  return (
    <AppContext.Provider value={{
      state, dispatch, sp, getStage, currentStage,
      biomass, dailyFeed, perMeal, meals, nextMeal,
      waterLog, getWaterStatus, calcFeedForCycle, getGreeting,
      feedW, feedC, effectiveW, projectedW,
      tomorrowProjectedW, tomorrowStage, tomorrowDailyFeed, tomorrowPerMeal, tomorrowMeals,
      projectionAnchorDate, projectionAnchorWeight,
      growthProjections,
      sendTelegramNotification, buildDailySummary,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
