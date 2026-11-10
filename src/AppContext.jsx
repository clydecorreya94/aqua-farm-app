/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { SPECIES, MEAL_TIMES, cmToG } from './data';
import { isoLocal, weekKey, daysBetween, addDays } from './lib/dates';

const AppContext = createContext(null);

const SCHEMA_VERSION = 6;
const STORAGE_KEY = 'aquafarm_v5'; // unchanged so existing devices keep their data
const MAX_WATER_LOGS = 100;
const MAX_GROWTH_LOGS = 100;

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function getLatestGrowthEntry(log) {
  if (!Array.isArray(log) || log.length === 0) return null;
  return [...log].sort((a, b) => String(b?.iso || '').localeCompare(String(a?.iso || '')))[0];
}

function entryWeight(entry) {
  if (!entry) return null;
  return entry.type === 'length' ? entry.estG : entry.w;
}

function normalizeRecurringChecks(state) {
  const today = isoLocal();
  const currentWeek = weekKey();
  const nextState = { ...state };

  if (nextState.dailyCheckedDate !== today) {
    nextState.dailyChecked = {};
    nextState.dailyCheckedDate = today;
  }

  if (nextState.weeklyCheckedKey !== currentWeek) {
    nextState.weeklyChecked = {};
    nextState.weeklyCheckedKey = currentWeek;
  }

  return nextState;
}

// ── Growth projection engine ───────────────────────────────────────────────
// Given a starting weight on a start date, project future weights day by day
const MILESTONE_WEIGHTS = [5, 10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600];

