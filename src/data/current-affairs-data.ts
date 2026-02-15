/**
 * Current Affairs Data for Global Loader
 *
 * This data is displayed in the global loader to keep users engaged
 * while content is loading. Facts rotate every few seconds.
 */

export interface CurrentAffairsFact {
  id: number;
  subject: string;
  tag: string;
  title: string;
  text: string;
  textEn: string;
}

export const CURRENT_AFFAIRS_FACTS: CurrentAffairsFact[] = [
  {
    id: 1,
    subject: 'History',
    tag: 'Ancient India',
    title: 'Mauryan Empire',
    text: 'मौर्य साम्राज्य भारत का पहला बड़ा साम्राज्य था जिसने लगभग पूरे भारतीय उपमहाद्वीप को एकीकृत किया।',
    textEn:
      'The Mauryan Empire was the first major empire to unify most of the Indian subcontinent.',
  },
  {
    id: 2,
    subject: 'Geography',
    tag: 'Indian Rivers',
    title: 'Narmada River',
    text: 'नर्मदा नदी भारत की सबसे लंबी पश्चिम की ओर बहने वाली नदी है।',
    textEn: 'The Narmada is the longest west-flowing river in India.',
  },
  {
    id: 3,
    subject: 'Polity',
    tag: 'Constitution',
    title: 'Fundamental Rights',
    text: 'भारतीय संविधान में 6 मौलिक अधिकार हैं जो नागरिकों को प्रदान किए गए हैं।',
    textEn: 'The Indian Constitution provides 6 Fundamental Rights to its citizens.',
  },
  {
    id: 4,
    subject: 'Economy',
    tag: 'GDP',
    title: 'Economic Growth',
    text: 'भारत दुनिया की पांचवीं सबसे बड़ी अर्थव्यवस्था है।',
    textEn: "India is the world's fifth-largest economy by nominal GDP.",
  },
  {
    id: 5,
    subject: 'Science',
    tag: 'Space',
    title: 'Chandrayaan-3',
    text: 'चंद्रयान-3 ने भारत को चंद्रमा के दक्षिणी ध्रुव पर सफलतापूर्वक उतरने वाला पहला देश बनाया।',
    textEn:
      "Chandrayaan-3 made India the first country to successfully land on the Moon's south pole.",
  },
  {
    id: 6,
    subject: 'Environment',
    tag: 'Climate',
    title: 'Western Ghats',
    text: 'पश्चिमी घाट यूनेस्को विश्व धरोहर स्थल है और जैव विविधता का हॉटस्पॉट है।',
    textEn: 'The Western Ghats are a UNESCO World Heritage Site and biodiversity hotspot.',
  },
  {
    id: 7,
    subject: 'History',
    tag: 'Medieval India',
    title: 'Mughal Architecture',
    text: 'ताजमहल मुगल वास्तुकला का सबसे प्रसिद्ध उदाहरण है।',
    textEn: 'The Taj Mahal is the most famous example of Mughal architecture.',
  },
  {
    id: 8,
    subject: 'Geography',
    tag: 'Mountains',
    title: 'Himalayas',
    text: 'हिमालय दुनिया की सबसे ऊंची पर्वत श्रृंखला है।',
    textEn: "The Himalayas are the world's highest mountain range.",
  },
  {
    id: 9,
    subject: 'Polity',
    tag: 'Parliament',
    title: 'Lok Sabha',
    text: 'लोकसभा में अधिकतम 552 सदस्य हो सकते हैं।',
    textEn: 'The Lok Sabha can have a maximum of 552 members.',
  },
  {
    id: 10,
    subject: 'Economy',
    tag: 'Budget',
    title: 'Union Budget',
    text: 'केंद्रीय बजट हर साल फरवरी के पहले दिन पेश किया जाता है।',
    textEn: 'The Union Budget is presented on the first day of February every year.',
  },
  {
    id: 11,
    subject: 'Science',
    tag: 'Technology',
    title: 'Digital India',
    text: 'डिजिटल इंडिया कार्यक्रम का उद्देश्य भारत को डिजिटल रूप से सशक्त समाज में बदलना है।',
    textEn: 'The Digital India program aims to transform India into a digitally empowered society.',
  },
  {
    id: 12,
    subject: 'Environment',
    tag: 'Wildlife',
    title: 'Project Tiger',
    text: 'प्रोजेक्ट टाइगर 1973 में बाघों के संरक्षण के लिए शुरू किया गया था।',
    textEn: 'Project Tiger was launched in 1973 for the conservation of tigers.',
  },
  {
    id: 13,
    subject: 'History',
    tag: 'Freedom Struggle',
    title: 'Independence Day',
    text: 'भारत ने 15 अगस्त 1947 को स्वतंत्रता प्राप्त की।',
    textEn: 'India gained independence on August 15, 1947.',
  },
  {
    id: 14,
    subject: 'Geography',
    tag: 'States',
    title: 'Madhya Pradesh',
    text: 'मध्य प्रदेश भारत का दूसरा सबसे बड़ा राज्य है।',
    textEn: 'Madhya Pradesh is the second-largest state in India by area.',
  },
  {
    id: 15,
    subject: 'Polity',
    tag: 'Judiciary',
    title: 'Supreme Court',
    text: 'भारत का सर्वोच्च न्यायालय देश का सर्वोच्च न्यायिक प्राधिकरण है।',
    textEn: 'The Supreme Court of India is the highest judicial authority in the country.',
  },
];

/**
 * Get a random current affairs fact
 */
export function getRandomFact(): CurrentAffairsFact {
  const randomIndex = Math.floor(Math.random() * CURRENT_AFFAIRS_FACTS.length);
  return CURRENT_AFFAIRS_FACTS[randomIndex];
}

/**
 * Get multiple random facts (non-repeating)
 */
export function getRandomFacts(count: number): CurrentAffairsFact[] {
  const shuffled = [...CURRENT_AFFAIRS_FACTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, CURRENT_AFFAIRS_FACTS.length));
}
