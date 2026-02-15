'use client';

import React, { useState } from 'react';
import FlipCard from '@/components/FlipCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Provided Data
const historyData = {
  exam_name: 'राज्य सेवा (प्रारंभिक) परीक्षा',
  subject: 'सामान्य अध्ययन - प्रथम प्रश्न पत्र',
  unit_1: {
    title: 'भारत का इतिहास',
    topics: [
      {
        id: 1,
        front: 'प्राचीन भारतीय ज्ञान परंपरा',
        back: 'यह हमारे पूर्वजों की सोचने की शक्ति और विज्ञान है, जहाँ शिक्षा सिर्फ किताबी नहीं बल्कि जीवन जीने का तरीका थी।',
      },
      {
        id: 2,
        front: 'भारतवर्ष',
        back: 'सिर्फ एक ज़मीन का टुकड़ा नहीं, बल्कि हिमालय से समुद्र तक फैली हमारी सांस्कृतिक और भौगोलिक पहचान।',
      },
      {
        id: 3,
        front: 'वेद',
        back: 'दुनिया का सबसे पुराना ज्ञान का भंडार (ऋग्वेद, सामवेद, यजुर्वेद, अथर्ववेद) जिसमें ब्रह्मांड के रहस्य छुपे हैं।',
      },
      {
        id: 4,
        front: 'उपनिषद',
        back: 'गुरु के समीप बैठकर सीखा गया वो दार्शनिक ज्ञान जो आत्मा और परमात्मा की गहराई समझाता है।',
      },
      {
        id: 5,
        front: 'आरण्यक',
        back: 'वो ग्रंथ जो जंगलों (अरण्य) के एकांत में ऋषियों द्वारा लिखे गए, जिनमें ध्यान और दर्शन की बातें हैं।',
      },
      {
        id: 6,
        front: 'ब्राह्मण ग्रंथ',
        back: 'वेदों के कठिन मंत्रों को सरल भाषा में समझाने और यज्ञों की विधि बताने वाले ग्रंथ।',
      },
      {
        id: 7,
        front: 'षड्दर्शन',
        back: 'भारतीय दर्शन के 6 स्कूल (सांख्य, योग, न्याय, वैशेषिक, मीमांसा, वेदांत) जो सत्य को खोजने के अलग रास्ते बताते हैं।',
      },
      {
        id: 8,
        front: 'स्मृतियाँ',
        back: 'प्राचीन समाज के नियम और कानून की पुस्तकें, जैसे मनुस्मृति और याज्ञवल्क्य स्मृति।',
      },
      {
        id: 9,
        front: 'ऋत',
        back: 'ब्रह्मांड का वो अटूट प्राकृतिक नियम जिससे पूरी सृष्टि (सूरज, चाँद, मौसम) अनुशासन में चलती है।',
      },
      {
        id: 10,
        front: 'सभा एवं समिति',
        back: 'वैदिक काल की लोकतांत्रिक संस्थाएं; सभा में अनुभवी लोग और समिति में आम जनता शामिल होती थी।',
      },
      {
        id: 11,
        front: 'गणतंत्र',
        back: 'भारत की वो पुरानी व्यवस्था जहाँ शासन किसी राजा के वंश से नहीं बल्कि लोगों या संघ द्वारा चुना जाता था।',
      },
      {
        id: 12,
        front: 'वर्णाश्रम',
        back: 'समाज और जीवन को व्यवस्थित करने का तरीका (ब्राह्मण, क्षत्रिय, वैश्य, शूद्र) और जीवन के 4 चरण।',
      },
      {
        id: 13,
        front: 'पुरुषार्थ',
        back: 'जीवन के चार बड़े उद्देश्य: धर्म (कर्तव्य), अर्थ (धन), काम (इच्छा), और मोक्ष (मुक्ति)।',
      },
      {
        id: 14,
        front: 'ऋण',
        back: 'इंसान पर तीन मुख्य कर्ज: देव ऋण, ऋषि ऋण, और पितृ ऋण, जिन्हें चुकाना पुण्य माना जाता है।',
      },
      {
        id: 15,
        front: 'संस्कार',
        back: 'इंसान को बेहतर बनाने की प्रक्रिया, जिसमें जन्म से मृत्यु तक 16 मुख्य रीति-रिवाजों का पालन होता है।',
      },
      {
        id: 16,
        front: 'पंचमहायज्ञ / यज्ञ',
        back: 'प्रकृति और ईश्वर के प्रति कृतज्ञता जताने के लिए किए जाने वाले 5 मुख्य दैनिक कर्तव्य।',
      },
      {
        id: 17,
        front: 'कर्म का सिद्धांत',
        back: 'जैसा बीज बोओगे वैसी फसल काटोगे; हमारे अच्छे या बुरे काम ही हमारा भविष्य तय करते हैं।',
      },
      {
        id: 18,
        front: 'बोधिसत्व',
        back: 'बौद्ध धर्म की वो महान आत्मा जो खुद निर्वाण पा सकती है पर दूसरों के दुःख दूर करने के लिए रुक जाती है।',
      },
      {
        id: 19,
        front: 'तीर्थंकर',
        back: 'जैन धर्म के वो 24 महापुरुष जिन्होंने संसार रूपी सागर को पार करने का रास्ता दिखाया।',
      },
      {
        id: 20,
        front: 'प्राचीन एवं मध्यकालीन भारत की विशेषताएं',
        back: "भारत की वो खूबियाँ जिन्होंने हमें 'सोने की चिड़िया' बनाया, जैसे हमारी वास्तुकला और व्यापार।",
      },
      {
        id: 21,
        front: 'प्रशासनिक, सामाजिक तथा आर्थिक व्यवस्थाएं',
        back: 'पुराने समय में टैक्स कैसे वसूला जाता था, समाज कैसा था और राजा कैसे राज करते थे।',
      },
      {
        id: 22,
        front: 'सांस्कृतिक विरासत: कला प्रारूप, साहित्य, पर्व एवं उत्सव',
        back: 'हमारी मूर्तियाँ, चित्रकारी, महान लेखकों की किताबें और वो त्यौहार जो आज भी हमें जोड़कर रखते हैं।',
      },
      {
        id: 23,
        front: '19वीं एवं 20वीं शताब्दी के सामाजिक-धार्मिक सुधार',
        back: 'सती प्रथा और छुआछूत जैसी बुराइयों को खत्म करने के लिए राजा राममोहन राय और विवेकानंद जैसे महापुरुषों की जंग।',
      },
      {
        id: 24,
        front: 'स्वतंत्रता संघर्ष एवं भारतीय राष्ट्रीय आंदोलन',
        back: '1857 की क्रांति से लेकर 1947 तक आज़ादी के दीवानों के बलिदान और संघर्ष की पूरी कहानी।',
      },
      {
        id: 25,
        front: 'स्वतंत्रता के पश्चात् भारत का एकीकरण एवं पुनर्गठन',
        back: 'आज़ादी के बाद टुकड़ों में बँटी रियासतों को जोड़कर एक मज़बूत भारत बनाने का सरदार पटेल का करिश्मा।',
      },
    ],
  },
};