export function projectGrowth(startW, startDateStr, species) {
  const sp = SPECIES[species] || SPECIES.gift;
  const milestones = [];
  let w = startW;

  // Project up to harvest
  const harvestTarget = sp.growth[sp.growth.length - 1].g;
  const elapsedDays = daysBetween(startDateStr, isoLocal());
  let day = 0;
  const maxDays = 400;

  while (w < harvestTarget && day < maxDays) {
    const stage = sp.stages.find(s => w >= s.mn && w < s.mx) || sp.stages[sp.stages.length - 1];
    const ratePerDay = sp.growthRatePerDay[stage.l] || 1;
    w = +(w + ratePerDay).toFixed(2);
    day++;

    // Record milestones. Harvest is appended separately, so skip any milestone
    // at or past the harvest target to avoid duplicate cards.
    for (const mw of MILESTONE_WEIGHTS) {
      if (mw >= harvestTarget) continue;
      if (w >= mw && !milestones.find(m => m.targetG === mw)) {
        milestones.push({
          targetG: mw,
          date: addDays(startDateStr, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          daysFromNow: Math.max(0, day - elapsedDays),
          stage: stage.l,
        });
      }
    }
  }

  // Add harvest milestone
  if (w >= harvestTarget) {
    milestones.push({
      targetG: harvestTarget,
      date: addDays(startDateStr, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      daysFromNow: Math.max(0, day - elapsedDays),
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
  const sp = SPECIES[species] || SPECIES.gift;
  const daysPassed = Math.max(0, daysBetween(startDateStr, isoLocal()) + extraDays);
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
  schemaVersion: SCHEMA_VERSION,
  screen: 'setup',
  setupStep: 0,
  fish: 'gift',
  cnt: 25,
  tankLitres: 1000,
  setupSizeMode: 'cm',
  setupCm: '3',
  setupGrams: '',

  // Immutable setup baseline. Growth logs project from the latest entry instead.
  anchorDate: null,       // ISO date string of the starting size
  anchorWeight: null,     // grams at that date
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
      const today = isoLocal();
      return {
        ...state,
        screen: 'main',
        setupStep: 0,
        avgW,
        cnt: clampInt(state.cnt, 1, 500, 25),
        tankLitres: clampInt(state.tankLitres, 100, 10000, 1000),
        anchorWeight: avgW,
        anchorDate: today,
        feedWStr: String(avgW),
        schemaVersion: SCHEMA_VERSION,
      };
    }

    case 'TOGGLE_DAILY': {
      const currentDate = isoLocal();
      const dailyChecked = state.dailyCheckedDate === currentDate ? state.dailyChecked : {};
      return {
        ...state,
        dailyCheckedDate: currentDate,
        dailyChecked: { ...dailyChecked, [action.id]: !dailyChecked[action.id] },
      };
    }
    case 'TOGGLE_WEEKLY': {
      const currentWeek = weekKey();
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
      const toNum = v => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : null;
      };
      const entry = {
        pH: toNum(state.waterPH), temp: toNum(state.waterTemp), do_: toNum(state.waterDO),
        nh3: toNum(state.waterNH3), no2: toNum(state.waterNO2), sal: toNum(state.waterSal),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      return {
        ...state,
        waterHistory: [entry, ...state.waterHistory].slice(0, MAX_WATER_LOGS),
        waterPH:'', waterTemp:'', waterDO:'', waterNH3:'', waterNO2:'', waterSal:'',
        waterSaved: true,
      };
    }
    case 'WATER_SAVED_RESET': return { ...state, waterSaved: false };

    case 'ADD_GROWTH_WEIGHT': {
      const w = parseFloat(action.weight);
      if (!w || w <= 0) return state;
      const today = isoLocal();
      const entry = { type: 'weight', w, c: state.cnt, d: new Date().toLocaleDateString('en-IN'), iso: today };
      return {
        ...state,
        growthLog: [entry, ...state.growthLog].slice(0, MAX_GROWTH_LOGS),
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
      const today = isoLocal();
      const entry = { type: 'length', cm, estG, c: state.cnt, d: new Date().toLocaleDateString('en-IN'), iso: today };
      return {
        ...state,
        growthLog: [entry, ...state.growthLog].slice(0, MAX_GROWTH_LOGS),
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
      // Pick the newest remaining entry by date, never "whatever was at index 0".
      const latest = getLatestGrowthEntry(gl);
      const latestWeight = entryWeight(latest);
      // Never fall back to the deleted entry's weight: use the setup baseline.
      const nextAvgW = latestWeight ?? state.anchorWeight ?? state.avgW;
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
// Validate and upgrade anything loaded from disk. A stale or hand-edited value
// used to be able to crash a render (unknown species, missing arrays).
function migrate(saved, init) {
  if (!saved || typeof saved !== 'object') return init;
  const next = { ...init, ...saved };

  if (!SPECIES[next.fish]) next.fish = init.fish;
  next.cnt = clampInt(next.cnt, 1, 500, init.cnt);
  next.tankLitres = clampInt(next.tankLitres, 100, 10000, init.tankLitres);
  next.setupStep = clampInt(next.setupStep, 0, 1, 0);
  next.theme = ['auto', 'light', 'dark'].includes(next.theme) ? next.theme : 'auto';
  next.tab = ['today', 'feed', 'plan', 'water', 'growth', 'learn', 'settings'].includes(next.tab) ? next.tab : 'today';
  next.growthLog = Array.isArray(next.growthLog)
    ? next.growthLog.filter(g => g && typeof g === 'object').slice(0, MAX_GROWTH_LOGS)
    : [];
  next.waterHistory = Array.isArray(next.waterHistory) ? next.waterHistory.slice(0, MAX_WATER_LOGS) : [];
  next.dailyChecked = next.dailyChecked && typeof next.dailyChecked === 'object' ? next.dailyChecked : {};
  next.weeklyChecked = next.weeklyChecked && typeof next.weeklyChecked === 'object' ? next.weeklyChecked : {};
  next.tempOpen = next.tempOpen && typeof next.tempOpen === 'object' ? next.tempOpen : {};
  next.feedBought = next.feedBought && typeof next.feedBought === 'object' ? next.feedBought : {};

  if (!Number.isFinite(parseFloat(next.avgW))) next.avgW = init.avgW;

  // Recover a baseline if an older build lost it, so projections always have an origin.
  if (!next.anchorDate) {
    const earliest = [...next.growthLog]
      .sort((a, b) => String(a?.iso || '').localeCompare(String(b?.iso || '')))[0];
    next.anchorDate = earliest?.iso || null;
    next.anchorWeight = next.anchorWeight ?? entryWeight(earliest) ?? null;
  }

  next.schemaVersion = SCHEMA_VERSION;
  delete next.feedCStr; // split count field from older builds
  return next;
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normalizeRecurringChecks(migrate(raw ? JSON.parse(raw) : null, init));
    } catch {
      return normalizeRecurringChecks(init);
    }
  });

  // Save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const sp = SPECIES[state.fish] || SPECIES.gift;

  const getStage = useCallback((w) => {
    const stages = sp.stages;
    return stages.find(s => w >= s.mn && w < s.mx) || stages[stages.length - 1];
  }, [sp]);

  const feedW = Math.max(0.1, parseFloat(state.feedWStr) || 1);
  const latestGrowthEntry = useMemo(() => getLatestGrowthEntry(state.growthLog), [state.growthLog]);
  const latestLoggedWeight = entryWeight(latestGrowthEntry);
  const projectionAnchorDate = latestGrowthEntry?.iso || state.anchorDate;
  const projectionAnchorWeight = latestLoggedWeight ?? state.anchorWeight;

  // Projections are the heaviest calculation in the app. Only rerun them when the
  // anchor, species or last logged weight changes — not on every keystroke.
  const projectedW = useMemo(
    () => (projectionAnchorDate && projectionAnchorWeight
      ? currentProjectedWeight(projectionAnchorWeight, projectionAnchorDate, state.fish)
      : state.avgW),
    [projectionAnchorDate, projectionAnchorWeight, state.fish, state.avgW],
  );
  const tomorrowProjectedW = useMemo(
    () => (projectionAnchorDate && projectionAnchorWeight
      ? projectedWeightFrom(projectionAnchorWeight, projectionAnchorDate, state.fish, 1)
      : state.avgW),
    [projectionAnchorDate, projectionAnchorWeight, state.fish, state.avgW],
  );

  // Once we have an anchor, today's feed should follow the same day-by-day
  // projection as tomorrow's feed instead of freezing at the last logged weight.
  const effectiveW = projectionAnchorDate && projectionAnchorWeight
    ? projectedW
    : (latestLoggedWeight ?? state.avgW);
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
    const ranges = {
      gift: {
        good: { pH:[7,8], temp:[28,30], do_:[5,8], nh3:[0,0.3], no2:[0,0.05], sal:[0,2] },
        warn: { pH:[6.5,8.5], temp:[24,33], do_:[4,8], nh3:[0,0.5], no2:[0,0.2], sal:[0,3] },
      },
      karimeen: {
        good: { pH:[7,8], temp:[28,30], do_:[5,8], nh3:[0,0.05], no2:[0,0.05], sal:[10,20] },
        warn: { pH:[6.5,8.5], temp:[24,33], do_:[4,8], nh3:[0,0.1], no2:[0,0.2], sal:[5,25] },
      },
      seabass: {
        good: { pH:[7.5,8.5], temp:[28,32], do_:[6,10], nh3:[0,0.1], no2:[0,0.5], sal:[5,20] },
        warn: { pH:[6.5,9], temp:[24,35], do_:[4,10], nh3:[0,0.5], no2:[0,1], sal:[1,35] },
      },
      tigerShrimp: {
        good: { pH:[7.5,8.5], temp:[28,31], do_:[5,10], nh3:[0,0.1], no2:[0,0.5], sal:[15,25] },
        warn: { pH:[7,9], temp:[24,34], do_:[4,10], nh3:[0,0.5], no2:[0,1], sal:[10,30] },
      },
    };
    const selected = ranges[state.fish] || ranges.gift;
    const good = selected.good;
    const warn = selected.warn;
    const [gl, gh] = good[key] || [0, 100];
    if (n >= gl && n <= gh) return { l:'Good', color:'#16A34A', bg:'#DCFCE7' };
    const [wl, wh] = warn[key] || [0, 100];
    if (n >= wl && n <= wh) return { l:'Check', color:'#B45309', bg:'#FEF3C7' };
    return { l:'Danger', color:'#DC2626', bg:'#FEE2E2' };
  }, [state.fish]);

  // Days in a stage come from the growth model (g/day); the feed rate only sets
  // how much is eaten at a given body weight. Mixing the two made the feeding
  // plan disagree with the growth projections.
  const calcFeedForCycle = useCallback((st, fishCount) => {
    const ratePerDay = sp.growthRatePerDay[st.l] || 1;
    const days = Math.max(1, Math.round((st.mx - st.mn) / ratePerDay));
    const avgW = (st.mn + st.mx) / 2;
    const avgDailyKg = (fishCount * avgW * st.r / 100) / 1000;
    return +(avgDailyKg * days).toFixed(2);
  }, [sp]);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  // Growth projections based on anchor
  const growthProjections = useMemo(
    () => (projectionAnchorDate && projectionAnchorWeight
      ? projectGrowth(projectionAnchorWeight, projectionAnchorDate, state.fish)
      : []),
    [projectionAnchorDate, projectionAnchorWeight, state.fish],
  );

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
      feedW, effectiveW, projectedW,
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
