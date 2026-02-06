import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export const alt = 'Mindful MPPSC Application Preview';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom right, #4f46e5, #7c3aed)',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            {/* Logo Icon Placeholder */}
            <div style={{
                width: 80,
                height: 80,
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 20,
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
            }}>
                <span style={{ fontSize: 40, color: '#4f46e5', fontWeight: 'bold' }}>M</span>
            </div>
            <h1 style={{ fontSize: 72, fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em' }}>Mindful MPPSC</h1>
        </div>
        
        <p style={{ fontSize: 32, maxWidth: 800, textAlign: 'center', margin: '0 0 40px 0', opacity: 0.9, lineHeight: 1.4 }}>
          Master the Syllabus with Mnemonics<br/>
          <span style={{ fontSize: 24, opacity: 0.8 }}>India's First Bilingual MPPSC App</span>
        </p>

        <div style={{
            display: 'flex', 
            gap: 20,
            marginTop: 20
        }}>
            <div style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 20 }}>
                🇮🇳 Hindi & English
            </div>
             <div style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 20 }}>
                🧠 Smart Mnemonics
            </div>
             <div style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 20 }}>
                ⚡ Daily Quizzes
            </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
