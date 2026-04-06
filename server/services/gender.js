import pool from '../config/db.js';

/**
 * IBGE Census Gender Detection Service
 * 
 * Uses https://servicodados.ibge.gov.br/api/v2/censos/nomes/{nome}?sexo=M|F
 * to detect gender based on first name frequency in Brazilian census data.
 * 
 * Results:
 *   'masculino'                — >90% male frequency → send to Meta as 'm'
 *   'feminino'                 — <10% male frequency → send to Meta as 'f'
 *   'provavelmente masculino'  — 60-90% male → send to Meta as 'm'
 *   'provavelmente feminino'   — 10-40% male → send to Meta as 'f'
 *   'ambiguo'                  — 40-60% male → DON'T send to Meta
 *   'desconhecido'             — no data found → DON'T send to Meta
 */

/**
 * Detect gender from a first name using IBGE API.
 * Returns: 'masculino' | 'feminino' | 'provavelmente masculino' | 'provavelmente feminino' | 'ambiguo' | 'desconhecido'
 */
export async function detectGender(firstName) {
  if (!firstName) return 'desconhecido';

  // Clean: remove accents, trim, uppercase first letter
  const clean = firstName.trim().split(/\s+/)[0]; // First name only
  if (!clean) return 'desconhecido';

  try {
    const encoded = encodeURIComponent(clean);

    // Two parallel calls: one for M, one for F
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const [resM, resF] = await Promise.all([
      fetch(`https://servicodados.ibge.gov.br/api/v2/censos/nomes/${encoded}?sexo=M`, { signal: controller.signal }),
      fetch(`https://servicodados.ibge.gov.br/api/v2/censos/nomes/${encoded}?sexo=F`, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    const dataM = await resM.json();
    const dataF = await resF.json();

    // Sum all period frequencies
    const freqM = Array.isArray(dataM) && dataM.length > 0
      ? dataM[0].res.reduce((sum, item) => sum + (item.frequencia || 0), 0)
      : 0;

    const freqF = Array.isArray(dataF) && dataF.length > 0
      ? dataF[0].res.reduce((sum, item) => sum + (item.frequencia || 0), 0)
      : 0;

    const total = freqM + freqF;

    if (total === 0) return 'desconhecido';

    const propM = freqM / total;

    if (propM > 0.9) return 'masculino';
    if (propM < 0.1) return 'feminino';
    if (propM > 0.6) return 'provavelmente masculino';
    if (propM < 0.4) return 'provavelmente feminino';
    return 'ambiguo';
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn('[Gender] IBGE API error (silent):', err.message);
    }
    return 'desconhecido';
  }
}

/**
 * Convert gender string to Meta CAPI value.
 * Returns 'm', 'f', or null (don't send).
 */
export function genderToMeta(gender) {
  if (gender === 'masculino' || gender === 'provavelmente masculino') return 'm';
  if (gender === 'feminino' || gender === 'provavelmente feminino') return 'f';
  return null; // ambiguo or desconhecido — don't send
}

/**
 * Detect gender for a sale and save to DB.
 * Fire-and-forget — never blocks.
 * 
 * @param {number} saleId - Sale row ID
 * @param {string} customerName - Full name from Cakto
 * @returns {string} Detected gender
 */
export async function detectAndSaveGender(saleId, customerName) {
  try {
    const firstName = (customerName || '').trim().split(/\s+/)[0];
    const gender = await detectGender(firstName);

    await pool.query(
      'UPDATE sales SET gender = $1, gender_source = $2 WHERE id = $3',
      [gender, 'ibge', saleId]
    );

    console.log(`[Gender] Sale #${saleId}: "${firstName}" → ${gender}`);
    return gender;
  } catch (err) {
    console.warn('[Gender] Save error (silent):', err.message);
    return 'desconhecido';
  }
}
