// Physical plausibility limits for a water reading.
// Values outside these are almost always a typo (e.g. pH 70), not a real tank.
export const WATER_LIMITS = {
  pH: [0, 14],
  temp: [0, 50],
  do_: [0, 30],
  nh3: [0, 50],
  no2: [0, 50],
  sal: [0, 40],
};

const LABELS = {
  pH: 'pH',
  temp: 'Temperature',
  do_: 'Dissolved O₂',
  nh3: 'Ammonia',
  no2: 'Nitrite',
  sal: 'Salinity',
};

/**
 * Validates a partial water reading.
 * A reading may contain any subset of parameters, but at least one is required.
 * @returns {{ok: true} | {ok: false, message: string}}
 */
export function validateWaterReading(values) {
  let filled = 0;

  for (const [key, [min, max]] of Object.entries(WATER_LIMITS)) {
    const raw = values?.[key];
    if (raw === '' || raw === null || raw === undefined) continue;

    const n = Number(raw);
    if (!Number.isFinite(n)) {
      return { ok: false, message: `${LABELS[key]} must be a number.` };
    }
    if (n < min || n > max) {
      return { ok: false, message: `${LABELS[key]} must be between ${min} and ${max}.` };
    }
    filled++;
  }

  if (filled === 0) {
    return { ok: false, message: 'Enter at least one reading before saving.' };
  }

  return { ok: true };
}
