// ── cm → estimated weight lookup ──────────────────────────────────────────
export const CM_LUT = {
  1:0.05, 1.5:0.1, 2:0.2, 2.5:0.4, 3:0.7, 3.5:1.1,
  4:1.6, 4.5:2.2, 5:3.0, 5.5:4.0, 6:5.5, 7:8, 8:12, 9:18, 10:25,
};

export function cmToG(cm) {
  const keys = Object.keys(CM_LUT).map(Number).sort((a,b) => a-b);
  if (cm <= keys[0]) return CM_LUT[keys[0]];
  if (cm >= keys[keys.length-1]) return CM_LUT[keys[keys.length-1]];
  for (let i = 0; i < keys.length-1; i++) {
    const lo = keys[i], hi = keys[i+1];
    if (cm >= lo && cm <= hi) {
      const t = (cm - lo) / (hi - lo);
      return +(CM_LUT[lo] + t*(CM_LUT[hi] - CM_LUT[lo])).toFixed(2);
    }
  }
  return 0;
}

export const CM_REF = [
  {cm:1,   g:0.05, note:'Newly hatched fry'},
  {cm:1.5, g:0.1,  note:''},
  {cm:2,   g:0.2,  note:''},
  {cm:2.5, g:0.4,  note:''},
  {cm:3,   g:0.7,  note:'Start of fry stage'},
  {cm:3.5, g:1.1,  note:''},
  {cm:4,   g:1.6,  note:''},
  {cm:4.5, g:2.2,  note:''},
  {cm:5,   g:3.0,  note:'→ Switch to weight logging here'},
  {cm:6,   g:5.5,  note:'Juvenile stage begins'},
  {cm:7,   g:8,    note:''},
  {cm:8,   g:12,   note:''},
];

export const MEAL_TIMES = {
  5: ['7:00 AM','10:00 AM','1:00 PM','4:00 PM','7:00 PM'],
  4: ['7:00 AM','11:00 AM','2:00 PM','6:00 PM'],
  3: ['7:00 AM','12:30 PM','5:30 PM'],
  2: ['7:30 AM','5:30 PM'],
};

