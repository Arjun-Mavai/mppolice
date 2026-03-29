'use server';

import { db } from '@/db';
import { questions } from '@/db/schema';
import { sql, isNotNull, and, not, eq } from 'drizzle-orm';

export interface Fact {
  id: string;
  fact: string;
  fact_hi?: string;
  category?: string;
}

// 🎓 Hardcoded high-quality MPPSC / Current Affairs / Geography facts (fallback + supplement)
const CURATED_FACTS: Fact[] = [
  {
    id: 'cf-bafta-2026',
    fact: 'Manipuri film "Boong" won the BAFTA 2026 award for Best Children’s & Family Film, becoming the first Indian film to win in this category.',
    fact_hi:
      'मणिपुर की फिल्म "Boong" ने BAFTA 2026 में Best Children’s & Family Film Award जीता और यह इस श्रेणी में जीतने वाली पहली भारतीय फिल्म बनी।',
    category: 'Current Affairs 2026',
  },
  {
    id: 'cf-chandrayaan3',
    fact: "Chandrayaan-3 landed near the Moon's South Pole on 23 August 2023, making India the first country to achieve this; the date is observed as National Space Day.",
    fact_hi:
      'चंद्रयान-3 ने 23 अगस्त 2023 को चंद्रमा के दक्षिणी ध्रुव के पास सफल लैंडिंग की, जिससे भारत ऐसा करने वाला पहला देश बना; इस दिन को राष्ट्रीय अंतरिक्ष दिवस के रूप में मनाया जाता है।',
    category: 'Science & Technology',
  },
  {
    id: 'cf-narmada',
    fact: 'The Narmada River is the longest west-flowing river of peninsular India, originating from Amarkantak and flowing through Madhya Pradesh, Maharashtra and Gujarat into the Arabian Sea.',
    fact_hi:
      'नर्मदा नदी प्रायद्वीपीय भारत की सबसे लंबी पश्चिम की ओर बहने वाली नदी है, जो अमरकंटक से निकलकर मध्यप्रदेश, महाराष्ट्र और गुजरात होते हुए अरब सागर में मिलती है।',
    category: 'MP Geography',
  },
  {
    id: 'cf-mp-tiger',
    fact: 'Madhya Pradesh is known as the "Tiger State of India" and had the highest number of tigers (785) as per the All India Tiger Estimation 2022.',
    fact_hi:
      'मध्यप्रदेश को "टाइगर स्टेट ऑफ इंडिया" कहा जाता है और 2022 की अखिल भारतीय बाघ गणना के अनुसार यहाँ 785 बाघ थे, जो देश में सबसे अधिक है।',
    category: 'Environment & MP GK',
  },
  {
    id: 'cf-tiger-india',
    fact: 'India had around 3,682 tigers as per the All India Tiger Estimation 2022, accounting for about 75% of the world’s wild tiger population.',
    fact_hi:
      'अखिल भारतीय बाघ गणना 2022 के अनुसार भारत में लगभग 3,682 बाघ हैं, जो विश्व के कुल जंगली बाघों का लगभग 75% है।',
    category: 'Environment',
  },
  {
    id: 'cf-g20-2023',
    fact: 'India held the G20 Presidency in 2023 with the theme "Vasudhaiva Kutumbakam" and the African Union was included as a permanent member.',
    fact_hi:
      'भारत ने 2023 में G20 की अध्यक्षता की, जिसका थीम "वसुधैव कुटुम्बकम" था और इसमें अफ्रीकी संघ को स्थायी सदस्य बनाया गया।',
    category: 'International Relations',
  },
  {
    id: 'cf-constitution',
    fact: 'The Constitution of India came into effect on 26 January 1950 and originally contained 395 Articles, 22 Parts and 8 Schedules.',
    fact_hi:
      'भारतीय संविधान 26 जनवरी 1950 को लागू हुआ और इसमें प्रारंभ में 395 अनुच्छेद, 22 भाग और 8 अनुसूचियाँ थीं।',
    category: 'Indian Polity',
  },
  {
    id: 'cf-khajuraho',
    fact: 'Khajuraho temples in Madhya Pradesh are UNESCO World Heritage Sites built by the Chandela dynasty between 950–1050 CE; originally 85 temples were built, of which about 25 remain.',
    fact_hi:
      'मध्यप्रदेश के खजुराहो मंदिर यूनेस्को विश्व धरोहर स्थल हैं, जिन्हें चंदेल वंश ने 950–1050 ई. के बीच बनवाया था; मूल रूप से 85 मंदिर थे, जिनमें से लगभग 25 शेष हैं।',
    category: 'History & MP',
  },
  {
    id: 'cf-sanchi-stupa',
    fact: 'Sanchi Stupa, built by Emperor Ashoka in the 3rd century BCE, is one of the oldest stone structures in India and a UNESCO World Heritage Site.',
    fact_hi:
      'सांची स्तूप, जिसे सम्राट अशोक ने तीसरी शताब्दी ईसा पूर्व में बनवाया, भारत की सबसे प्राचीन पत्थर संरचनाओं में से एक है और यूनेस्को विश्व धरोहर स्थल है।',
    category: 'History & MP',
  },
  {
    id: 'cf-biodiversity',
    fact: 'India is one of the 17 megadiverse countries and contains parts of four biodiversity hotspots: Himalaya, Western Ghats, Indo-Burma and Sundaland (Nicobar region).',
    fact_hi:
      'भारत 17 मेगाडायवर्स देशों में से एक है और इसमें चार जैव विविधता हॉटस्पॉट के भाग शामिल हैं: हिमालय, पश्चिमी घाट, इंडो-बर्मा और सुंडालैंड (निकोबार क्षेत्र)।',
    category: 'Environment',
  },
  {
    id: 'cf-panchayati-raj',
    fact: 'The 73rd Constitutional Amendment Act, 1992 gave constitutional status to Panchayati Raj Institutions and added the 11th Schedule with 29 subjects.',
    fact_hi:
      '73वां संविधान संशोधन अधिनियम, 1992 ने पंचायती राज संस्थाओं को संवैधानिक दर्जा दिया और 11वीं अनुसूची में 29 विषय जोड़े।',
    category: 'Indian Polity',
  },
  {
    id: 'cf-economy-gdp',
    fact: 'India is currently the world’s 5th largest economy by nominal GDP and aims to become a developed nation (Viksit Bharat) by 2047.',
    fact_hi:
      'भारत वर्तमान में नाममात्र GDP के आधार पर विश्व की 5वीं सबसे बड़ी अर्थव्यवस्था है और 2047 तक विकसित राष्ट्र बनने का लक्ष्य रखता है।',
    category: 'Economy',
  },
  {
    id: 'cf-amazon-nile',
    fact: "The Amazon River carries the most water of any river in the world (by discharge). The Nile River (6,650 km) is the world's longest river. The Caspian Sea is the world's largest lake.",
    fact_hi:
      'अमेज़न नदी जल प्रवाह की दृष्टि से विश्व की सबसे बड़ी नदी है। नील नदी (6,650 km) सबसे लंबी है। कैस्पियन सागर विश्व की सबसे बड़ी झील है।',
    category: 'World Geography',
  },
];

