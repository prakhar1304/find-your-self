import { ABILITY, ABILS, abilityPath, DOMAINS, EVIDENCE, INTEREST, IPIP, PAIRS, RIASEC, RIA_NAME, VALUES, type Answers, type Ria } from './questions.ts';
import { AXES, CAREERS, type Axis, type Career } from './careers.ts';
const avg = (x: number[]) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : 0);
const pct = (n: number) => Math.round(Math.max(0, Math.min(100, n)));
const pearson = (x: number[], y: number[]) => {
  const mx = avg(x), my = avg(y); let a = 0, b = 0, c = 0;
  x.forEach((v, i) => { a += (v - mx) * (y[i] - my); b += (v - mx) ** 2; c += (y[i] - my) ** 2; });
  return b && c ? a / Math.sqrt(b * c) : 0;
};
const ABIL_SCORE: Record<string, number> = { '111': 100, '110': 85, '101': 70, '011': 60, '100': 50, '010': 40, '001': 25, '000': 10 };
export type Match = { career: Career; score: number; parts: { interest: number; strength: number; values: number; domain: number }; warn: string[]; why: string[] };

export function score(a: Answers) {
  const interest = Object.fromEntries(RIASEC.map(r => {
    const got = INTEREST[r].map((_, i) => Number(a[`int_${r}${i}`])).filter(n => n >= 1);
    return [r, pct((avg(got) - 1) * 25)];
  })) as Record<Ria, number>;
  const big = Object.fromEntries((['O', 'C', 'E', 'A', 'N'] as const).map(f => [f, pct((avg(IPIP.flatMap((x, i) => {
    const v = Number(a[`ip${i}`]); return x[1] === f && v ? [x[2] === 1 ? v : 6 - v] : []; })) - 1) * 25)])) as Record<'O' | 'C' | 'E' | 'A' | 'N', number>;
  const abil = Object.fromEntries(ABILS.map(k => [k, ABIL_SCORE[abilityPath(k, a).map(l => Number(a[`ab_${k}_${l}`]) === ABILITY[k].items[l].a ? 1 : 0).join('')] ?? 0])) as Record<string, number>;
  const ev = Object.fromEntries(EVIDENCE.map(([k]) => [k, (Number(a[`ev_${k}`]) || 0) * 25])) as Record<string, number>;
  const top2 = (...k: string[]) => Math.max(...k.map(x => ev[x]));
  const axes: Record<Axis, number> = {
    Numbers: abil.num, Words: abil.word, Logic: abil.logic, Spatial: abil.space,
    Creativity: pct(.6 * big.O + .4 * top2('write', 'design')), People: pct(.5 * big.A + .5 * ev.help),
    Influence: pct(.5 * big.E + .5 * top2('persuade', 'sell')), Discipline: pct(.7 * big.C + .3 * ev.organise),
    Making: pct(top2('build', 'code') * .8 + ev.ai * .2), Calm: pct(100 - big.N),
  };
  const val = Object.fromEntries(VALUES.map(([k]) => [k, 0])) as Record<string, number>;
  PAIRS.forEach((_, i) => { if (a[`vp${i}`]) val[a[`vp${i}`]]++; });
  const picked: string[] = a.domains ?? [], deals = new Set<string>(a.deal ?? []);
  if (a.blood === 'no') deals.add('blood'); if (a.screen === 'no') deals.add('code'); if (a.risk === 'no') deals.add('risk');
  const DEAL: Record<string, string> = { sales: 'involves selling', public: 'involves public speaking', desk: 'is mostly desk work', field: 'is physical or outdoor', blood: 'involves blood or illness', shift: 'has night shifts', code: 'needs coding', risk: 'has unsteady income' };
  const matches: Match[] = CAREERS.map(c => {
    const i = (pearson(RIASEC.map(r => interest[r]), c.ria) + 1) / 2;
    const s = avg(c.need.map(n => Math.min(1, axes[n] / 75)));
    const v = Math.min(1, avg(c.val.map(k => val[k] / 3)));
    const hit = c.dom.filter(d => picked.includes(d)), d = hit.length ? 1 : .25;
    const warn = c.flag.filter(f => deals.has(f)).map(f => `You ruled this out: it ${DEAL[f]}.`);
    let mult = warn.length ? .6 : 1;
    const early = ['s10', 's12'].includes(a.stage);
    if (c.yrs > Number(a.study || 9) && (early || c.req || c.yrs >= 5)) { mult *= .85; warn.push(`Needs about ${c.yrs} years of training after class 12; you said less.`); }
    if (a.stage === 's12' && c.req && !String(a.stream).includes(c.req === 'pcm' ? 'pcm' : 'pcb') && a.stream !== 'pcmb') { mult *= .6; warn.push(`Usually needs ${c.req === 'pcm' ? 'maths' : 'biology'} in class 12.`); }
    else if (c.req && !early) warn.push('Has entry requirements. Check whether your degree qualifies.');
    const why: string[] = [];
    if (i > .75) why.push(`Interests line up: ${[...RIASEC].sort((x, y) => c.ria[RIASEC.indexOf(y)] - c.ria[RIASEC.indexOf(x)]).slice(0, 2).map(r => RIA_NAME[r].toLowerCase()).join(' + ')}`);
    const strong = c.need.filter(n => axes[n] >= 65); if (strong.length) why.push(`You are strong in ${strong.join(', ')}`);
    const vv = c.val.filter(k => val[k] >= 2).map(k => VALUES.find(x => x[0] === k)![1].toLowerCase()); if (vv.length) why.push(`Offers what you chose: ${vv.join(', ')}`);
    if (hit.length) why.push(`In a world you picked: ${hit.map(h => DOMAINS.find(x => x.v === h)!.t).join(', ')}`);
    const gap = c.need.filter(n => axes[n] < 45); if (gap.length) warn.push(`Build up: ${gap.join(', ')}.`);
    return { career: c, score: pct((.4 * i + .25 * s + .15 * v + .2 * d) * 100 * mult), parts: { interest: pct(i * 100), strength: pct(s * 100), values: pct(v * 100), domain: pct(d * 100) }, warn, why };
  }).sort((x, y) => y.score - x.score);

  // How much to trust this run.
  const sc = IPIP.map((_, i) => Number(a[`ip${i}`])).filter(Boolean), it = RIASEC.map(r => interest[r]);
  const quality: string[] = [];
  if (sc.length && Math.max(...sc.map(n => sc.filter(x => x === n).length)) / sc.length >= .85) quality.push('You gave nearly the same answer to every personality question, so that part is unreliable.');
  if (Math.max(...it) - Math.min(...it) < 15) quality.push('Your interests are almost level, so career order is weak. Try things before choosing.');
  if (Number(a.age) < 16) quality.push('Interests still shift a lot under 16. Use this to explore, not to lock in.');
  if (ABILS.filter(k => abil[k] <= 25).length >= 3) quality.push('Most skill tasks were missed. If you rushed, redo them.');
  if (matches[0].score - matches[4].score < 4) quality.push('Your top five are within a few points of each other. Treat them as equal.');
  const rank = (o: Record<string, number>) => Object.entries(o).sort((x, y) => y[1] - x[1]);
  const code = rank(interest).slice(0, 3).map(x => x[0]).join('');
  return { interest, big, abil, ev, axes, val, matches, quality, code, strong: rank(axes).slice(0, 3), weak: rank(axes).slice(-3).reverse(), likes: rank(interest).slice(0, 2), dislikes: rank(interest).slice(-2).reverse(), axisOrder: AXES };
}
export type Result = ReturnType<typeof score>;