export const SPECIES = {
  gift: {
    name: 'GIFT Tilapia',
    icon: '🐟',
    color: '#0F6E56', dark: '#085041', light: '#E1F5EE', tint: '#9FE1CB',
    setupSummary: 'Hardiest option for a 1000L beginner tank. Best when you want low risk and quick harvest.',
    beginnerFit: 'Easiest',
    method: 'Freshwater tank',
    needsSalinity: false,
    waterTargets: {
      pH: ['7.0–8.0', '7.0–8.0', '< 6.5 or > 9 = danger'],
      temp: ['28–30°C', '28–30°C', '< 24°C or > 33°C = stress'],
      do_: ['> 5 mg/L', '> 5 mg/L', '< 3 mg/L = lethal'],
      nh3: ['< 0.5 mg/L', '< 0.5 mg/L', 'Higher pH = more toxic ammonia'],
      no2: ['< 0.1 mg/L', '< 0.1 mg/L', '> 0.5 mg/L = toxic'],
      alkalinity: ['80–150 ppm', '80–150 ppm', '< 50 ppm = pH crash risk'],
    },
    salt: 'Add 1g/L non-iodised salt — protects against nitrite. NOT brackish.',
    harvest: '5–6 months', hw: '400–600g',
    // Growth rate: g/day per stage (used for projections)
    growthRatePerDay: { Fry:0.6, Juvenile:1.8, Grower:2.8, 'Sub-adult':3.2, Finisher:2.5 },
    stages: [
      {l:'Fry',       mn:1,   mx:5,   p:32, sz:'0.8mm', r:6,   m:5, brand:'Growel Nutrish Starter / CP Aqua 0.8mm', price:'₹55–65/kg', tip:'Say: "Tilapia floating starter, 0.8mm, 32% protein"'},
      {l:'Juvenile',  mn:5,   mx:25,  p:28, sz:'1.2mm', r:4,   m:4, brand:'Growel Nutrish Junior / Happy Feeds 1.2mm', price:'₹45–55/kg', tip:'Say: "Tilapia grower, 1mm, 28% protein"'},
      {l:'Grower',    mn:25,  mx:100, p:28, sz:'2.0mm', r:3,   m:3, brand:'Aquatic Value Mass 2mm / CP Aqua Grower', price:'₹37–48/kg', tip:'Say: "Floating fish pellet, 2mm, 28% protein"'},
      {l:'Sub-adult', mn:100, mx:250, p:26, sz:'3.0mm', r:2.5, m:2, brand:'Aquatic Value Mass 3mm / Growel Finisher', price:'₹37–45/kg', tip:'Say: "Floating pellet, 3mm, 24–26% protein"'},
      {l:'Finisher',  mn:250, mx:900, p:22, sz:'4.0mm', r:2,   m:2, brand:'Aquatic Value Mass 4mm / CP Aqua Finisher', price:'₹37–42/kg', tip:'Say: "Floating pellet, 4mm, 22–24% protein"'},
    ],
    growth: [{m:0,g:3},{m:1,g:20},{m:3,g:120},{m:5,g:350},{m:6,g:600}],
    tips: [
      'Fit a mesh lid — tilapia jump when stressed',
      'Kerala borewell water is often acidic (pH 6). Add 50g lime per 1000L before stocking',
      'Add 1g/L non-iodised salt to reduce nitrite toxicity',
      'Keep a battery inverter — 2 hrs without aeration can be fatal',
      'Feed at 7–8 AM and 5–6 PM when fish are most active',
      'Monsoon rains can drop pH suddenly — keep baking soda ready',
    ],
  },
  karimeen: {
    name: 'Karimeen (Pearl Spot)',
    icon: '🐠',
    color: '#185FA5', dark: '#0C447C', light: '#E6F1FB', tint: '#85B7EB',
    setupSummary: 'Kerala-native premium fish. Slower growth, but familiar local market and brackish-water fit.',
    beginnerFit: 'Moderate',
    method: 'Brackish tank',
    needsSalinity: true,
    waterTargets: {
      pH: ['7.0–8.0', '7.0–8.0', '< 6.5 or > 9 = danger'],
      temp: ['28–30°C', '28–30°C', '< 24°C or > 33°C = stress'],
      do_: ['> 5 mg/L', '> 5 mg/L', '< 3 mg/L = lethal'],
      nh3: ['< 0.1 mg/L', '< 0.1 mg/L', 'Karimeen is sensitive to ammonia'],
      no2: ['< 0.1 mg/L', '< 0.1 mg/L', '> 0.5 mg/L = toxic'],
      sal: ['10–20 ppt', '10–20 ppt', '< 5 ppt = stress'],
    },
    salt: 'Marine salt mix ONLY — never table salt. 10kg per 1000L for 10 ppt.',
    harvest: '9–12 months', hw: '200–350g',
    growthRatePerDay: { Fry:0.4, Juvenile:0.9, Grower:1.2, 'Sub-adult':1.5, Finisher:1.2 },
    stages: [
      {l:'Fry',       mn:1,   mx:5,   p:35, sz:'0.8mm', r:5,   m:5, brand:'CP Aqua Starter / Growel Nutrish (crush)', price:'₹55–65/kg', tip:'Say: "Cichlid/brackish starter, 0.8mm, 35% protein"'},
      {l:'Juvenile',  mn:5,   mx:20,  p:32, sz:'1.2mm', r:4,   m:4, brand:'Pearlspot Feed Paravur / CP Aqua 1.2mm', price:'₹50–60/kg', tip:'Say: "Karimeen floating feed, 1mm, 30% protein"'},
      {l:'Grower',    mn:20,  mx:80,  p:30, sz:'2.0mm', r:3,   m:3, brand:'Pearlspot Feed Paravur / Aquatic Value 2mm', price:'₹45–55/kg', tip:'Say: "Floating cichlid pellet, 2mm, 28–30% protein"'},
      {l:'Sub-adult', mn:80,  mx:200, p:28, sz:'3.0mm', r:2.5, m:2, brand:'Growel Aqua 3mm / Aquatic Value 3mm', price:'₹40–50/kg', tip:'Say: "Floating pellet, 3mm, 28% protein"'},
      {l:'Finisher',  mn:200, mx:450, p:26, sz:'4.0mm', r:2,   m:2, brand:'Aquatic Value Mass 4mm / Growel Aqua 4mm', price:'₹37–45/kg', tip:'Say: "Floating fish feed, 4mm, 24–26% protein"'},
    ],
    growth: [{m:0,g:3},{m:2,g:15},{m:5,g:80},{m:9,g:200},{m:12,g:320}],
    tips: [
      'Use marine salt mix ONLY — iodised table salt kills Karimeen',
      'After monsoon rain: re-add marine salt to restore 10–15 ppt immediately',
      'Add PVC pipes and clay pots — Karimeen need hiding spots',
      'Monthly salt bath 5–10g/L for 10–15 min prevents skin parasites',
      'December cool spell — use a small heater to keep temp above 24°C',
      'Karimeen takes 9–12 months — daily growth of 0.5–1g is normal',
    ],
  },
  seabass: {
    name: 'Asian Seabass (Barramundi)',
    icon: '🐟',
    color: '#0E7490', dark: '#155E75', light: '#E0F7FA', tint: '#8ADDEA',
    setupSummary: 'Fast, high-value Kalanji for brackish cages or well-aerated tanks. Good profit potential, higher care needs.',
    beginnerFit: 'Moderate-hard',
    method: 'Brackish cage/tank',
    needsSalinity: true,
    waterTargets: {
      pH: ['7.5–8.5', '7.5–8.5', '< 6.5 or > 9 = danger'],
      temp: ['28–32°C', '28–32°C', '< 20°C or > 35°C = danger'],
      do_: ['> 6 mg/L', '> 6 mg/L', '< 4 mg/L = critical'],
      nh3: ['< 0.1 mg/L', '< 0.1 mg/L', '> 0.5 mg/L = dangerous'],
      no2: ['< 0.5 mg/L', '< 0.5 mg/L', '> 1.0 mg/L = harmful'],
      sal: ['5–20 ppt', '5–20 ppt', 'Avoid sudden monsoon drops'],
      alkalinity: ['100–200 ppm', '100–200 ppm', '< 50 ppm = unstable pH'],
    },
    salt: 'Best at 5–20 ppt brackish water. Change salinity slowly; monsoon rain can shock fish.',
    harvest: '8–10 months', hw: '1.8–2.5kg',
    growthRatePerDay: { Fry:2.2, Juvenile:3.5, Grower:5.2, 'Sub-adult':7.4, Finisher:8.2 },
    stages: [
      {l:'Fry',       mn:5,    mx:15,   p:48, sz:'1–2mm', r:8, m:4, brand:'Marine Feast / Growel seabass starter', price:'₹80–110/kg', tip:'Say: "Seabass floating starter, 1–2mm, 45–50% protein"'},
      {l:'Juvenile',  mn:15,   mx:50,   p:45, sz:'2–3mm', r:7, m:3, brand:'Avanti / Growel marine fish 2–3mm', price:'₹75–100/kg', tip:'Say: "Marine carnivore feed, 2–3mm, 45% protein"'},
      {l:'Grower',    mn:50,   mx:200,  p:43, sz:'3–4mm', r:6, m:2, brand:'CP Aqua / Growel seabass grower', price:'₹70–95/kg', tip:'Say: "Seabass grower pellet, 3–4mm, 40–45% protein"'},
      {l:'Sub-adult', mn:200,  mx:800,  p:40, sz:'4–6mm', r:4, m:2, brand:'Marine fish grower 4–6mm', price:'₹65–90/kg', tip:'Say: "Floating marine fish pellet, 4–6mm, 40% protein"'},
      {l:'Finisher',  mn:800,  mx:2600, p:38, sz:'6–9mm', r:2.5, m:1, brand:'Seabass finisher / marine fish finisher', price:'₹60–85/kg', tip:'Say: "Seabass finisher, 6–9mm, 35–40% protein"'},
    ],
    growth: [{m:0,g:10},{m:1,g:150},{m:3,g:300},{m:5,g:600},{m:7,g:1200},{m:9,g:2500}],
    tips: [
      'Start after monsoon — October to November stocking avoids the worst salinity swings',
      'Grade every 2–4 weeks — seabass cannibalism is expected if sizes vary',
      'Keep DO above 6 mg/L — run strong aeration before dawn and after rain',
      'Use high-protein pellets — trash fish fouls water quickly in small tanks',
      'Split 100 seed into two units — one net tear or oxygen crash should not wipe out all stock',
      'Harvest before peak monsoon — June to September floods and freshening raise risk',
    ],
  },
  tigerShrimp: {
    name: 'Tiger Shrimp (Black Tiger Prawn)',
    icon: '🦐',
    color: '#A8550D', dark: '#7C2D12', light: '#FFF1E6', tint: '#FDBA74',
    setupSummary: 'Premium brackish shrimp for ponds or lined tanks. High value, but water quality and disease risk are stricter.',
    beginnerFit: 'Hard',
    method: 'Brackish pond/tank',
    needsSalinity: true,
    waterTargets: {
      pH: ['7.5–8.5', '7.5–8.5', '< 7 or > 9 = stress'],
      temp: ['28–31°C', '28–31°C', '< 24°C or > 34°C = stress'],
      do_: ['> 5 mg/L', '> 5 mg/L', '< 4 mg/L = critical'],
      nh3: ['< 0.1 mg/L', '< 0.1 mg/L', '> 0.5 mg/L = dangerous'],
      no2: ['< 0.5 mg/L', '< 0.5 mg/L', '> 1.0 mg/L = harmful'],
      sal: ['15–25 ppt', '15–25 ppt', 'Keep stable through rain'],
      alkalinity: ['100–180 ppm', '100–180 ppm', '< 80 ppm = molting risk'],
    },
    salt: 'Target 15–25 ppt brackish water. Stability matters more than chasing exact salinity after every rain.',
    harvest: '4–6 months', hw: '40–80g',
    growthRatePerDay: { PL:0.03, Nursery:0.12, Juvenile:0.26, Grower:0.45, Finisher:0.55 },
    stages: [
      {l:'PL',       mn:0.01, mx:0.5, p:42, sz:'crumb', r:12, m:5, brand:'CP / Avanti shrimp starter crumb', price:'₹85–120/kg', tip:'Say: "Tiger shrimp PL starter crumb, 40%+ protein"'},
      {l:'Nursery',  mn:0.5,  mx:3,   p:40, sz:'0.6–1mm', r:8,  m:5, brand:'Avanti / Godrej shrimp nursery feed', price:'₹75–105/kg', tip:'Say: "Monodon nursery feed, 0.6–1mm"'},
      {l:'Juvenile', mn:3,    mx:12,  p:38, sz:'1.2–1.8mm', r:6, m:4, brand:'Grobest / Avanti shrimp grower 1', price:'₹70–95/kg', tip:'Say: "Black tiger shrimp grower pellet, 1.2–1.8mm"'},
      {l:'Grower',   mn:12,   mx:35,  p:36, sz:'2–2.5mm', r:4,  m:3, brand:'CP / Avanti monodon grower', price:'₹65–90/kg', tip:'Say: "Monodon grower feed, 2mm, 35–38% protein"'},
      {l:'Finisher', mn:35,   mx:85,  p:34, sz:'2.5–3mm', r:3,  m:2, brand:'Shrimp finisher 2.5–3mm', price:'₹60–85/kg', tip:'Say: "Black tiger shrimp finisher, 2.5–3mm"'},
    ],
    growth: [{m:0,g:0.02},{m:1,g:1},{m:2,g:8},{m:3,g:22},{m:5,g:60}],
    tips: [
      'Use PCR-tested PL — weak or diseased seed is the biggest crop-failure risk',
      'Stock after monsoon — November to April matches Kerala brackish paddy-shrimp season',
      'Use feeding trays — remove leftovers before they turn into ammonia',
      'Keep alkalinity stable — poor minerals cause soft-shell and molting problems',
      'Do not mix unknown wild shrimp — white spot and vibrio spread fast',
      'At 25–100 PL this is a learning trial — commercial profit needs much larger stocking',
    ],
  },
};

