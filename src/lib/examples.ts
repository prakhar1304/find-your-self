import type { Ria } from './questions.ts';
// Plain-language examples shown under short questions. Same order as the items they explain.
export const INTEREST_EG: Record<Ria, string[]> = {
  R: ['opening a fan or phone that stopped working and getting it running', 'farm work, site work, or driving a machine', 'putting together furniture, a PC or a model kit', 'fixing a switchboard or fitting panels on a roof', 'flying a drone to film a field, or printing a part', 'a kitchen garden, a dairy, or looking after pets', 'carpentry, cooking or welding from morning to evening'],
  I: ['a plant died even though you watered it, and you work out why', 'a chess position, a riddle or a tough maths problem', 'how the internet, vaccines or black holes really work', 'checking 1,000 sales bills to see why Mondays are slow', 'why we forget things, or how the heart pumps', 'trying 30 versions of a recipe or code and noting each result', 'a viral message says a food cures a disease, and you check if it is true'],
  A: ['a festival poster, an Instagram page or a T-shirt print', 'a short story, a reel script or song lyrics', 'cutting a travel video, or drawing a character', 'a comic hero, a game world, or a new snack brand with its own name and logo', 'singing on stage, or showing your designs to people you do not know', 'changing a logo or a paragraph ten times', 'you are told "make something nice for the event" and nothing more'],
  S: ['explaining fractions to a cousin who is stuck', 'a friend is upset after a fight and you sit with them', 'looking after a grandparent, or working in a ward', 'mentoring juniors through a whole semester', 'two roommates are fighting and you help them talk', 'a blood donation camp or teaching at an NGO', 'helping a friend get better at cricket, English or interviews'],
  E: ['getting your class or boss to agree to your plan', 'being captain, and taking the blame if you lose', 'selling homemade food, clothes or a small app', 'getting a lower rent or a better price', 'putting ₹10,000 of savings into a small business that may fail', 'the group cannot choose, so you choose and move on', 'talking to strangers at an event because they may help you later'],
  C: ['writing down every rupee spent on a trip', 'planning a wedding or tour hour by hour', 'reading a form twice to find a wrong date or spelling', 'an Excel sheet for attendance, stock or marks', 'following a lab method or bank process step by step, no shortcuts', 'sorting a messy cupboard, or a folder of 500 files', 'reading a rent agreement or exam rulebook closely'],
};
export const IPIP_EG = [
  'at a get-together, you are the one making everyone laugh', 'a friend is sad and you start feeling sad too', 'you wash dishes or finish homework straight away', 'happy in the morning, low by evening, with no big reason', 'you picture scenes and stories easily in your head',
  'in a group of five, you are the quietest', 'when someone shares a problem, you get bored', 'keys, charger or books left anywhere', 'a delayed train or a small problem does not bother you', 'talk about ideas like "what is time?" feels pointless',
  'at a wedding, you chat with many people you did not know', 'you can tell someone is hurt even when they say "I am fine"', 'you like your desk, files or room arranged', 'one rude comment spoils your mood', 'you get lost when something has no real-life example, like pure theory',
  'you stand at the side and let others take attention', 'you rarely wonder how other people are doing', 'your room or notes get messy quickly', 'you are hardly ever sad or low', 'inventing a story or a new idea is hard for you',
];
export const EVIDENCE_EG: Record<string, string> = {
  build: 'repaired a bike, made furniture, built a school project that works', code: 'made a website, an Excel macro, a Python script or a data chart', write: 'blog, article, long posts, scripts, college magazine', design: 'posters, logos, edited reels, photography, paintings',
  persuade: 'debate, anchoring, a presentation, convincing people to join something', help: 'tuitions, training a junior, caring for someone ill', organise: 'ran a college fest, planned a trip, handled club money', sell: 'sold a product or service, got orders, found clients', ai: 'used ChatGPT or similar to finish a report, design or app, not just to chat',
};
export const VALUE_EG: Record<string, string> = {
  money: 'earning much more than most, even with harder work', stable: 'a job that is very unlikely to go away', free: 'choosing your own hours, place and method', impact: 'your work makes someone else’s life better', create: 'making things that did not exist before', status: 'people know your name and listen to you', life: 'evenings and weekends free for family and hobbies', learn: 'always working on something new and difficult',
};
export const DOMAIN_EG: Record<string, string> = {
  tech: 'apps, websites, AI', data: 'statistics, research, predictions', security: 'cyber, police, army', health: 'doctor, nurse, physio', mind: 'psychology, counselling', science: 'labs, biotech, physics', eng: 'robots, cars, chips', energy: 'solar, wind, environment', build: 'construction, electrical work', design: 'apps, logos, fashion, rooms', media: 'video, writing, music', biz: 'sales, marketing, own company', money: 'CA, banking, investing', law: 'lawyer, public policy', edu: 'teaching, training', public: 'UPSC, NGO, social work', nature: 'farms, food, animals', body: 'fitness, hotels, aviation',
};
export const OPT_EG: Record<string, Record<string, string>> = {
  jobfeel: { wrong: 'for example, you are in accounts but hate working with numbers', place: 'for example, you like teaching but not this school' },
  jobwhy: { people: 'calls, customers or meetings all day', alone: 'hours with nobody to talk to', repeat: 'the same steps every day', pressure: 'monthly targets, urgent deadlines', mean: 'you do not see who it helps', notmine: 'others find it easy and you struggle' },
  deal: { sales: 'convincing customers, sales targets', public: 'speaking to a hall or on camera', desk: 'eight hours in a chair', field: 'sites, farms, heat, lifting', blood: 'hospital work', shift: 'working 10 pm to 6 am', code: 'writing programs', risk: '₹50,000 one month, ₹5,000 the next' },
  study: { '1': 'a short course or certificate', '3': 'a diploma, or a master’s degree', '5': 'a B.Tech, or law', '9': 'medicine, or a PhD' },
  pull: { family: 'parents want a certain job', friends: 'everyone is doing coding, so you are too', need: 'you must start earning soon' },
  blood: { learn: 'nervous at first, but you would stay' }, screen: { ok: 'you forget to eat until it works', learn: 'an hour or two, then you need a break' }, risk: { learn: 'only with 6–12 months of expenses saved' },
};
export const QUESTION_EG: Record<string, string> = {
  asked: 'fixing phones, choosing clothes, solving maths, listening to problems', flow: 'editing a video until 2 am, playing with code, cooking for friends', famgap: 'they want a government job; I want to design', dream: 'game designer, or CA',
  screen: 'your code or Excel sheet shows an error and you must find why', risk: 'some months ₹0, some months ₹40,000, while friends get a fixed salary', blood: 'cleaning a wound, or telling a family bad news',
};
