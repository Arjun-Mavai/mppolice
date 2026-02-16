import { db } from '../src/db';
import { contentBlogs } from '../src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * SEED SCRIPT: Unit 1 - Ancient Indian Knowledge Tradition
 * Run with: npx tsx --env-file=.env scripts/seed-history-blog.ts
 */

async function seed() {
  const blog = {
    id: crypto.randomUUID(),
    metadata: {
      title:
        'Ancient Indian Knowledge Tradition & Bharatvarsha | प्राचीन भारतीय ज्ञान परंपरा और भारतवर्ष',
      slug: 'ancient-indian-knowledge-tradition-bharatvarsha-unit-1',
      description:
        'Comprehensive guide to MPPSC Unit 1: History of India. Covers Ancient Knowledge traditions, the concept of Bharatvarsha, and key concepts like Rina, Rit, and Sanskar.',
      category: 'history',
      unit: 'unit_1',
      topic: 'Concepts and Ideas: Ancient Indian Knowledge Tradition, Bharatvarsha',
      readingTime: 12,
      isPremium: true,
      isFreeAccess: false,
      isLiteAccess: false,
      isProAccess: true,
    },
    content: {
      hi: {
        introduction:
          "MPPSC 2026 के नए सिलेबस के अनुसार Unit 1 में प्राचीन भारतीय ज्ञान परंपरा को विशेष महत्व दिया गया है। यह लेख 'भारतवर्ष' की संकल्पना और प्राचीन दार्शनिक विचारों को सरल भाषा में समझाता है।",
        blocks: [
          {
            type: 'highlight',
            level: 'critical',
            text: "'विष्णु पुराण' के अनुसार: उत्तरं यत्समुद्रस्य हिमाद्रेश्चैव दक्षिणम्। वर्षं तद् भारतं नाम भारती यत्र सन्ततिः॥",
            icon: '📜',
          },
          {
            type: 'h2',
            text: 'भारतवर्ष की संकल्पना (Concept of Bharatvarsha)',
          },
          {
            type: 'p',
            text: "प्राचीन काल में हिमालय से समुद्र तक फैले भू-भाग को 'भारतवर्ष' कहा गया। यह केवल एक भौगोलिक शब्द नहीं, बल्कि एक सांस्कृतिक इकाई थी।",
          },
          {
            type: 'mnemonic',
            topic: 'पंच महायज्ञ (Five Great Sacrifices)',
            trick: 'B-P-M-N-A (Brahma, Pitru, Manushya, Nitya/Deva, Atithi)',
            visual: '🔥',
            explanation: 'ब्रह्मयज्ञ, पितृयज्ञ, देवयज्ञ, भूतयज्ञ और नृयज्ञ (अतिथि यज्ञ)',
          },
          {
            type: 'pyq',
            exam: 'MPPSC Prelims 2024 (Syllabus Based)',
            year: 2024,
            question: 'ऋत (Rit) की संकल्पना का संबंध किससे है?',
            options: ['नैतिक व्यवस्था', 'सैन्य व्यवस्था', 'कर प्रणाली', 'कृषि व्यवस्था'],
            correct: 'नैतिक व्यवस्था',
            strategy:
              "याद रखें: ऋत = 'Cosmic Order' या ब्रह्मांडीय नैतिक नियम। इसे वरुण देवता नियंत्रित करते हैं।",
          },
          {
            type: 'fact_card',
            title: 'महत्वपूर्ण अवधारणाओं की सूची',
            facts: [
              'ऋण (Rina): देव ऋण, ऋषि ऋण, पितृ ऋण।',
              'संस्कार (Sanskar): मनुष्य के परिष्कार हेतु 16 प्रमुख संस्कार।',
              'पुरुषार्थ (Purushartha): धर्म, अर्थ, काम, मोक्ष।',
            ],
            icon: '📊',
          },
        ],
        conclusion:
          'प्राचीन भारतीय ज्ञान न केवल इतिहास है बल्कि यह एक जीवन दर्शन है जो आज भी प्रासंगिक है।',
      },
      en: {
        introduction:
          "As per the new MPPSC 2026 syllabus, high importance is given to the Ancient Indian Knowledge Tradition in Unit 1. This article explains the concept of 'Bharatvarsha' and ancient philosophical ideas simplified.",
        blocks: [
          {
            type: 'highlight',
            level: 'critical',
            text: 'According to Vishnu Purana: The land north of the ocean and south of the Himalayas is named Bharat, and its people are called Bharati.',
            icon: '📜',
          },
          {
            type: 'h2',
            text: 'Concept of Bharatvarsha',
          },
          {
            type: 'p',
            text: "In ancient times, the land territory stretching from the Himalayas to the ocean was called 'Bharatvarsha'. It was not just a geographical term but a cultural unit.",
          },
          {
            type: 'mnemonic',
            topic: 'Pancha Mahayajnas',
            trick: 'B-P-D-B-N (Brahma, Pitru, Deva, Bhuta, Nr-yajna)',
            visual: '🔥',
            explanation:
              'Five daily sacrifices intended to pay off debts to Sages, Ancestors, Gods, Living beings, and Guests.',
          },
          {
            type: 'pyq',
            exam: 'UPSC CSE Prelims / MPPSC Relevance',
            year: 2020,
            question: "What does the term 'Rit' (ऋत) represent in the context of Indian culture?",
            options: ['Moral Law', 'State Law', 'Universal Chaos', 'None of these'],
            correct: 'Moral Law',
            strategy:
              'Key Hint: Ritu/Rit is the cosmic order that regulates the functioning of the universe and its inhabitants.',
          },
          {
            type: 'exam_pattern',
            topic: 'Ancient Knowledge Tradition',
            analysis: 'New Syllabus Focus:',
            stats: [
              "Direct questions on 'Terminologies' (Rit, Rina, Sanskar)",
              'Questions on Puranic geography (Bharatvarsha)',
              'Concepts of Vedas and Upanishads',
            ],
            trend: 'Shift towards deep conceptual understanding of indigenous Indian history.',
          },
        ],
        conclusion:
          'Ancient Indian knowledge is not just history but a philosophy of life that remains relevant today.',
      },
    },
  };

  try {
    const existing = await db
      .select()
      .from(contentBlogs)
      .where(eq(contentBlogs.slug, blog.metadata.slug))
      .get();
    if (existing) {
      console.log(`Blog ${blog.metadata.slug} already exists, skipping...`);
      return;
    }

    // Mapping new JSON structure to DB schema
    await db.insert(contentBlogs).values({
      id: blog.id,
      title: blog.metadata.title,
      slug: blog.metadata.slug,
      description: blog.metadata.description,
      category: blog.metadata.category,
      readingTime: blog.metadata.readingTime,
      unitId: blog.metadata.unit,
      topicId: blog.metadata.topic,
      isPremium: blog.metadata.isPremium,
      isFreeAccess: blog.metadata.isFreeAccess,
      isLiteAccess: blog.metadata.isLiteAccess,
      isProAccess: blog.metadata.isProAccess,
      content: blog.content,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('History blog seeded successfully!');
  } catch (error) {
    console.error('Error seeding blog:', error);
  }
}

seed();