export const DISEASES = [
  {s:'White cottony patches on body or fins', d:'Fungal infection (Saprolegnia)', sev:'med', steps:[
    {n:'Isolate', t:'Move affected fish to a separate container immediately using tank water.'},
    {n:'Salt bath', t:'Non-iodised rock salt 5g/L. For 10L bucket = 50g. Immerse fish 10–15 min. If fish rolls over, return immediately.'},
    {n:'Water change', t:'30% water change + clean mechanical filter. Poor water quality is almost always the root cause.'},
    {n:'Repeat', t:'Every 48 hours for 3 cycles. Contact KUFOS Panangad if no improvement after 3 days.'},
    {n:'Prevention', t:'Monthly 2g/L salt bath for 10 min prevents recurrence. Maintain weekly 20–25% water changes.'},
  ]},
  {s:'Red streaks or sores on skin', d:'Bacterial infection (Aeromonas)', sev:'high', steps:[
    {n:'Emergency water change', t:'30–40% change immediately with dechlorinated water within 2°C of tank temp.'},
    {n:'Isolate', t:'Bacterial infections spread rapidly — move worst affected fish to separate container.'},
    {n:'Salt', t:'Non-iodised salt 1–2g/L to main tank. For Karimeen (already brackish), no extra salt needed.'},
    {n:'Root cause', t:'Test ammonia and nitrite — bacterial outbreaks almost always follow water quality crashes.'},
    {n:'Vet', t:'Contact NIFAM Aluva (+91 484 2604179). Common treatments: Oxytetracycline or Enrofloxacin — do NOT dose without guidance.'},
  ]},
  {s:'Gasping at surface, pale gills', d:'Low dissolved oxygen', sev:'high', steps:[
    {n:'Emergency', t:'Maximum aeration immediately. Connect backup pump. DO can crash within hours in Kerala summer.'},
    {n:'Water change', t:'25–30% with cooler, well-aerated water. Pour from height to introduce oxygen.'},
    {n:'Stop feeding', t:'Stop feeding. Resume only when DO is confirmed above 5 mg/L.'},
    {n:'Temperature', t:'Above 32°C reduces oxygen dramatically. Shade tank or add sealed frozen bottles — max 2°C drop per hour.'},
  ]},
  {s:'Fish rubbing against walls (flashing)', d:'Ectoparasites — ich or skin flukes', sev:'med', steps:[
    {n:'Confirm', t:'Tiny white spots = ich. Flashing without spots = flukes or ammonia irritation.'},
    {n:'Raise temperature slowly', t:'Raise to 30–32°C over 24 hours (max 0.5°C/hr). Speeds up parasite life cycle.'},
    {n:'Salt bath', t:'Non-iodised salt 3g/L — 30g per 10L. Immerse 10–15 min. Repeat every 48 hrs for 3 cycles.'},
    {n:'Main tank', t:'Add 1–2g/L salt. Daily 20% water changes for 7 days to remove cysts from substrate.'},
  ]},
  {s:'Not eating, hiding in corners', d:'Stress / poor water quality', sev:'low', steps:[
    {n:'Test water', t:'Almost always a water quality issue. Test pH, TAN, nitrite, temperature before anything else.'},
    {n:'Fix root cause', t:'pH < 6.5 → baking soda. NH₃ > 0.5 → 30% water change, stop feeding. Temp outside 26–32°C → shade or heat.'},
    {n:'25% water change', t:'Even if tests look ok, a water change removes stress-causing dissolved organics.'},
    {n:'Fast one day', t:'Skip feeding for 24 hours. Offer small amount after. If still refusing after 48 hrs, retest water.'},
  ]},
  {s:'Fin erosion, ragged fin edges', d:'Fin rot — bacterial', sev:'med', steps:[
    {n:'Water quality', t:'30% water change + clean mechanical filter immediately. Test ammonia and nitrite.'},
    {n:'Salt', t:'Non-iodised aquarium salt 1–2g/L. For Karimeen (brackish), no extra salt needed.'},
    {n:'Reduce stocking', t:'Overcrowding causes fin-nipping. Max 80 fish in 1000L.'},
    {n:'Topical', t:'Dab affected fin edges with Betadine (1:10 dilution) while briefly holding fish.'},
  ]},
  {s:'Bloated belly, floating sideways', d:'Dropsy / internal bacterial infection', sev:'high', steps:[
    {n:'Isolate immediately', t:'Move to hospital tank — any clean bucket with aerated tank water.'},
    {n:'Stop feeding', t:'Digestive system is compromised; feeding worsens internal pressure.'},
    {n:'Epsom salt soak', t:'Epsom salt (magnesium sulphate) 1 tablespoon per 4 litres. 15–20 min, twice daily.'},
    {n:'Seek vet', t:'Dropsy usually indicates systemic infection. Contact NIFAM Aluva for antibiotic guidance.'},
  ]},
  {s:'Cloudy or bulging eyes (popeye)', d:'Bacterial eye infection / Exophthalmia', sev:'med', steps:[
    {n:'Water change', t:'30% change — most effective first treatment for early cloudy eye.'},
    {n:'Salt', t:'Non-iodised aquarium salt 1g/L. For Karimeen no change needed.'},
    {n:'Vitamin A', t:'Add blanched spinach or spirulina flakes for 1–2 weeks.'},
    {n:'Vet', t:'True popeye with protruding eye needs vet treatment. Contact NIFAM Aluva.'},
  ]},
];

