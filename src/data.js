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
    color: '#0F6E56', dark: '#085041', light: '#E1F5EE', tint: '#9FE1CB',
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
    color: '#185FA5', dark: '#0C447C', light: '#E6F1FB', tint: '#85B7EB',
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
