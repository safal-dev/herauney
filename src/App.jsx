import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BirthForm from './components/BirthForm';
import AstrologyReport from './components/AstrologyReport';
import AstrologerChat from './components/AstrologerChat';
import SignupModal from './components/SignupModal';
import AdminDashboard from './components/AdminDashboard';
import { generateVedicChart } from './utils/vedicAstrology';
import { Sparkles, Compass, MessageCircle, FileText, ChevronRight, UserCheck, PlusCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('astrology'); // 'astrology' | 'admin'
  const [astrologySubView, setAstrologySubView] = useState('report'); // 'report' | 'chat'
  
  const [currentUser, setCurrentUser] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [readingData, setReadingData] = useState(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [showBirthForm, setShowBirthForm] = useState(false);

  // Restore session: user, computed chart & reading from localStorage
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('herauney_current_user');
      const savedChartStr = localStorage.getItem('herauney_saved_chart');
      const savedReadingStr = localStorage.getItem('herauney_saved_reading');

      let userObj = null;
      if (savedUserStr) {
        userObj = JSON.parse(savedUserStr);
        setCurrentUser(userObj);
      }

      let chartObj = null;
      if (savedChartStr) {
        chartObj = JSON.parse(savedChartStr);
        setChartData(chartObj);
      } else if (userObj?.chartData) {
        chartObj = userObj.chartData;
        setChartData(chartObj);
      }

      if (savedReadingStr) {
        setReadingData(JSON.parse(savedReadingStr));
      } else if (userObj?.readingData) {
        setReadingData(userObj.readingData);
      }

      // If we have an active chart/user session, do not show the empty birth form!
      if (chartObj) {
        setShowBirthForm(false);
      } else {
        setShowBirthForm(true);
      }

      // Verify and sync with server in background if user is signed in
      if (userObj?.id) {
        fetch(`/api/auth/session/${userObj.id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data?.user?.chartData && !savedChartStr) {
              setChartData(data.user.chartData);
              localStorage.setItem('herauney_saved_chart', JSON.stringify(data.user.chartData));
            }
            if (data?.user?.readingData && !savedReadingStr) {
              setReadingData(data.user.readingData);
              localStorage.setItem('herauney_saved_reading', JSON.stringify(data.user.readingData));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error('Error restoring session from localStorage:', e);
      setShowBirthForm(true);
    }
  }, []);

  // Handle Birth Details Form Submission
  const handleFormSubmit = async (formData) => {
    setLoadingReading(true);
    try {
      // 1. Calculate Astronomical Chart using Vedic Ephemeris
      const computedChart = generateVedicChart(formData);
      setChartData(computedChart);
      localStorage.setItem('herauney_saved_chart', JSON.stringify(computedChart));

      // 2. Fetch Reading (25% if guest, 100% if already signed in)
      const isUnlocked = !!currentUser;
      const res = await fetch('/api/chart/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartData: computedChart,
          isFullUnlocked: isUnlocked
        })
      });

      if (res.ok) {
        const reading = await res.json();
        setReadingData(reading);
        localStorage.setItem('herauney_saved_reading', JSON.stringify(reading));
      }

      setShowBirthForm(false);
      setAstrologySubView('report');
      // Smooth scroll to reading
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 200);
    } catch (err) {
      console.error('Error generating chart reading:', err);
    } finally {
      setLoadingReading(false);
    }
  };

  // Handle 100% Unlock on Signup Success
  const handleSignupSuccess = async (user) => {
    setCurrentUser(user);
    localStorage.setItem('herauney_current_user', JSON.stringify(user));
    if (chartData) {
      localStorage.setItem('herauney_saved_chart', JSON.stringify(chartData));
    }
    setIsSignupModalOpen(false);
    setShowBirthForm(false);

    if (chartData) {
      setLoadingReading(true);
      try {
        const res = await fetch('/api/chart/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chartData,
            isFullUnlocked: true
          })
        });

        if (res.ok) {
          const fullReading = await res.json();
          setReadingData(fullReading);
          localStorage.setItem('herauney_saved_reading', JSON.stringify(fullReading));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReading(false);
      }
    }
  };

  // Logout / End Active Session
  const handleLogout = () => {
    if (window.confirm('के तपाईं हालको सत्र बन्द (लगआउट) गर्न चाहनुहुन्छ?')) {
      localStorage.removeItem('herauney_current_user');
      localStorage.removeItem('herauney_saved_chart');
      localStorage.removeItem('herauney_saved_reading');
      setCurrentUser(null);
      setChartData(null);
      setReadingData(null);
      setShowBirthForm(true);
      setAstrologySubView('report');
    }
  };

  return (
    <div className="app-wrapper">
      <div className="cosmic-dust-overlay" />

      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={currentUser ? handleLogout : null}
      />

      <main className="main-content">
        {activeTab === 'admin' ? (
          /* Super Admin Dashboard View */
          <AdminDashboard />
        ) : (
          /* Main Astrology Experience View */
          <>
            {/* Hero Banner */}
            <section className="hero-section">
              <div className="hero-pill">
                <Sparkles size={14} />
                <span>नेपालको आफ्नै आधुनिक वैदिक ज्योतिष प्लेटफर्म</span>
              </div>
              <h2 className="hero-title">
                आफ्नो <span className="highlight-gold">विगत, वर्तमान र भविष्यको</span> ऐना हेर्नुहोस्
              </h2>
              <p className="hero-subtitle">
                नेपालका ७७ वटै जिल्लाको सटीक अक्षांश र देशान्तरमा आधारित उत्तर-भारतीय लग्न कुण्डली, विंशोत्तरी दशा समयरेखा, र वैदिक सिद्धान्तमा आधारित प्रामाणिक फलादेश।
              </p>
            </section>

            {/* Active Session Continuation Banner (Never re-enter details!) */}
            {chartData && (
              <div className="active-session-banner animate-fade-in" style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.85))',
                border: '1px solid var(--border-gold)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        ● तपाईंको सत्र सक्रिय छ (Session Active)
                      </span>
                      {currentUser && (
                        <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                          ✓ १००% पूर्ण अनलक
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', color: 'var(--gold-light)', margin: 0 }}>
                      {currentUser ? `नमस्ते, ${currentUser.name}जी! तपाईंको कुण्डली सुरक्षित छ` : `${chartData.name}को कुण्डली सुरक्षित छ`}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <span>📅 {chartData.dobBs || chartData.dob}</span>
                      <span>⏰ {chartData.tobFormatted || chartData.tob}</span>
                      <span>📍 {chartData.district?.nameNp}</span>
                      <span style={{ color: 'var(--gold-light)' }}>♈ {chartData.lagna?.rashiName} लग्न</span>
                      <span style={{ color: 'var(--gold-light)' }}>🌙 {chartData.moonSign?.rashiName} राशि</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setAstrologySubView('report'); setShowBirthForm(false); }}
                      className="btn-admin-switch"
                      style={{
                        background: astrologySubView === 'report' && !showBirthForm ? 'var(--gold-primary)' : 'var(--surface-card)',
                        color: astrologySubView === 'report' && !showBirthForm ? '#070A12' : 'var(--text-primary)',
                        fontWeight: 600
                      }}
                    >
                      <FileText size={15} />
                      <span>कुण्डली तथा फलादेश</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!currentUser) {
                          setIsSignupModalOpen(true);
                        } else {
                          setAstrologySubView('chat');
                          setShowBirthForm(false);
                        }
                      }}
                      className="btn-admin-switch"
                      style={{
                        background: astrologySubView === 'chat' && !showBirthForm ? 'var(--gold-primary)' : 'var(--surface-card)',
                        color: astrologySubView === 'chat' && !showBirthForm ? '#070A12' : 'var(--text-primary)',
                        fontWeight: 600
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>ज्योतिषीसँग परामर्श {currentUser ? '' : '(🔒 अनलक)'}</span>
                    </button>

                    <button
                      onClick={() => setShowBirthForm(!showBirthForm)}
                      className="btn-admin-switch"
                      style={{
                        borderColor: showBirthForm ? 'var(--gold-primary)' : 'var(--border-gold-subtle)',
                        color: showBirthForm ? 'var(--gold-light)' : 'var(--text-secondary)'
                      }}
                    >
                      <span>{showBirthForm ? '✕ फारम बन्द गर्नुहोस्' : '➕ नयाँ व्यक्तिको कुण्डली'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Birth Information Form (Shown only if no chart or user requested new person) */}
            {(showBirthForm || !chartData) && (
              <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
                <BirthForm
                  onSubmit={handleFormSubmit}
                  loading={loadingReading}
                  showCancelBtn={!!chartData}
                  onCancel={() => setShowBirthForm(false)}
                />
              </div>
            )}

            {/* Kundali & Astrological Report Section */}
            {chartData && (
              <div style={{ marginTop: '1rem' }}>
                {/* Sub-view switcher: Kundali Report vs Live Chat */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                  <button
                    onClick={() => setAstrologySubView('report')}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      background: astrologySubView === 'report' ? 'var(--gold-primary)' : 'var(--surface-card)',
                      color: astrologySubView === 'report' ? '#070A12' : 'var(--text-primary)',
                      border: '1px solid var(--border-gold-subtle)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <FileText size={16} />
                    <span>कुण्डली तथा विस्तृत फलादेश</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsSignupModalOpen(true);
                      } else {
                        setAstrologySubView('chat');
                      }
                    }}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      background: astrologySubView === 'chat' ? 'var(--gold-primary)' : 'var(--surface-card)',
                      color: astrologySubView === 'chat' ? '#070A12' : 'var(--text-primary)',
                      border: '1px solid var(--border-gold-subtle)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>ज्योतिषीसँग प्रश्न सोध्नुहोस् {currentUser ? '' : '(🔒 साइन अप आवश्यक)'}</span>
                  </button>
                </div>

                {astrologySubView === 'report' ? (
                  <AstrologyReport
                    chartData={chartData}
                    readingData={readingData}
                    isFullUnlocked={!!currentUser}
                    onUnlockClick={() => setIsSignupModalOpen(true)}
                    onOpenChat={() => setAstrologySubView('chat')}
                  />
                ) : (
                  <AstrologerChat
                    chartData={chartData}
                    currentUser={currentUser}
                    onUnlockRequired={() => setIsSignupModalOpen(true)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sign-up Modal to Unlock Remaining 75% */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={handleSignupSuccess}
        initialName={chartData?.name}
        chartData={chartData}
        readingData={readingData}
        birthDetails={chartData ? {
          dob: chartData.dob,
          dobBs: chartData.dobBs,
          tob: chartData.tob,
          tobFormatted: chartData.tobFormatted,
          district: chartData.district
        } : null}
      />
    </div>
  );
}