export const TEMP_ADVICE = [
  {season:'Summer (Mar–May)', icon:'☀️', water:'Can reach 31–34°C', risk:'Oxygen crash, heat stress',
   color:'#DC2626', bg:'#FEE2E2', actions:[
    'Cover with green agro-shade net (50% shade) — available at hardware stores in Kochi for ₹200–400',
    'Increase aeration to maximum — hot water holds significantly less dissolved oxygen',
    'Do water changes with well water (cooler). Pour from height to aerate',
    'Sealed frozen water bottles in tank — never more than 2°C drop per hour',
    'Shift feeding to 6:30 AM and 7 PM — avoid midday heat stress',
    'Cover top with mesh net to reduce direct sun and evaporation',
  ]},
  {season:'Monsoon (Jun–Sep)', icon:'🌧️', water:'Cools to 26–28°C (good)', risk:'pH crash, salinity drop, pathogens',
   color:'#185FA5', bg:'#E6F1FB', actions:[
    'Cover tank or build a sloped roof — direct rain dilutes salt and drops pH',
    'Test pH and salinity after every heavy rain. Keep baking soda (50g/bucket) ready',
    'For Karimeen: re-add marine salt after rain to restore 10–15 ppt',
    'Increase water change frequency — monsoon brings more organic matter and pathogens',
    'Watch for fungal infections (white cottony patches) — June–September is peak season',
    'Monthly prophylactic salt bath 2g/L during entire monsoon period',
  ]},
  {season:'Winter (Dec–Feb)', icon:'🌤️', water:'Drops to 24–27°C', risk:'Slow growth, weak immunity',
   color:'#B45309', bg:'#FEF3C7', actions:[
    'If water below 24°C, use a 200W aquarium heater — Kochi shops ₹400–800',
    'Reduce feeding by 20–30% — metabolism slows. Overfeeding in cold = ammonia spike',
    'Increase disease monitoring — immune systems weaken in cold weather',
    'For Karimeen: maintain salinity even in winter. Cool water + low salt = double stress',
    'Feed only once or twice a day between noon and 2 PM — warmest part of the day',
  ]},
];

