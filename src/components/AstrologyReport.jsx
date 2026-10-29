import React from 'react';
import KundaliChart from './KundaliChart';
import { toDevanagari } from '../data/vedicData';
import { 
  Sparkles, Lock, Unlock, Heart, DollarSign, Users, Award, 
  AlertTriangle, Compass, MessageCircle, Calendar, ShieldCheck 
} from 'lucide-react';

export default function AstrologyReport({ 
  chartData, 
  readingData, 
  isFullUnlocked, 
  onUnlockClick, 
  onOpenChat 
}) {
  if (!chartData) return null;

  const reading = readingData || {};

  return (
    <div className="report-container animate-fade-in">
      {/* 1. North Indian Kundali SVG Chart */}
      <KundaliChart chartData={chartData} />

      {/* 2. Navagraha Planetary Positions Summary */}
      <div className="planets-summary-card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
          नवग्रह स्थिति र भाव परिचय
        </h4>
        <div className="planets-summary-grid">
          {chartData.grahas?.map((g) => (
            <div key={g.id} className="planet-pill" style={{ borderLeft: `3px solid ${g.color}` }}>
              <div className="planet-pill-header">
                <span style={{ color: g.color }}>{g.nameNp}</span>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>{toDevanagari(g.bhavaNum)} भाव</span>
              </div>
              <div className="planet-pill-meta">
                <span>{g.rashiName} ({toDevanagari(g.degreeInRashi)}°)</span>
              </div>
              {g.isExalted && <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 'bold' }}>★ उच्च</span>}
              {g.isDebilitated && <span style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 'bold' }}>▼ नीच</span>}
              {g.isOwnHouse && <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 'bold' }}>● स्वगृह</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Free 25% Reading Section */}
      <div className="preview-card">
        <div className="preview-badge-row">
          <div className="preview-pill">
            <Sparkles size={14} />
            <span>२५% निःशुल्क कुण्डली विश्लेषण</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            लग्न: <strong style={{ color: 'var(--gold-light)' }}>{chartData.lagna?.rashiName}</strong> | चन्द्र राशि: <strong style={{ color: 'var(--gold-light)' }}>{chartData.moonSign?.rashiName}</strong>
          </span>
        </div>

        {/* Lagna Overview */}
        <h3 className="reading-section-title">
          <Compass size={20} />
          <span>लग्न फल तथा राशि परिचय</span>
        </h3>
        <p className="reading-paragraph">
          {reading.lagnaOverview || `${chartData.name}जी, तपाईंको जन्म लग्न ${chartData.lagna?.rashiName} राशिमा भएको छ। लग्नपतिको स्थितिले तपाईंमा आत्मसम्मान, दृढ संकल्प र विशेष आकर्षण प्रदान गरेको छ।`}
        </p>

        {/* Nature Teaser */}
        <h3 className="reading-section-title">
          <Award size={20} />
          <span>मूल स्वभाव र आन्तरिक प्रकृति (Personality)</span>
        </h3>
        <p className="reading-paragraph">
          {reading.nature?.detailed || reading.nature?.summary || "तपाईं दृढ निश्चयी, गम्भीर र आफ्नो वचनको पक्का व्यक्ति हुनुहुन्छ। निर्णय लिँदा मन र बुद्धिको सन्तुलन मिलाउने क्षमता तपाईंमा छ।"}
        </p>

        {/* Preview Yoga */}
        {chartData.yogas && chartData.yogas.length > 0 && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--border-gold-subtle)', borderRadius: '10px', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              शुभ योग झलक
            </span>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '1.05rem', margin: '0.2rem 0' }}>
              {chartData.yogas[0].name}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              {chartData.yogas[0].description}
            </p>
          </div>
        )}
      </div>

      {/* 4. Paywall Gate (75% Locked) vs 100% Unlocked Modules */}
      {!isFullUnlocked ? (
        <div className="paywall-wrapper">
          {/* Blurred Background Mockup */}
          <div className="paywall-blurred-content">
            <div className="reading-module-card">
              <h3>विगतका प्रमुख घटनाहरूको समयरेखा</h3>
              <p>उमेर १६, २१ र २५ वर्षमा घटेका मोडहरू...</p>
            </div>
            <div className="reading-module-card">
              <h3>सम्बन्ध र वैवाहिक जीवन</h3>
              <p>सप्तम भाव अनुसार तपाईंको जीवनसाथीको चरित्र र विवाहको शुभ समय...</p>
            </div>
            <div className="reading-module-card">
              <h3>धन, सम्पत्ति र करियर</h3>
              <p>व्यापार कि नोकरी, आर्थिक लाभका वर्षहरू र स्थायी सम्पत्ति योग...</p>
            </div>
          </div>

          {/* Golden Radiant Lock Overlay */}
          <div className="paywall-overlay">
            <div className="lock-gold-circle">
              <Lock size={32} />
            </div>
            <h3 className="paywall-title">
              बाँकी ७५% विस्तृत भविष्यवाणी अनलक गर्नुहोस्
            </h3>
            <p className="paywall-desc">
              एक अनुभवी राजज्योतिषीले जस्तै विगतका घटनाहरूको वर्ष र कारण, विवाह योग, धन-सम्पत्ति, मित्रता, सबल/दुर्बल पक्ष र वैदिक उपाय हेर्न निःशुल्क साइन अप गर्नुहोस्।
            </p>

            <div className="paywall-features-list">
              <span className="paywall-feature-tag"><Calendar size={13} /> विगतका घटनाहरूको समयरेखा</span>
              <span className="paywall-feature-tag"><Heart size={13} /> प्रेम र विवाहको विश्लेषण</span>
              <span className="paywall-feature-tag"><DollarSign size={13} /> धन, सम्पत्ति र करियर</span>
              <span className="paywall-feature-tag"><Users size={13} /> मित्रता र धोकाको संकेत</span>
              <span className="paywall-feature-tag"><Award size={13} /> सबल पक्ष र राजयोग</span>
              <span className="paywall-feature-tag"><AlertTriangle size={13} /> दोष शान्ति र वैदिक उपाय</span>
              <span className="paywall-feature-tag"><MessageCircle size={13} /> प्रत्यक्ष ज्योतिषीसँग च्याट</span>
            </div>

            <button onClick={onUnlockClick} className="btn-unlock-gold">
              <Unlock size={20} />
              <span>१००% पूर्ण कुण्डली निःशुल्क अनलक गर्नुहोस्</span>
            </button>
          </div>
        </div>
      ) : (
        /* 100% FULL UNLOCKED ASTROLOGY MODULES */
        <div className="unlocked-sections-wrapper animate-fade-in">
          {/* Unlocked Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={24} color="#34D399" />
              <div>
                <h4 style={{ color: '#34D399', fontSize: '1.05rem', margin: 0 }}>
                  सम्पूर्ण कुण्डली (१००%) अनलक गरिएको छ!
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  वैदिक ज्योतिष सिद्धान्त तथा उच्च-सटीक नक्षत्र गणनाद्वारा प्रमाणित फलादेश।
                </span>
              </div>
            </div>

            <button onClick={onOpenChat} className="btn-unlock-gold" style={{ padding: '0.5rem 1.1rem', fontSize: '0.9rem' }}>
              <MessageCircle size={16} />
              <span>ज्योतिषीसँग प्रश्न सोध्नुहोस्</span>
            </button>
          </div>

          {/* Module 1: Past Events Timeline (विगतका प्रमुख घटनाहरू) */}
          <div className="reading-module-card">
            <h3 className="reading-section-title">
              <Calendar size={20} color="var(--gold-primary)" />
              <span>१. अहिलेसम्म घटेका प्रमुख जीवन घटनाहरूको समयरेखा</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1rem' }}>
              विंशोत्तरी महादशा, अन्तरदशा र गोचरका आधारमा तपाईंको जीवनमा आएका महत्त्वपूर्ण मोडहरू:
            </p>

            <div className="events-timeline">
              {(reading.pastEvents || chartData.pastEvents)?.map((evt, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-meta">
                    <span>{evt.age}</span>
                    <span>• {evt.year} साल</span>
                  </div>
                  <h4 className="timeline-title">{evt.title}</h4>
                  <p className="timeline-desc">{evt.description}</p>
                  {evt.explanation && (
                    <div className="timeline-reason">
                      <strong>ज्योतिषीय आधार:</strong> {evt.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Module 2: Relationships & Marriage (सम्बन्ध र विवाह) */}
          <div className="reading-module-card">
            <h3 className="reading-section-title">
              <Heart size={20} color="#F472B6" />
              <span>२. सम्बन्ध, प्रेम र वैवाहिक जीवन (सप्तम भाव विवेचना)</span>
            </h3>
            <p className="reading-paragraph">
              {reading.relationship?.houseAnalysis || "सप्तम भाव जीवनसाथीको घर हो। यस भावको प्रभावले तपाईंको दाम्पत्य जीवन निष्ठावान् र गम्भीर हुनेछ।"}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold-light)', fontWeight: 'bold' }}>विवाहको समय र जीवनसाथी:</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {reading.relationship?.timing || "गोचरीय बृहस्पतिको शुभ दृष्टि रहने समयमा विवाहको प्रबल योग बन्छ।"}
                </p>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold-light)', fontWeight: 'bold' }}>दाम्पत्य सुखका लागि सुझाव:</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {reading.relationship?.advice || "एकअर्काको आत्मसम्मानको कदर गर्नुहोस् र स-साना कुरामा मनमुटाव नबढाउनुहोस्।"}
                </p>
              </div>
            </div>
          </div>

          {/* Module 3: Wealth & Career (धन, सम्पत्ति र करियर) */}
          <div className="reading-module-card">
            <h3 className="reading-section-title">
              <DollarSign size={20} color="#34D399" />
              <span>३. धन, सम्पत्ति, करियर र भाग्य (२, १० र ११ भाव)</span>
            </h3>
            <p className="reading-paragraph">
              {reading.wealthAndCareer?.wealthYogas || "तपाईंको कुण्डलीमा धन भाव र लाभ भावको सम्बन्ध बलियो छ, जसले आर्थिक स्थायित्व दिन्छ।"}
            </p>
            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-deep)', borderRadius: '8px', borderLeft: '3px solid #10B981', marginBottom: '0.75rem' }}>
              <strong style={{ color: '#34D399', fontSize: '0.88rem' }}>कार्यक्षेत्र सुझाव: </strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {reading.wealthAndCareer?.incomeType || "स्वतन्त्र उद्यम वा व्यवस्थापकीय क्षेत्र लाभदायी छ।"}
              </span>
            </div>
            {reading.wealthAndCareer?.caution && (
              <div style={{ padding: '0.65rem 1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.85rem' }}>
                ⚠️ <strong>सावधानी: </strong>{reading.wealthAndCareer.caution}
              </div>
            )}
          </div>

          {/* Module 4: Friendship & Social Circle (मित्रता) */}
          <div className="reading-module-card">
            <h3 className="reading-section-title">
              <Users size={20} color="#38BDF8" />
              <span>४. मित्रता र सामाजिक वृत्त (एकादश भाव)</span>
            </h3>
            <p className="reading-paragraph">
              {reading.friendship?.analysis || "तपाईं साथीभाइलाई निष्कपट सहयोग गर्नुहुन्छ तर अरूको स्वार्थी व्यवहारले गर्दा कहिलेकाहीँ मन खिन्न हुन सक्छ।"}
            </p>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              📌 <strong>मित्रताको नियम:</strong> {reading.friendship?.rule || "आफ्नो गोप्य आर्थिक र व्यक्तिगत योजनाहरू सबै साथीहरूमाझ नखोल्नुहोला।"}
            </div>
          </div>

          {/* Module 5: Best Things & Strengths (सबल पक्षहरू) */}
          <div className="reading-module-card">
            <h3 className="reading-section-title">
              <Award size={20} color="var(--gold-primary)" />
              <span>५. जीवनका सबल पक्षहरू तथा दैवी वरदान</span>
            </h3>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
              {(reading.bestThings?.points || [
                "कुनै पनि परिस्थितिमा अडिग रहने आत्मबल र साहस।",
                "तीव्र अन्तर्ज्ञान र मान्छे पहिचान गर्न सक्ने प्राकृतिक क्षमता।",
                "कर्मप्रति लगनशीलता र संकटमा पनि आशावादी दृष्टिकोण।"
              ]).map((pt, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>{pt}</li>
              ))}
            </ul>

            {/* Display All Detected Vedic Yogas */}
            {chartData.yogas && chartData.yogas.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h5 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  कुण्डलीमा विद्यमान शुभ महायोगहरू:
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {chartData.yogas.map((y, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg-deep)', border: '1px solid var(--border-gold-subtle)', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--gold-primary)', fontSize: '0.9rem' }}>✦ {y.name}</strong>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{y.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Module 6: Worst Things, Doshas & Remedies (दुर्बल पक्ष र उपाय) */}
          <div className="reading-module-card">
            <h3 className="reading-section-title">
              <AlertTriangle size={20} color="var(--sindur-red)" />
              <span>६. दुर्बल पक्ष, ग्रह दोषहरू र प्रामाणिक वैदिक उपाय</span>
            </h3>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.8', marginBottom: '1.25rem' }}>
              {(reading.worstThings?.points || [
                "सानो कुरामा चाँडै रिस उठ्नु र भावनात्मक निर्णय लिनु।",
                "अतीतका चोटहरू मनमा लामो समयसम्म पालेर राख्नु।",
                "अरूमाथि छिट्टै विश्वास गरेर धोका पाउनु।"
              ]).map((pt, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>{pt}</li>
              ))}
            </ul>

            {/* Dosha Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>माङ्गलिक स्थिति:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: chartData.doshas?.manglik?.hasDosha ? '#EF4444' : '#10B981', marginTop: '0.15rem' }}>
                  {chartData.doshas?.manglik?.hasDosha ? `माङ्गलिक योग (${chartData.doshas?.manglik?.severity})` : "माङ्गलिक दोष रहित"}
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>कालसर्प स्थिति:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: chartData.doshas?.kaalSarp?.hasDosha ? '#F59E0B' : '#10B981', marginTop: '0.15rem' }}>
                  {chartData.doshas?.kaalSarp?.name}
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>शनि साढेसाती:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: chartData.doshas?.sadeSati?.inSadeSati ? '#EF4444' : '#10B981', marginTop: '0.15rem' }}>
                  {chartData.doshas?.sadeSati?.phase}
                </div>
              </div>
            </div>

            {/* Vedic Remedies Box */}
            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.07)', border: '1px solid var(--border-gold-subtle)', borderRadius: '10px' }}>
              <h5 style={{ color: 'var(--gold-light)', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} /> शास्त्रीय वैदिक शान्ति उपायहरू
              </h5>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>💎 <strong>रत्न परामर्श:</strong> {reading.remedies?.gemstone || "योग्य ज्योतिषीको परामर्शमा पन्ना वा मोती धारण गर्नु शुभ हुनेछ।"}</div>
                <div>🕉️ <strong>मन्त्र साधना:</strong> {reading.remedies?.mantra || "दैनिक १०८ पटक गायत्री मन्त्र वा महामृत्युञ्जय मन्त्रको जप गर्नुहोस्।"}</div>
                <div>🙏 <strong>दान र सेवा:</strong> {reading.remedies?.daan || "शनिवार र औंसीको दिन गरिब तथा असहायलाई भोजन गराउनुहोस्।"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
