import test from 'node:test';
import assert from 'node:assert/strict';
import { ABILITY, ABILS, abilityPath, buildFlow, INTEREST, IPIP, PAIRS, VALUES, type Answers, type Ria } from '../src/lib/questions.ts';
import { INTEREST_EG, IPIP_EG } from '../src/lib/examples.ts';
import { CAREERS } from '../src/lib/careers.ts';
import { score } from '../src/lib/score.ts';
import { markdown } from '../src/lib/report.ts';

type P = { ria: Record<string, number>; first: Record<string, any>; ev: Record<string, number>; vals: string[]; right?: boolean; pers?: (i: number) => number };
function run(p: P) {
  const a: Answers = {}; let n = 0;
  for (;;) {
    const q = buildFlow(a).find(x => a[x.id] === undefined); if (!q) break; assert.ok(++n < 200, 'flow must end');
    const m = q.id.match(/^ab_(\w+)_(L\w+)$/);
    a[q.id] = p.first[q.id] !== undefined ? p.first[q.id] : q.id.startsWith('int_') ? String(p.ria[q.id[4]] ?? 2)
      : q.id.startsWith('ip') ? String(p.pers ? p.pers(+q.id.slice(2)) : 3) : m ? String(p.right === false ? (ABILITY[m[1]].items as any)[m[2]].a + 1 & 3 : (ABILITY[m[1]].items as any)[m[2]].a)
      : q.id.startsWith('ev_') ? String(p.ev[q.id.slice(3)] ?? 0) : q.id.startsWith('vp') ? (q.opts!.find(o => p.vals.includes(o.v)) ?? q.opts![0]).v
      : q.kind === 'multi' ? [] : q.kind === 'number' ? '20' : q.kind === 'email' ? 'a@b.co' : q.opts ? q.opts[0].v : 'x';
  }
  return { a, n, r: score(a) };
}
test('each value appears three times', () => VALUES.forEach((_, i) => assert.equal(PAIRS.flat().filter(x => x === i).length, 3)));
test('career data is complete', () => CAREERS.forEach(c => { assert.equal(c.ria.length, 6, c.n); assert.ok(c.ria.every(x => x >= 0)); c.val.forEach(v => assert.ok(VALUES.some(x => x[0] === v), c.n + v)); }));
test('every short item has an example', () => {
  const { a } = run(cases[0][1]);
  buildFlow(a).filter(q => /^(int_|ip\d|ev_)/.test(q.id)).forEach(q => assert.ok(q.eg, q.id));
  Object.entries(INTEREST).forEach(([k, x]) => assert.equal(INTEREST_EG[k as Ria].length, x.length));
  assert.equal(IPIP_EG.length, IPIP.length);
});
test('skill tasks adapt', () => {
  assert.deepEqual(abilityPath('num', {}), ['L3']);
  assert.deepEqual(abilityPath('num', { ab_num_L3: '1', ab_num_L4: '0' }), ['L3', 'L4', 'L5']);
  assert.deepEqual(abilityPath('num', { ab_num_L3: '0', ab_num_L2: '0' }), ['L3', 'L2', 'L1']);
  ABILS.forEach(k => assert.equal(Object.keys(ABILITY[k].items).length, 6));
});
const cases: [string, P, RegExp][] = [
  ['coder', { ria: { I: 5, C: 4, R: 3 }, first: { stage: 'college', domains: ['tech', 'data'], screen: 'ok', study: '5' }, ev: { code: 4, ai: 3 }, vals: ['learn', 'money'] }, /AI|data|fintech|software|cyber/i],
  ['carer', { ria: { S: 5, I: 3 }, first: { stage: 's12', stream: 'pcb', domains: ['health', 'mind'], blood: 'ok', study: '9' }, ev: { help: 3 }, vals: ['impact', 'stable'] }, /nurse|doctor|therap|psycholog|counsel|social|educator/i],
  ['artist', { ria: { A: 5, E: 3 }, first: { stage: 'grad', domains: ['design', 'media'], risk: 'ok', study: '3' }, ev: { design: 4, write: 3 }, vals: ['create', 'free'] }, /design|film|content|writer|musician/i],
  ['seller', { ria: { E: 5, S: 3, C: 3 }, first: { stage: 'work', jobfeel: 'wrong', domains: ['biz'], risk: 'ok', study: '1' }, ev: { sell: 4, persuade: 4 }, vals: ['money', 'free'] }, /founder|sales|product manager|market|event|HR/i],
  ['trade', { ria: { R: 5 }, first: { stage: 's10', domains: ['build', 'energy'], study: '1' }, ev: { build: 4 }, vals: ['stable'] }, /technician|electrician|engineer/i],
];
for (const [name, p, re] of cases) test(`persona: ${name}`, () => {
  const { a, n, r } = run(p); console.log(name, n, r.matches.slice(0, 5).map(m => `${m.career.n} ${m.score}`).join(' | '));
  r.matches.slice(0, 3).forEach(m => assert.match(m.career.n, re));
  assert.ok(Object.values(r.axes).every(x => x >= 0 && x <= 100)); assert.ok(!/undefined|NaN/.test(markdown(a, r)));
});
test('refusing blood lowers nursing', () => {
  const base = cases[1][1], f = (x: any) => run({ ...base, first: { ...base.first, ...x } }).r.matches.find(m => m.career.n.startsWith('Nurse'))!.score;
  assert.ok(f({ blood: 'no' }) < f({ blood: 'ok' }));
});
test('flat answers are flagged', () => assert.ok(run({ ria: { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, first: { stage: 'grad', study: '3' }, ev: {}, vals: [] }).r.quality.length >= 2));