export const SHOPS = [
  {n:'Pearlspot Seed / Karimeen Kunju', p:'Paravur, Ernakulam', t:'Fingerlings + Floating Feed', note:'Best local Karimeen source'},
  {n:'Pulari Fish Farm', p:'Ernakulam', t:'GIFT and Karimeen fingerlings', note:'Verified tilapia + Karimeen seed'},
  {n:'Fortune Merchandiser', p:'Edapally, Kochi', t:'Floating fish feed', note:'Floating pellets from ₹32/kg'},
  {n:'Aqua Farm', p:'Haripad, Alappuzha', t:'GIFT and Karimeen seed', note:'~60km, good for wholesale'},
  {n:'Agri/FRP shops, Aluva', p:'Aluva, Ernakulam', t:'Growel / CP Aqua / Value Mass', note:'Use shopkeeper phrase from Feed tab'},
];

export const GOVT = [
  {n:'Kerala Fisheries Dept.', r:'Aquaculture support and licensing', c:'0471-2525200 · fisheriesdirector@gmail.com'},
  {n:'KUFOS Panangad', r:'Research and farmer training — 12km from EKM', c:'kufos.ac.in · Panangad, Kochi'},
  {n:'NIFAM Aluva', r:'Fisheries training, Ernakulam district', c:'+91 484 2604179 · nifamaluva@gmail.com'},
];

