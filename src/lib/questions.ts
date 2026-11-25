// Question bank and the branching rules that decide what is asked next.
import { DOMAIN_EG, EVIDENCE_EG, INTEREST_EG, IPIP_EG, OPT_EG, QUESTION_EG, VALUE_EG } from './examples.ts';
export type Answers = Record<string, any>;
export type Opt = { v: string; t: string; d?: string };
export type Q = {
  id: string; section: string; eg?: string; kind: 'text' | 'email' | 'number' | 'single' | 'multi' | 'scale' | 'long';
  text: string; hint?: string; opts?: Opt[]; optional?: boolean; max?: number; scale?: 'like' | 'true'; min?: number; top?: number;
};
export const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type Ria = (typeof RIASEC)[number];
export const RIA_NAME: Record<Ria, string> = { R: 'Hands-on', I: 'Investigating', A: 'Creating', S: 'Helping', E: 'Leading', C: 'Organising' };

// Original items written to the RIASEC framework. First 3 = everyone; last 4 = only for your top three areas.
export const INTEREST: Record<Ria, string[]> = {
  R: ['Take apart a broken device and fix it', 'Work outdoors with tools or machines', 'Assemble something physical from parts',
    'Install solar panels or set up electrical wiring', 'Operate a drone, 3D printer or workshop machine', 'Grow plants or manage animals', 'Spend a full workday on your feet making something'],
  I: ['Find out why an experiment gave a strange result', 'Work on a hard puzzle with no obvious answer', 'Read about how something works at a deep level',
    'Analyse a large dataset to find a hidden pattern', 'Study how the human body or brain works', 'Spend weeks testing one idea that may fail', 'Find the flaw in a claim everyone believes'],
  A: ['Design a poster, page or product look', 'Write a story, script or song', 'Edit a video or create visual art',
    'Invent a world, character or brand from nothing', 'Perform or present your own work to strangers', 'Redo something many times until it feels right', 'Work with no fixed instructions'],
  S: ['Teach someone a thing they find difficult', 'Listen to a friend and help them through a problem', 'Care for people who are ill or need support',
    'Guide a group of younger students for months', 'Help two people resolve a conflict', 'Volunteer with a community', 'Coach someone to improve a skill'],
  E: ['Convince people to back your idea', 'Lead a team and own the result', 'Start something and sell it',
    'Negotiate a better deal', 'Take a risk with money for a bigger reward', 'Make a decision when others are unsure', 'Meet new people to build useful contacts'],
  C: ['Keep records or a budget accurate', 'Plan a schedule with every detail covered', 'Check work carefully to catch mistakes',
    'Build a spreadsheet that keeps things in order', 'Follow a proven process exactly', 'Make a messy system clear and tidy', 'Work with rules, contracts or standards'],
};
// Mini-IPIP (Donnellan et al., 2006). IPIP items are public domain. '-' = reverse scored.
export const IPIP: [string, 'O' | 'C' | 'E' | 'A' | 'N', 1 | -1][] = [
  ['I am the life of the party', 'E', 1], ["I sympathise with others' feelings", 'A', 1], ['I get chores done right away', 'C', 1], ['I have frequent mood swings', 'N', 1], ['I have a vivid imagination', 'O', 1],
  ["I don't talk a lot", 'E', -1], ["I am not interested in other people's problems", 'A', -1], ['I often forget to put things back in their proper place', 'C', -1], ['I am relaxed most of the time', 'N', -1], ['I am not interested in abstract ideas', 'O', -1],
  ['I talk to a lot of different people at parties', 'E', 1], ["I feel others' emotions", 'A', 1], ['I like order', 'C', 1], ['I get upset easily', 'N', 1], ['I have difficulty understanding abstract ideas', 'O', -1],
  ['I keep in the background', 'E', -1], ['I am not really interested in others', 'A', -1], ['I make a mess of things', 'C', -1], ['I seldom feel blue', 'N', -1], ['I do not have a good imagination', 'O', -1],
];
export const EVIDENCE: [string, string][] = [
  ['build', 'Building or fixing physical things'], ['code', 'Coding, automation or working with data'], ['write', 'Writing that others read'], ['design', 'Design, art, photo or video'],
  ['persuade', 'Public speaking or persuading people'], ['help', 'Teaching, coaching or caring for someone'], ['organise', 'Organising an event, team or budget'], ['sell', 'Selling something or finding customers'], ['ai', 'Using AI tools to finish real work'],
];
export const VALUES: [string, string][] = [['money', 'High income'], ['stable', 'Job security'], ['free', 'Freedom over how I work'], ['impact', 'Helping people or society'], ['create', 'Making original things'], ['status', 'Recognition and influence'], ['life', 'Time for life outside work'], ['learn', 'Always learning something hard']];
export const PAIRS = [[0, 1], [2, 3], [4, 5], [6, 7], [1, 2], [5, 6], [3, 4], [7, 0], [0, 4], [1, 5], [2, 6], [3, 7]];
export const DOMAINS: Opt[] = [['tech', 'Software & AI'], ['data', 'Data & maths'], ['security', 'Security & defence'], ['health', 'Medicine & health'], ['mind', 'Mind & behaviour'], ['science', 'Science & research'], ['eng', 'Engineering & machines'], ['energy', 'Energy & climate'], ['build', 'Buildings & trades'], ['design', 'Design'], ['media', 'Media & content'], ['biz', 'Business & startups'], ['money', 'Money & finance'], ['law', 'Law & policy'], ['edu', 'Education'], ['public', 'Government & community'], ['nature', 'Farming, food & nature'], ['body', 'Sport, travel & hospitality']].map(([v, t]) => ({ v, t, d: DOMAIN_EG[v] }));

