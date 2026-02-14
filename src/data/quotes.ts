export type Category =
  | 'Spirituality'
  | 'Health'
  | 'Life'
  | 'Business'
  | 'Love'
  | 'Fitness'
  | 'Wisdom'
  | 'Motivation'
  | 'Philosophy'
  | 'Science'
  | 'Ted Wisdom'
  | 'Scientific Proven';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: Category;
}

export const CATEGORIES: Category[] = [
  'Spirituality',
  'Health',
  'Life',
  'Business',
  'Love',
  'Fitness',
  'Wisdom',
  'Motivation',
  'Philosophy',
  'Science',
  'Ted Wisdom',
  'Scientific Proven',
];

export const QUOTES: Quote[] = [
  // Spirituality
  {
    id: '1',
    text: 'You are not a drop in the ocean. You are the entire ocean in a drop.',
    author: 'Rumi',
    category: 'Spirituality',
  },
  {
    id: '2',
    text: 'The wound is the place where the Light enters you.',
    author: 'Rumi',
    category: 'Spirituality',
  },
  { id: '3', text: 'Be here now.', author: 'Ram Dass', category: 'Spirituality' },

  // Health
  {
    id: '4',
    text: 'To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.',
    author: 'Buddha',
    category: 'Health',
  },
  {
    id: '5',
    text: 'Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.',
    author: 'Buddha',
    category: 'Health',
  },
  {
    id: '6',
    text: 'Let food be thy medicine and medicine be thy food.',
    author: 'Hippocrates',
    category: 'Health',
  },

  // Life
  {
    id: '7',
    text: "Life is what happens when you're busy making other plans.",
    author: 'John Lennon',
    category: 'Life',
  },
  {
    id: '8',
    text: "In three words I can sum up everything I've learned about life: it goes on.",
    author: 'Robert Frost',
    category: 'Life',
  },
  {
    id: '9',
    text: 'The purpose of our lives is to be happy.',
    author: 'Dalai Lama',
    category: 'Life',
  },

  // Business
  {
    id: '10',
    text: "Opportunities don't happen. You create them.",
    author: 'Chris Grosser',
    category: 'Business',
  },
  {
    id: '11',
    text: 'Success is not final; failure is not fatal: It is the courage to continue that counts.',
    author: 'Winston S. Churchill',
    category: 'Business',
  },
  {
    id: '12',
    text: 'Do not be embarrassed by your failures, learn from them and start again.',
    author: 'Richard Branson',
    category: 'Business',
  },

  // Love
  {
    id: '13',
    text: 'Love all, trust a few, do wrong to none.',
    author: 'William Shakespeare',
    category: 'Love',
  },
  {
    id: '14',
    text: 'The best thing to hold onto in life is each other.',
    author: 'Audrey Hepburn',
    category: 'Love',
  },
  {
    id: '15',
    text: 'Where there is love there is life.',
    author: 'Mahatma Gandhi',
    category: 'Love',
  },

  // Fitness
  {
    id: '16',
    text: "The only bad workout is the one that didn't happen.",
    author: 'Unknown',
    category: 'Fitness',
  },
  {
    id: '17',
    text: 'Fitness is not about being better than someone else. It’s about being better than you were yesterday.',
    author: 'Khloe Kardashian',
    category: 'Fitness',
  },
  {
    id: '18',
    text: "Take care of your body. It's the only place you have to live.",
    author: 'Jim Rohn',
    category: 'Fitness',
  },

  // Wisdom
  {
    id: '19',
    text: 'The only true wisdom is in knowing you know nothing.',
    author: 'Socrates',
    category: 'Wisdom',
  },
  {
    id: '20',
    text: 'Knowing yourself is the beginning of all wisdom.',
    author: 'Aristotle',
    category: 'Wisdom',
  },
  {
    id: '21',
    text: 'It is not what happens to you, but how you react to it that matters.',
    author: 'Epictetus',
    category: 'Wisdom',
  },

  // Motivation
  {
    id: '22',
    text: "Believe you can and you're halfway there.",
    author: 'Theodore Roosevelt',
    category: 'Motivation',
  },
  {
    id: '23',
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    category: 'Motivation',
  },
  {
    id: '24',
    text: 'Everything you’ve ever wanted is on the other side of fear.',
    author: 'George Addair',
    category: 'Motivation',
  },

  // Philosophy
  {
    id: '25',
    text: 'He who has a why to live can bear almost any how.',
    author: 'Friedrich Nietzsche',
    category: 'Philosophy',
  },
  {
    id: '26',
    text: 'To live is to suffer, to survive is to find some meaning in the suffering.',
    author: 'Friedrich Nietzsche',
    category: 'Philosophy',
  },
  {
    id: '27',
    text: 'Happiness depends upon ourselves.',
    author: 'Aristotle',
    category: 'Philosophy',
  },

  // Science
  {
    id: '28',
    text: 'Equipped with his five senses, man explores the universe around him and calls the adventure Science.',
    author: 'Edwin Hubble',
    category: 'Science',
  },
  {
    id: '29',
    text: 'Somewhere, something incredible is waiting to be known.',
    author: 'Carl Sagan',
    category: 'Science',
  },
  {
    id: '30',
    text: 'Science is a way of thinking much more than it is a body of knowledge.',
    author: 'Carl Sagan',
    category: 'Science',
  },

  // Ted Wisdom
  {
    id: '31',
    text: 'Vulnerability is the birthplace of innovation, creativity and change.',
    author: 'Brené Brown',
    category: 'Ted Wisdom',
  },
  {
    id: '32',
    text: 'Do not fake it till you make it. Fake it till you become it.',
    author: 'Amy Cuddy',
    category: 'Ted Wisdom',
  },
  {
    id: '33',
    text: 'Grit is passion and perseverance for very long-term goals.',
    author: 'Angela Duckworth',
    category: 'Ted Wisdom',
  },
  {
    id: '34',
    text: "If you don't know what you want to achieve in your presentation your audience never will.",
    author: 'Harvey Diamond',
    category: 'Ted Wisdom',
  },
  {
    id: '35',
    text: 'The power of introverts is that they are more likely to listen to others.',
    author: 'Susan Cain',
    category: 'Ted Wisdom',
  },

  // Scientific Proven
  {
    id: '36',
    text: 'Regular meditation increases gray matter density in the hippocampus, known to be important for learning and memory.',
    author: 'Neuroscience Study',
    category: 'Scientific Proven',
  },
  {
    id: '37',
    text: 'Gratitude effectively increases happiness and reduces depression.',
    author: 'Positive Psychology',
    category: 'Scientific Proven',
  },
  {
    id: '38',
    text: 'Spending time in nature reduces stress hormone (cortisol) levels.',
    author: 'Environmental Science',
    category: 'Scientific Proven',
  },
  {
    id: '39',
    text: "Sleep deprivation creates a 'pre-diabetic' state in the body in just one week.",
    author: 'Sleep Science',
    category: 'Scientific Proven',
  },
  {
    id: '40',
    text: 'High-intensity interval training (HIIT) burns 25-30% more calories than other forms of exercise.',
    author: 'Sports Science',
    category: 'Scientific Proven',
  },
];

export const getQuotesByCategory = (category: Category) => {
  return QUOTES.filter((quote) => quote.category === category);
};
