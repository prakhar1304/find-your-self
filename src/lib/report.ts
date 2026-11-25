import { buildFlow, RIA_NAME, VALUES, type Answers, type Ria } from './questions.ts';
import { SOURCES } from './careers.ts';
import type { Result } from './score.ts';
export function radar(data: [string, number][], label: string): string {
  const W = 520, H = 400, cx = W / 2, cy = H / 2, R = 138, n = data.length;
  const at = (i: number, k: number) => { const t = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + R * k * Math.cos(t), cy + R * k * Math.sin(t)]; };
  const poly = (k: (i: number) => number) => data.map((_, i) => at(i, k(i)).map(v => v.toFixed(1)).join(',')).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}: ${data.map(d => `${d[0]} ${d[1]}`).join(', ')}">
${[.25, .5, .75, 1].map(k => `<polygon points="${poly(() => k)}" class="ring"/>`).join('')}
${data.map((_, i) => { const [x, y] = at(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="ring"/>`; }).join('')}
<polygon points="${poly(i => data[i][1] / 100)}" class="shape"/>
${data.map((d, i) => { const [x, y] = at(i, d[1] / 100), [lx, ly] = at(i, 1.17); const an = Math.abs(lx - cx) < 12 ? 'middle' : lx > cx ? 'start' : 'end';
    return `<g><title>${d[0]}: ${d[1]} / 100</title><circle cx="${x}" cy="${y}" r="13" fill="transparent"/><circle cx="${x}" cy="${y}" r="4.5" class="dot"/></g><text x="${lx}" y="${ly + 4}" text-anchor="${an}" class="lab">${d[0]} <tspan class="num">${d[1]}</tspan></text>`; }).join('')}</svg>`;
}
export const axisData = (r: Result): [string, number][] => r.axisOrder.map(k => [k, r.axes[k]]);
export const riaData = (r: Result): [string, number][] => (Object.keys(r.interest) as Ria[]).map(k => [RIA_NAME[k], r.interest[k]]);
export const BIG: Record<string, string> = { O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Emotional sensitivity' };
export const valRank = (r: Result) => Object.entries(r.val).sort((a, b) => b[1] - a[1]).map(([k, n]) => [VALUES.find(v => v[0] === k)![1], n] as const);

export function answerText(a: Answers) {
  return buildFlow(a).filter(q => a[q.id] !== undefined && a[q.id] !== '').map(q => {
    const v = a[q.id]; const t = q.kind === 'scale' ? `${v}/5` : Array.isArray(v) ? v.map(x => q.opts?.find(o => o.v === x)?.t ?? x).join(', ') : q.opts?.find(o => o.v === String(v))?.t ?? String(v);
    return { section: q.section, q: q.text, a: t };
  });
}
/** Markdown written so it can be pasted straight into any AI chat. */
export function markdown(a: Answers, r: Result): string {
  const top = r.matches.slice(0, 8), low = r.matches.slice(-3);
  const L: string[] = [`# Career self-report: ${a.name}`, `Email: ${a.email} | Age: ${a.age} | Date: ${new Date().toISOString().slice(0, 10)}`, '',
    '## Prompt for your AI', 'You are a careful career counsellor. Below is my self-report. (1) Challenge the results: where do my answers contradict each other? (2) Ask me up to 5 questions that would change your advice. (3) Then compare my top 3 careers for my country and budget using current job data you can cite. (4) Give me a 30-day plan of small, cheap tests. The scores are rough estimates, not a diagnosis. Do not just agree with them.', '',
    '## Strength stats (0–100, compared with the scale, not with other people)', ...axisData(r).map(([k, v]) => `- ${k}: ${v}`), '',
    `## Interests (code ${r.code})`, ...riaData(r).map(([k, v]) => `- ${k}: ${v}`), '', '## Personality (Mini-IPIP)', ...Object.entries(r.big).map(([k, v]) => `- ${BIG[k]}: ${v}`), '',
    '## What matters (times chosen out of 3)', ...valRank(r).map(([k, n]) => `- ${k}: ${n}`), '',
    '## Best-fit careers', ...top.map((m, i) => `${i + 1}. **${m.career.n}**, fit ${m.score}. Outlook: ${m.career.out} (${m.career.note}${m.career.src ? ` Source: ${SOURCES[m.career.src].u}` : ' Editorial judgment.'}) AI effect (editorial): ${m.career.ai}. Why: ${m.why.join('; ') || 'mixed'}. Watch: ${m.warn.join(' ') || 'nothing major'} First test: ${m.career.test}`), '',
    '## Weakest fit', ...low.map(m => `- ${m.career.n}, fit ${m.score}`), '', '## Reliability notes', ...(r.quality.length ? r.quality.map(x => `- ${x}`) : ['- No problems detected.']), '', '## My answers'];
  let s = ''; answerText(a).forEach(x => { if (x.section !== s) { s = x.section; L.push('', `### ${s}`); } L.push(`- ${x.q} → ${x.a}`); });
  return L.join('\n') + '\n';
}