export default function HistoryUnitPage() {
  const [activeTab, setActiveTab] = useState('hindi');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-12 shadow-xl dark:from-violet-900 dark:to-indigo-950">
        <div className="mx-auto max-w-7xl text-center text-white">
          <h2 className="mb-2 text-xl font-medium opacity-90">{historyData.exam_name}</h2>
          <h1 className="font-display mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            {historyData.unit_1.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg opacity-80">{historyData.subject}</p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <Tabs
          defaultValue="hindi"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="mb-10 flex justify-center">
            <TabsList className="grid h-12 w-full max-w-[400px] grid-cols-2 rounded-full border bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-800">
              <TabsTrigger
                value="hindi"
                className="text-md rounded-full transition-all duration-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Hindi Medium
              </TabsTrigger>
              <TabsTrigger
                value="english"
                className="text-md rounded-full transition-all duration-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                English Medium
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hindi" className="mt-0">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {historyData.unit_1.topics.map((topic) => (
                <motion.div key={topic.id} variants={item}>
                  <FlipCard
                    id={topic.id}
                    title={topic.front}
                    subtitle={`Topic ${topic.id}`}
                    backTitle={topic.front}
                    backMainContent={topic.back}
                    className="h-[400px] w-full"
                    labels={{
                      tapToFlip: activeTab === 'hindi' ? 'पलटें' : 'Tap to Flip',
                      topicAnalysis: activeTab === 'hindi' ? 'विषय विश्लेषण' : 'Analysis',
                      mnemonicLabel: activeTab === 'hindi' ? 'स्मृति सूत्र' : 'Mnemonic',
                      practiceTest: activeTab === 'hindi' ? 'अभ्यास करें' : 'Practice',
                      closeAnalysis: activeTab === 'hindi' ? 'बंद करें' : 'Close',
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="english">
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
              <div className="max-w-md rounded-2xl border border-dashed border-gray-300 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-slate-800">
                <h3 className="mb-2 text-xl font-semibold">Content Coming Soon</h3>
                <p>
                  The English medium content for this unit is currently being curated. Please check
                  back later.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
