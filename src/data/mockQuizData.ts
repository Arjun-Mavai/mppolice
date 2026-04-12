export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed index
  explanation: string;
};

export const mockTopicQuestions: Question[] = [
  {
    id: 1,
    question: 'When was the Madhya Pradesh Public Service Commission (MP Police) constituted?',
    options: ['1st November 1956', '26th January 1950', '15th August 1947', '1st November 2000'],
    correctAnswer: 0,
    explanation:
      'MP Police was constituted on 1st November 1956 under Section 118(3) of the States Reorganization Act, 1956.',
  },
  {
    id: 2,
    question: 'Who was the first Chairman of MP Police?',
    options: ['D.B. Rege', 'H.C. Seth', 'S.P. Mushran', 'R.C.V.P. Noronha'],
    correctAnswer: 0,
    explanation:
      'D.B. Rege was the first Chairman of the Madhya Pradesh Public Service Commission.',
  },
  {
    id: 3,
    question: 'Where is the headquarters of MP Police located?',
    options: ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur'],
    correctAnswer: 2,
    explanation: 'The headquarters of MP Police is located in Indore, Madhya Pradesh.',
  },
  {
    id: 4,
    question: 'Which Article of the Constitution deals with the State Public Service Commission?',
    options: ['Article 312', 'Article 315', 'Article 324', 'Article 280'],
    correctAnswer: 1,
    explanation:
      'Article 315 of the Constitution of India provides for the establishment of Public Service Commissions for the Union and for the States.',
  },
  {
    id: 5,
    question: 'The members of MP Police are appointed by?',
    options: [
      'President of India',
      'Chief Minister of MP',
      'Governor of MP',
      'Chief Justice of High Court',
    ],
    correctAnswer: 2,
    explanation:
      'The Chairman and other members of a State Public Service Commission are appointed by the Governor of the State.',
  },
];

export const mockFLTQuestions: Question[] = [
  ...mockTopicQuestions, // Reuse for demo
  {
    id: 6,
    question: "Which of the following creates the 'Satpura Thermal Power Station'?",
    options: ['NTPC', 'MPPGCL', 'NHPC', 'BHEL'],
    correctAnswer: 1,
    explanation:
      'Satpura Thermal Power Station is located in Sarni, Betul district and is operated by MPPGCL (Madhya Pradesh Power Generating Company Limited).',
  },
  {
    id: 7,
    question: 'The Tropic of Cancer passes through how many districts of Madhya Pradesh?',
    options: ['12', '14', '10', '16'],
    correctAnswer: 1,
    explanation: 'The Tropic of Cancer passes through 14 districts of Madhya Pradesh.',
  },
  {
    id: 8,
    question: "Who is known as the 'Lata Mangeshkar of Madhya Pradesh'?",
    options: ['Mamta Sharma', 'Palak Muchhal', 'Sunidhi Chauhan', 'None of these'],
    correctAnswer: 3,
    explanation:
      "This is a trick question. While Lata Mangeshkar was born in Indore, the title 'Lata Mangeshkar of MP' is not typically attributed to a specific other singer in common GK context, but Lata ji herself is the pride of MP.",
  },
  {
    id: 9,
    question: 'Bhimbetka rock shelters were discovered by?',
    options: ['V.S. Wakankar', 'H.D. Sankalia', 'R.B. Daya Ram Sahni', 'R.D. Banerji'],
    correctAnswer: 0,
    explanation: 'Bhimbetka rock shelters were discovered by Dr. Vishnu Shridhar Wakankar in 1957.',
  },
  {
    id: 10,
    question: 'The river Narmada originates from?',
    options: ['Multai', 'Amarkantak', 'Jana-Paw', 'Kakri-Bardi'],
    correctAnswer: 1,
    explanation:
      'The Narmada River originates from the Amarkantak Plateau in Anuppur district of Madhya Pradesh.',
  },
];
