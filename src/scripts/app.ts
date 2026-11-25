import { buildFlow, RIA_NAME, type Answers, type Opt, type Q, type Ria } from '../lib/questions.ts';
import { score } from '../lib/score.ts';
import { SOURCES } from '../lib/careers.ts';
import { answerText, axisData, BIG, markdown, radar, riaData, valRank } from '../lib/report.ts';

const app = document.getElementById('app')!, KEY = 'find-yourself-v1';
let a: Answers = {}, at = '';
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) { a = s.a; at = s.at; } } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ a, at })); } catch {} };
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const LIKE: Opt[] = ['Strongly dislike', 'Dislike', 'Not sure', 'Like', 'Strongly like'].map((t, i) => ({ v: String(i + 1), t }));
const TRUE: Opt[] = ['Not me at all', 'Mostly not me', 'In between', 'Mostly me', 'Exactly me'].map((t, i) => ({ v: String(i + 1), t }));

function start() {
  app.className = '';
  const resume = Object.keys(a).length > 0;
  app.innerHTML = `<h1>Find out what you are built to do</h1>
  <p class="soft">About 100 quick taps, 12–18 minutes. Your answers decide what is asked next. At the end you get your stats, your best and worst career fits, and a file you can give to your own AI.</p>
  <p class="soft">Answer as you are, not as you should be. There is no pass mark.</p>
  <p class="mute">Nothing is uploaded. Your name, email and answers stay in this browser.</p>
  <div class="row" style="margin-top:28px"><button class="btn" id="go">${resume ? 'Continue' : 'Start'}</button>${resume ? '<button class="btn ghost" id="new">Start over</button>' : ''}</div>`;
  app.querySelector<HTMLElement>('#go')!.onclick = () => at === 'report' ? report() : ask(at || 'name');
  const n = app.querySelector<HTMLElement>('#new'); if (n) n.onclick = reset;
}
function reset() { if (!confirm('Delete your answers and start over?')) return; a = {}; at = ''; try { localStorage.removeItem(KEY); } catch {} start(); }

function check(q: Q): string {
  const v = a[q.id], empty = v === undefined || v === '' || (Array.isArray(v) && !v.length);
  if (empty) return q.optional ? '' : 'Please answer this one.';
  if (q.kind === 'email' && !/^\S+@\S+\.\S+$/.test(v)) return 'That email does not look right.';
  if (q.kind === 'number' && !(Number(v) >= q.min! && Number(v) <= q.top!)) return `Enter a number from ${q.min} to ${q.top}.`;
  return '';
}
function next(q: Q) {
  const e = check(q); if (e) { app.querySelector('.err')!.textContent = e; return; }
  const f = buildFlow(a), i = f.findIndex(x => x.id === q.id);
  if (i + 1 < f.length) return ask(f[i + 1].id);
  const miss = f.find(check); if (miss) return ask(miss.id); // going back can open new questions
  report();
}
function ask(id: string) {
  const f = buildFlow(a); let i = f.findIndex(x => x.id === id); if (i < 0) i = Math.max(0, f.findIndex(x => !!check(x)));
  const q = f[i]; at = q.id; save(); app.className = '';
  const opts = q.kind === 'scale' ? (q.scale === 'like' ? LIKE : TRUE) : q.opts, multi = q.kind === 'multi';
  const on = (v: string) => multi ? (a[q.id] ?? []).includes(v) : String(a[q.id]) === v;
  const field = opts ? `<div class="opts ${multi && opts.length > 6 ? 'two' : ''}" role="${multi ? 'group' : 'radiogroup'}" aria-labelledby="q">${opts.map(o => `<button class="opt" role="${multi ? 'checkbox' : 'radio'}" data-v="${o.v}" aria-checked="${on(o.v)}">${esc(o.t)}</button>`).join('')}</div>`
    : q.kind === 'long' ? `<textarea id="in" aria-labelledby="q" maxlength="1000">${esc(a[q.id])}</textarea>`
    : `<input id="in" aria-labelledby="q" type="${q.kind}" ${q.kind === 'number' ? 'inputmode="numeric"' : ''} maxlength="120" autocomplete="${q.id === 'name' ? 'name' : q.id === 'email' ? 'email' : 'off'}" value="${esc(a[q.id])}">`;
  app.innerHTML = `<div class="top"><span>${q.section}</span><span>${i + 1} / ${f.length}</span></div><div class="bar"><i style="width:${(i / f.length) * 100}%"></i></div>
  <h2 class="q" id="q" tabindex="-1" style="margin-top:0">${esc(q.text)}</h2>${q.hint ? `<p class="mute">${esc(q.hint)}</p>` : ''}${field}<p class="err" role="alert"></p>
  <div class="row">${i ? '<button class="btn ghost" id="back">Back</button>' : ''}<button class="btn" id="next">${q.optional && !a[q.id]?.length ? 'Skip / next' : 'Next'}</button></div>`;
  const inp = app.querySelector<HTMLInputElement>('#in');
  if (inp) { inp.focus(); inp.oninput = () => { a[q.id] = inp.value.trim(); save(); }; inp.onkeydown = e => { if (e.key === 'Enter' && q.kind !== 'long') next(q); }; }
  else app.querySelector<HTMLElement>('#q')!.focus({ preventScroll: true });
  app.querySelectorAll<HTMLButtonElement>('.opt').forEach(b => b.onclick = () => {
    const v = b.dataset.v!;
    if (!multi) { a[q.id] = v; save(); return next(q); }
    const cur: string[] = a[q.id] ?? [];
    if (!cur.includes(v) && cur.length >= q.max!) { app.querySelector('.err')!.textContent = `Pick up to ${q.max}.`; return; }
    a[q.id] = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]; save();
    b.setAttribute('aria-checked', String(a[q.id].includes(v))); app.querySelector('.err')!.textContent = '';
  });
  app.querySelector<HTMLElement>('#next')!.onclick = () => next(q);
  const bk = app.querySelector<HTMLElement>('#back'); if (bk) bk.onclick = () => ask(f[i - 1].id);
  scrollTo(0, 0);
}
// Number keys pick an option.
addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName) || e.metaKey || e.ctrlKey || e.repeat) return;
  const b = app.querySelectorAll<HTMLButtonElement>('.opt'); if (b.length && +e.key >= 1 && +e.key <= b.length) b[+e.key - 1].click();
});