export async function getRandomFacts(limit: number = 5): Promise<Fact[]> {
  try {
    // We want short, useful explanations from the DB
    const results = await db
      .select({
        id: questions.id,
        explanation: questions.explanation,
        explanationEn: questions.explanationEn,
        subject: questions.subject,
      })
      .from(questions)
      .where(
        and(
          isNotNull(questions.explanation),
          not(eq(questions.explanation, '')),
          sql`LENGTH(${questions.explanation}) BETWEEN 50 AND 300`
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    const dbFacts = results.map((r) => ({
      id: r.id,
      fact: r.explanationEn || r.explanation || '',
      fact_hi: r.explanation || '',
      category: r.subject || 'General',
    }));

    // 🎯 Mix curated facts with DB facts for best variety
    const shuffledCurated = [...CURATED_FACTS].sort(() => Math.random() - 0.5).slice(0, 3);
    const combined = [...shuffledCurated, ...dbFacts];

    // Shuffle combined list
    return combined.sort(() => Math.random() - 0.5).slice(0, Math.max(limit, 5));
  } catch (error) {
    console.error('Error fetching random facts:', error);
    // Return curated facts as fallback if DB fails
    return [...CURATED_FACTS].sort(() => Math.random() - 0.5).slice(0, limit);
  }
}