export const GIFT_NATURAL_FEEDS = [
  {
    k: 'azolla',
    n: 'Azolla',
    kind: 'Floating fern',
    bestFor: 'Best natural add-on for juvenile and grower GIFT',
    replacePct: { juvenile: 10, grower: 20 },
    weekly: { juvenile: '2-3 times/week', grower: '3-5 times/week' },
    minWeight: 10,
    source: 'KAU Azolla culture, local azolla growers, Ernakulam agri shops',
    prep: 'Rinse well, shade-drain for 10-15 min, feed fresh. Remove leftovers after 20-30 min.',
    why: 'Good protein-rich green supplement. Trials in tilapia support moderate use, but pushing it too high can reduce growth.',
    caution: 'Do not let azolla fully cover the tank surface. Keep it clean and pesticide-free.',
  },
  {
    k: 'duckweed',
    n: 'Duckweed',
    kind: 'Floating aquatic plant',
    bestFor: 'Useful once fish are actively surface-feeding',
    replacePct: { juvenile: 10, grower: 15 },
    weekly: { juvenile: '2-3 times/week', grower: '3-4 times/week' },
    minWeight: 25,
    source: 'Best from your own clean culture tub or trusted pond-plant source',
    prep: 'Rinse, feed only from clean water culture, and offer in a ring/tray so it stays visible.',
    why: 'Tilapia digest duckweed well at moderate levels. Fresh duckweed is safer as a supplement than as a full feed replacement.',
    caution: 'Never harvest from drainage canals, stagnant roadside water, or pesticide-exposed ponds.',
  },
  {
    k: 'moringa',
    n: 'Moringa leaves',
    kind: 'Drumstick leaf',
    bestFor: 'Occasional green leaf supplement, not a main feed',
    replacePct: { juvenile: 5, grower: 10 },
    weekly: { juvenile: '1-2 times/week', grower: '2-3 times/week' },
    minWeight: 25,
    source: 'Fresh household moringa leaves, vegetable markets, nursery-grown moringa',
    prep: 'Use tender leaves only. Wash, wilt in shade, chop finely, and mix with a little wet pellet feed.',
    why: 'Research supports low inclusion. Higher moringa levels can depress growth because of fiber and anti-nutritional factors.',
    caution: 'Do not dump whole branches or fibrous mature leaves into the tank.',
  },
];

