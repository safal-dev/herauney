import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, User, Award, CheckCircle2 } from 'lucide-react';
import { toDevanagari } from '../data/vedicData';

export default function AstrologerChat({ chartData, currentUser, onUnlockRequired }) {
  const chatStorageKey = `herauney_chat_${currentUser?.id || chartData?.name || 'default'}`;

  const rawName = (chartData?.name || '').trim();
  const firstName = rawName.split(' ')[0] || '';
  const commonNames = {
    roshan: 'रोशन', safal: 'सफल', ram: 'राम', shyam: 'श्याम', hari: 'हरि',
    sita: 'सीता', gita: 'गीता', prakash: 'प्रकाश', bikash: 'विकास', suresh: 'सुरेश',
    anil: 'अनिल', sunil: 'सुनील', manoj: 'मनोज', binod: 'बिनोद', deepak: 'दीपक',
    dipesh: 'दिपेश', rajesh: 'राजेश', kiran: 'किरण', prabin: 'प्रबिन', praveen: 'प्रवीण',
    santosh: 'सन्तोष', sagar: 'सागर', sushant: 'सुशान्त', ayush: 'आयुष', aashish: 'आशिष',
    ashish: 'आशिष', anup: 'अनुप', sandesh: 'सन्देश', pujan: 'पुजन', saurav: 'सौरभ',
    sabin: 'सबिन', nishan: 'निशान', rohit: 'रोहित', suman: 'सुमन', pooja: 'पूजा'
  };
  const nepaliFirstName = commonNames[firstName.toLowerCase()] || (firstName.charAt(0).toUpperCase() + firstName.slice(1));
  const isFemale = chartData?.gender === 'महिला';
  const addressName = nepaliFirstName ? `${nepaliFirstName} ${isFemale ? 'नानी' : 'बाबु'}` : (isFemale ? 'नानी' : 'बाबु');

  const defaultWelcomeMessage = {
    id: 'welcome_1',
    sender: 'astrologer',
    time: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
    text: `कल्याण होस्, ${addressName}!

म पण्डित नारायण प्रसाद घिमिरे हुँ। मैले तिम्रो जन्म पत्रिका (कुण्डली) मेरो अगाडि फिँजाएर राखेको छु। तिम्रो लग्न ${chartData?.lagna?.rashiName || ''} र चन्द्र राशि ${chartData?.moonSign?.rashiName || ''} (${chartData?.moonSign?.nakshatra || ''} नक्षत्र) मा नवग्रहहरूको संयोजन विशिष्ट देखिन्छ।

भन त बाबु, आज कुन कुराले तिम्रो मनमा धेरै सोचाइ वा द्विविधा पारिरहेको छ? घरपरिवार, वैवाहिक जीवन, नोकरी/करियर, विदेश यात्रा, धन-सम्पत्ति, वा जीवनको कुनै पनि जिज्ञासा? म तिम्रो हितैषी गुरुका रूपमा तिमीलाई सदैव सत्य, सान्त्वना र मार्गदर्शन दिनेछु। निःसङ्कोच जेसुकै सोध।`
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading chat messages:', e);
    }
    return [defaultWelcomeMessage];
  });

  // Keep chat history permanently saved in localStorage
  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem(chatStorageKey, JSON.stringify(messages));
      }
    } catch (e) {
      console.error('Error persisting chat:', e);
    }
  }, [messages, chatStorageKey]);

  const handleResetChat = () => {
    if (window.confirm('के तपाईं पण्डितजीसँगको पुरानो कुराकानी मेटाएर नयाँ संवाद सुरु गर्न चाहनुहुन्छ?')) {
      const fresh = [{
        ...defaultWelcomeMessage,
        id: 'welcome_' + Date.now(),
        time: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' })
      }];
      setMessages(fresh);
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(fresh));
      } catch (e) {}
    }
  };
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "गुरुजी, मेरो विवाह कहिले हुन्छ र जोडी कस्तो मिल्छ?",
    "मलाई सरकारी जागिर फाप्छ कि आफ्नै स्वतन्त्र व्यापार?",
    "विदेश जाने सपना छ, मेरो योग कत्तिको बलियो छ?",
    "मेरो घरपरिवार र कुटुम्बको सुख-शान्ति कस्तो छ?",
    "कुण्डलीमा कुनै ग्रहको बाधा वा दोष छ कि गुरुजी?",
    "आजभोलि मन किन यति धेरै अशान्त भइरहेको छ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    // Check if user is registered; if not, prompt unlock modal!
    if (!currentUser) {
      if (onUnlockRequired) {
        onUnlockRequired();
      }
      return;
    }

    const currentTime = new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      time: currentTime,
      text: query
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          chartData,
          conversationHistory: messages,
          userId: currentUser?.id,
          userName: currentUser?.name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'पण्डितजीसँग सम्पर्क हुन सकेन।');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_bot_' + Date.now(),
          sender: 'astrologer',
          time: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
          text: data.answer
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'astrologer',
          time: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' }),
          text: `क्षम्यताम्! ${err.message || 'कुण्डली मन्थन गर्दा केही अवरोध आयो। कृपया केही क्षणपछि पुनः सोध्नुहोस्।'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Astrologer Realistic Profile Header */}
      <div className="chat-header" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #F59E0B, #92400E)',
              border: '2px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
            }}>
              🙏
            </div>
            {/* Live Green Online Dot */}
            <span style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid #0F172A',
              boxShadow: '0 0 6px #10B981'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--gold-light)', margin: 0 }}>
                पण्डित नारायण प्रसाद घिमिरे
              </h4>
              <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid var(--border-gold-subtle)' }}>
                वरिष्ठ वैदिक राजज्योतिषी
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
              ● प्रत्यक्ष अनलाइन परामर्श • ४५ वर्षको ज्योतिष साधना
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            कुण्डली: <strong style={{ color: 'var(--gold-light)' }}>{chartData?.name}</strong> ({chartData?.lagna?.rashiName || ''} लग्न)
          </div>
          <button
            type="button"
            onClick={handleResetChat}
            className="btn-admin-switch"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', borderColor: 'var(--border-gold-subtle)' }}
            title="पण्डितजीसँग नयाँ कुराकानी सुरु गर्नुहोस्"
          >
            🔄 नयाँ संवाद
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.sender}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: msg.sender === 'astrologer' ? 'var(--gold-primary)' : 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 'bold' }}>
              <span>{msg.sender === 'astrologer' ? 'पण्डित नारायण प्रसाद' : (currentUser?.name || 'तपाईं')}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>{msg.time}</span>
            </div>
            <div style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.75' }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg astrologer animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} className="animate-spin" color="var(--gold-primary)" />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>पण्डितजीले तपाईंको कुण्डलीका भाव र गोचर मन्थन गर्दै विचार लेख्दै हुनुहुन्छ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Conversational Quick Prompts */}
      <div className="quick-prompts-row">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            className="btn-quick-prompt"
            onClick={() => handleSend(prompt)}
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="chat-input-bar">
        <input
          type="text"
          className="chat-input"
          placeholder={currentUser ? "सद्गुरु पण्डितजीसँग जीवनका जुनसुकै प्रश्न सोध्नुहोस् (घरायसी, भविष्य, करियर, मनको द्विविधा...)" : "पण्डितजीसँग कुरा गर्न पहिले १००% निःशुल्क साइन अप गर्नुहोस्..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="btn-send-chat"
          disabled={loading}
          onClick={() => handleSend()}
          title="पठाउनुहोस्"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