const OUT = { growing: '▲ Growing', steady: '● Steady', squeezed: '▼ Shrinking or squeezed' }, AI = { helps: 'AI mostly helps', mixed: 'AI changes the tasks', pressure: 'AI replaces routine parts' };
const tbl = (rows: (readonly [string, unknown])[]) => `<table><tbody>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`;
function report() {
  at = 'report'; save();
  const r = score(a), md = markdown(a, r), top = r.matches.slice(0, 6), low = r.matches.slice(-4).reverse();
  const li = (x: string[]) => x.length ? `<ul>${x.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
  app.className = 'wide';
  app.innerHTML = `<p class="mute">${esc(a.name)} · ${esc(a.email)} · ${new Date().toLocaleDateString()}</p>
  <h1>Best fit to explore first: ${esc(top[0].career.n)}</h1>
  <p class="soft">You lean ${r.likes.map(x => RIA_NAME[x[0] as Ria].toLowerCase()).join(' and ')}. Your strongest stats are ${r.strong.map(x => x[0]).join(', ')}.</p>
  <div class="row noprint"><button class="btn" id="copy">Copy for my AI</button><button class="btn ghost" id="md">Download .md</button><button class="btn ghost" id="json">Download .json</button><button class="btn ghost" id="pdf">Save as PDF</button></div><p class="mute noprint" id="msg" role="status" style="margin-top:8px"></p>
  ${r.quality.length ? `<div class="panel" style="margin-top:16px"><h3>Read this first</h3><ul style="margin:8px 0 0;padding-left:18px">${r.quality.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
  <h2>Your stats</h2>${radar(axisData(r), 'Strength stats out of 100')}
  <p class="mute">Numbers, Words, Logic and Spatial come from three short tasks each. The rest come from what you said you have done and how you described yourself. 100 is the top of the scale, not the top of the population.</p>
  <div class="grid"><div class="panel"><h3>Strongest</h3>${tbl(r.strong)}</div><div class="panel"><h3>Weakest right now</h3>${tbl(r.weak)}</div></div>
  <h2>What you like</h2>${radar(riaData(r), 'Interests out of 100')}
  <p class="soft">Most drawn to ${r.likes.map(x => RIA_NAME[x[0] as Ria].toLowerCase()).join(' and ')} work. Least drawn to ${r.dislikes.map(x => RIA_NAME[x[0] as Ria].toLowerCase()).join(' and ')} work, so jobs full of it will drain you.</p>
  <div class="grid"><div class="panel"><h3>Personality</h3>${tbl(Object.entries(r.big).map(([k, v]) => [BIG[k], v]))}</div><div class="panel"><h3>What matters to you</h3>${tbl(valRank(r).map(([k, n]) => [k, `${n} of 3`]))}</div></div>
  <h2>Careers to explore</h2><p class="mute">Fit does not include job outlook. Outlook is shown separately so you can weigh it yourself.</p>
  ${top.map(m => `<article class="career"><header><h3>${esc(m.career.n)}</h3><span class="s">fit ${m.score}</span></header>
  ${li(m.why)}<p class="soft">${OUT[m.career.out]}. ${esc(m.career.note)} ${m.career.src ? `<a href="${SOURCES[m.career.src].u}" target="_blank" rel="noopener">Source</a>` : '<span class="mute">(editorial judgment)</span>'} ${AI[m.career.ai]} <span class="mute">(editorial)</span>.</p>
  ${m.warn.length ? `<p class="soft">⚠ ${m.warn.map(esc).join(' ')}</p>` : ''}<p><strong>Test it cheaply:</strong> ${esc(m.career.test)}</p><p class="mute">Interest ${m.parts.interest} · Strength ${m.parts.strength} · Values ${m.parts.values} · World ${m.parts.domain}</p></article>`).join('')}
  <h2>Probably not for you</h2>${tbl(low.map(m => [m.career.n, `fit ${m.score}`]))}
  <h2>Next 30 days</h2><ol class="soft"><li>Week 1: ${esc(top[0].career.test)}</li><li>Week 2: ${esc(top[1].career.test)}</li><li>Week 3: ${esc(top[2].career.test)}</li><li>Week 4: talk to two people in whichever you would repeat for free. Ask about their worst week.</li></ol>
  <h2>How this works</h2><p class="soft">Fit = interests 40%, strengths 25%, worlds you picked 20%, values 15%. Things you ruled out, training time and entry subjects lower it. Interests follow the RIASEC model; personality uses the public-domain Mini-IPIP. The weights, career profiles and skill tasks are our own judgment and have not been validated. Treat this as a structured conversation starter, not a diagnosis.</p>
  <p class="mute">US figures do not transfer directly to India. ${Object.values(SOURCES).map(s => `<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a>`).join(' · ')}</p>
  <details class="noprint"><summary>All career scores</summary>${tbl(r.matches.map(m => [m.career.n, m.score]))}</details>
  <details class="noprint"><summary>All your answers</summary>${tbl(answerText(a).map(x => [x.q, x.a]))}</details>
  <div class="row noprint" style="margin-top:24px"><button class="btn ghost" id="edit">Change answers</button><button class="btn ghost" id="new">Start over</button></div>`;
  const on = (id: string, f: () => void) => app.querySelector<HTMLElement>('#' + id)!.onclick = f, msg = (t: string) => app.querySelector('#msg')!.textContent = t;
  const dl = (name: string, body: string, type: string) => { const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([body], { type })); l.download = name; l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 2000); };
  on('copy', async () => { try { await navigator.clipboard.writeText(md); msg('Copied. Paste it into ChatGPT, Claude or Gemini.'); } catch { msg('Copy was blocked. Use Download .md instead.'); } });
  on('md', () => dl('career-report.md', md, 'text/markdown'));
  on('json', () => dl('career-report.json', JSON.stringify({ date: new Date().toISOString(), answers: a, stats: r.axes, interests: r.interest, personality: r.big, values: r.val, reliability: r.quality, careers: r.matches.map(m => ({ name: m.career.n, fit: m.score, ...m.parts, outlook: m.career.out, why: m.why, warnings: m.warn })) }, null, 2), 'application/json'));
  on('pdf', () => print()); on('edit', () => ask('name')); on('new', reset);
  scrollTo(0, 0);
}
start();