export type Task = { q: string; o: string[]; a: number };
type Level = 'L1' | 'L2' | 'L3' | 'L3b' | 'L4' | 'L5';
export const ABILITY: Record<string, { name: string; items: Record<Level, Task> }> = {
  num: { name: 'Numbers', items: {
    L1: { q: 'A shirt costs ₹800. It is 25% off. What do you pay?', o: ['₹640', '₹600', '₹575', '₹700'], a: 1 },
    L2: { q: '3 pens cost ₹45. What do 7 pens cost?', o: ['₹90', '₹95', '₹105', '₹115'], a: 2 },
    L3: { q: 'A price rises 20%, then falls 20%. Compared with the start it is…', o: ['the same', '4% lower', '4% higher', '2% lower'], a: 1 },
    L3b: { q: 'Five numbers average 18. Remove one and the other four average 16. Which number was removed?', o: ['20', '22', '24', '26'], a: 3 },
    L4: { q: 'A alone takes 10 days for a job, B alone takes 15. They work together for 3 days, then A leaves. How many more days does B need?', o: ['7.5', '6', '9', '5'], a: 0 },
    L5: { q: '1% of people have a condition. A test catches 90% of them, but also wrongly flags 9% of healthy people. You test positive. Your chance of having it is closest to…', o: ['90%', '81%', '50%', '9%'], a: 3 } } },
  word: { name: 'Words', items: {
    L1: { q: 'Opposite of "scarce"?', o: ['rare', 'plentiful', 'hidden', 'costly'], a: 1 },
    L2: { q: 'Closest meaning to "pragmatic"?', o: ['practical', 'stubborn', 'dreamy', 'polite'], a: 0 },
    L3: { q: 'Book is to author as statue is to…', o: ['museum', 'stone', 'sculptor', 'painter'], a: 2 },
    L3b: { q: '"Although the plan was ____, the team ran out of time to carry it out."', o: ['doomed', 'vague', 'late', 'sound'], a: 3 },
    L4: { q: 'Every shop that raised prices lost customers. Some shops that kept prices steady also lost customers. What must be true?', o: ['Raising prices is the only cause', 'A shop that lost no customers did not raise prices', 'Steady shops kept everyone', 'Most shops lost customers'], a: 1 },
    L5: { q: '"Students with tutors score lower than students without, so tutoring lowers scores." The best objection is…', o: ['Tutors are expensive', 'Some tutors are poor', 'Struggling students are more likely to get tutors', 'Scores are not everything'], a: 2 } } },
  logic: { name: 'Logic', items: {
    L1: { q: '2, 4, 8, 16, ?', o: ['24', '30', '32', '20'], a: 2 },
    L2: { q: 'All roses are flowers. Some flowers fade quickly. So some roses fade quickly.', o: ['True', 'False', 'Cannot be determined'], a: 2 },
    L3: { q: '3, 4, 6, 9, 13, ?', o: ['17', '18', '19', '16'], a: 1 },
    L3b: { q: 'If it rains, the match is cancelled. The match was not cancelled. So…', o: ['It did not rain', 'It rained', 'It may have rained', 'Nothing follows'], a: 0 },
    L4: { q: 'Cards show E, K, 4, 7. Each has a letter on one side and a number on the other. Rule: "a vowel always has an even number behind it." Which cards must you turn over to test it?', o: ['E and 4', 'E only', 'All four', 'E and 7'], a: 3 },
    L5: { q: 'Three boxes: Apples, Oranges, Mixed. Every label is wrong. You may take one fruit from one box to work out all three. Which box?', o: ['Labelled Apples', 'Labelled Oranges', 'Labelled Mixed', 'Not possible'], a: 2 } } },
  space: { name: 'Spatial', items: {
    L1: { q: 'You face north and turn right twice. You now face…', o: ['East', 'South', 'West', 'North'], a: 1 },
    L2: { q: 'Fold a square sheet in half twice (into a smaller square), punch one hole in the middle, unfold. How many holes?', o: ['2', '1', '8', '4'], a: 3 },
    L3: { q: 'A die has opposite faces adding to 7. 1 is on top and 2 faces you. Tip it once directly away from you. What is on top?', o: ['2', '5', '6', '1'], a: 0 },
    L3b: { q: 'A cube is painted outside, then cut into 27 equal cubes. How many have exactly three painted faces?', o: ['6', '12', '8', '4'], a: 2 },
    L4: { q: 'Same kind of die: 1 on top, 2 facing you, 3 on the right. Tip it away from you once, then to the right once. What is on top?', o: ['3', '4', '5', '6'], a: 1 },
    L5: { q: 'A painted cube is cut into 64 equal cubes. How many have exactly two painted faces?', o: ['16', '24', '32', '12'], a: 1 } } },
};
export const ABILS = Object.keys(ABILITY);
/** Levels this person sees in one area: right moves up, wrong moves down. */
export function abilityPath(area: string, a: Answers): Level[] {
  const it = ABILITY[area].items, ok = (l: Level) => Number(a[`ab_${area}_${l}`]) === it[l].a, has = (l: Level) => a[`ab_${area}_${l}`] !== undefined;
  const p: Level[] = ['L3']; if (!has('L3')) return p;
  const s: Level = ok('L3') ? 'L4' : 'L2'; p.push(s); if (!has(s)) return p;
  p.push(s === 'L4' ? (ok('L4') ? 'L5' : 'L3b') : (ok('L2') ? 'L3b' : 'L1'));
  return p;
}
export function coreInterest(a: Answers): Record<Ria, number> {
  return Object.fromEntries(RIASEC.map(r => [r, [0, 1, 2].reduce((s, i) => s + (Number(a[`int_${r}${i}`]) || 0), 0)])) as Record<Ria, number>;
}
export function topThree(a: Answers): Ria[] {
  const c = coreInterest(a); return [...RIASEC].sort((x, y) => c[y] - c[x]).slice(0, 3);
}
const o = (...p: string[]): Opt[] => p.map(x => { const [v, t] = x.split('|'); return { v, t }; });