export const GIFT_NATURAL_FEED_TIPS = [
  'Use pellet feed as the base diet. Natural greens are supplements, not the main ration.',
  'Start with the lower end for 3-4 days and watch feeding response before increasing.',
  'Give greens in the first half of the day so leftovers can be removed before evening.',
  'Skip natural greens on days with poor appetite, low oxygen, heavy rain, or ammonia stress.',
  'Rinse every leaf or floating plant well before feeding.',
  'If water clouds or fish leave feed untouched after 15-20 minutes, cut the amount next time.',
];

export const GIFT_NATURAL_FEED_AVOID = [
  { n:'Oleander / Arali', why:'Highly toxic cardiac glycosides. Never feed leaves, flowers, or trimmings.' },
  { n:'Yellow oleander / Manja arali', why:'Toxic cardenolides. Unsafe even in small amounts.' },
  { n:'Castor / Amanakku', why:'Contains ricin. Avoid leaves, seed cake, and seeds completely.' },
  { n:'Lantana', why:'Toxic lantadenes in leaves. Not a fodder plant.' },
  { n:'Unknown ornamental leaves', why:'If a leaf is grown mainly as an ornamental, assume unsafe unless proven edible.' },
  { n:'Roadside or pesticide-sprayed greens', why:'Chemical residue is a bigger risk than the plant itself.' },
  { n:'Rotting or yellowed greens', why:'Fast water fouling and bacterial load.' },
];

export const GIFT_NATURAL_FEED_DOS_DONTS = {
  dos: [
    'Feed chopped tender greens only after fish are already trained to take pellets.',
    'Limit natural greens more tightly in fry and small juveniles.',
    'Use a floating ring, tray, or one feeding corner so you can monitor intake.',
    'Reduce pellet grams only when the fish actually finish the natural supplement.',
    'Keep a separate small azolla or duckweed tub if you want steady supply.',
  ],
  donts: [
    'Do not replace the full pellet ration with leaves or pond plants.',
    'Do not feed large handfuls late in the evening.',
    'Do not use tough stems, mature fibrous leaves, or market waste with spoilage.',
    'Do not feed plants collected from sewage channels or polluted ponds.',
    'Do not continue a supplement if fish spit it out repeatedly or water quality drops.',
  ],
};