export const SECTIONS: { name: string; about: string; mins: string; total: number }[] = [
  { name: 'About you', about: 'Name, email and where you are now', mins: '1 min', total: 5 },
  { name: 'What you like', about: 'Activities you would enjoy or hate', mins: '4 min', total: 30 },
  { name: 'How you work', about: 'Your natural style', mins: '2 min', total: 20 },
  { name: 'What you can do', about: 'Short number, word, logic and spatial tasks', mins: '6 min', total: 12 },
  { name: 'What you have done', about: 'Real things you have tried or finished', mins: '2 min', total: 11 },
  { name: 'What matters', about: 'Choose between two good things', mins: '1 min', total: 12 },
  { name: 'Real life', about: 'Fields, limits and study time', mins: '2 min', total: 6 },
];
/** Rebuilt after every answer, so earlier choices change what comes next. */
export function buildFlow(a: Answers): Q[] {
  const q: Q[] = [], add = (x: Q) => q.push({ ...x, eg: x.eg ?? QUESTION_EG[x.id], opts: x.opts?.map(y => ({ ...y, d: y.d ?? OPT_EG[x.id]?.[y.v] })) });
  const [S1, S2, S3, S4, S5, S6, S7] = SECTIONS.map(s => s.name);
  add({ id: 'name', section: S1, kind: 'text', text: 'What is your name?' });
  add({ id: 'email', section: S1, kind: 'email', text: 'Your email?', hint: 'Only printed on your report. Nothing is sent anywhere.' });
  add({ id: 'age', section: S1, kind: 'number', text: 'How old are you?', min: 12, top: 80 });
  add({ id: 'stage', section: S1, kind: 'single', text: 'Where are you right now?', opts: o('s10|School, up to class 10', 's12|Class 11 or 12', 'college|In college', 'grad|Graduated, looking for work', 'work|Working', 'break|On a break / restarting') });
  if (a.stage === 's12') add({ id: 'stream', section: S1, kind: 'single', text: 'Which stream?', opts: o('pcm|Science with maths (PCM)', 'pcb|Science with biology (PCB)', 'pcmb|Both maths and biology (PCMB)', 'com|Commerce', 'arts|Arts / humanities', 'voc|Vocational') });
  if (['college', 'grad', 'work', 'break'].includes(a.stage)) add({ id: 'field', section: S1, kind: 'text', text: 'What did you study, or are studying?', hint: 'For example: B.Tech CSE, B.Com, not applicable' });
  if (a.stage === 'work' || a.stage === 'break') {
    add({ id: 'job', section: S1, kind: 'text', text: 'What is your current or last job?' });
    add({ id: 'jobfeel', section: S1, kind: 'single', text: 'How do you feel about that work?', opts: o('love|I enjoy it, I want to grow', 'ok|It is fine, not exciting', 'wrong|The work itself is wrong for me', 'place|The work is fine, the workplace is not') });
  }
  if (a.jobfeel === 'wrong') add({ id: 'jobwhy', section: S1, kind: 'multi', max: 2, text: 'What drains you most about it?', opts: o('people|Too much dealing with people', 'alone|Too much time alone', 'repeat|Repetitive', 'pressure|Pressure and targets', 'mean|Feels pointless', 'notmine|Not good at it') });
  RIASEC.flatMap(r => [0, 1, 2].map(i => [r, i] as const)).sort((x, y) => x[1] - y[1])
    .forEach(([r, i]) => add({ id: `int_${r}${i}`, section: S2, kind: 'scale', scale: 'like', text: INTEREST[r][i], eg: INTEREST_EG[r][i], hint: 'Would you enjoy this? Ignore pay and whether you are good at it.' }));
  if (RIASEC.every(r => [0, 1, 2].every(i => a[`int_${r}${i}`] !== undefined))) topThree(a).forEach(r => [3, 4, 5, 6].forEach(i => add({ id: `int_${r}${i}`, section: S2, kind: 'scale', scale: 'like', text: INTEREST[r][i], eg: INTEREST_EG[r][i], hint: `Going deeper: ${RIA_NAME[r].toLowerCase()} scored high for you.` })));
  IPIP.forEach((x, i) => add({ id: `ip${i}`, section: S3, kind: 'scale', scale: 'true', text: x[0], eg: IPIP_EG[i], hint: 'As you are now, not as you want to be.' }));
  ABILS.forEach(ar => abilityPath(ar, a).forEach(l => { const t = ABILITY[ar].items[l]; add({ id: `ab_${ar}_${l}`, section: S4, kind: 'single', text: t.q, hint: `${ABILITY[ar].name}. No calculator or AI. Difficulty follows your answers.`, opts: t.o.map((x, i) => ({ v: String(i), t: x })) }); }));
  EVIDENCE.forEach(([id, t]) => add({ id: `ev_${id}`, section: S5, kind: 'single', text: t, eg: EVIDENCE_EG[id], hint: 'In the last two years, what is the most you have actually done?', opts: o('0|Nothing yet', '1|Tried it or learned basics', '2|Finished something real', '3|Others used it or relied on it', '4|Got paid, selected or won for it') }));
  add({ id: 'asked', section: S5, kind: 'long', optional: true, text: 'What do people often ask you for help with?' });
  add({ id: 'flow', section: S5, kind: 'long', optional: true, text: 'When did you last lose track of time? What were you doing?' });
  PAIRS.forEach(([x, y], i) => add({ id: `vp${i}`, section: S6, kind: 'single', text: 'If you could only have one…', opts: [x, y].map(k => ({ v: VALUES[k][0], t: VALUES[k][1], d: VALUE_EG[VALUES[k][0]] })) }));
  add({ id: 'domains', section: S7, kind: 'multi', max: 3, text: 'Which worlds pull you? Pick up to 3.', opts: DOMAINS });
  if (a.domains?.includes('health')) add({ id: 'blood', section: S7, kind: 'single', text: 'Blood, hospitals and people in pain:', opts: o('ok|I can handle it', 'learn|I could get used to it', 'no|No, not for me') });
  if (a.domains?.some((d: string) => ['tech', 'data', 'security'].includes(d))) add({ id: 'screen', section: S7, kind: 'single', text: 'Eight hours at a screen fixing something that will not work:', opts: o('ok|I get absorbed', 'learn|Fine in small doses', 'no|I would hate it') });
  if (a.domains?.some((d: string) => ['biz', 'media'].includes(d))) add({ id: 'risk', section: S7, kind: 'single', text: 'Two years with low or unsteady income to build your own thing:', opts: o('ok|I would do it', 'learn|Only with savings', 'no|No, I need steady pay') });
  add({ id: 'deal', section: S7, kind: 'multi', max: 4, optional: true, text: 'Anything you refuse to do? Up to 4.', opts: o('sales|Selling', 'public|Speaking in public', 'desk|Sitting at a desk all day', 'field|Physical or outdoor work', 'blood|Blood and illness', 'shift|Night shifts', 'code|Coding', 'risk|Unsteady income') });
  add({ id: 'study', section: S7, kind: 'single', text: 'How much more study or training can you take on, time and money included?', opts: o('1|Up to 1 year', '3|2–3 years', '5|4–5 years', '9|6 years or more') });
  add({ id: 'where', section: S7, kind: 'single', text: 'Where could you work?', opts: o('home|My own city or town', 'country|Anywhere in my country', 'world|Anywhere in the world', 'remote|Mainly remote') });
  add({ id: 'pull', section: S7, kind: 'single', text: 'Who is pushing your career choice most?', opts: o('me|Mostly me', 'family|Family', 'friends|Friends or trends', 'need|Money pressure', 'none|Nobody, I am just lost') });
  if (a.pull === 'family') add({ id: 'famgap', section: S7, kind: 'long', optional: true, text: 'What does your family want, and what do you want?' });
  add({ id: 'dream', section: S7, kind: 'long', optional: true, text: 'A career you already have in mind?', hint: 'You can leave this blank.' });
  return q;
}
