import React, { useState } from 'react';
import { Lock, Sparkles, CheckCircle2, Phone, Mail, User, X } from 'lucide-react';

export default function SignupModal({ isOpen, onClose, onSignupSuccess, initialName, birthDetails, chartData, readingData }) {
  const [formData, setFormData] = useState({
    name: initialName || '',
    email: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate Nepali mobile number format (approx 10 digits starting with 97/98)
    const phoneClean = formData.phone.replace(/[\s-]/g, '');
    if (phoneClean.length < 10) {
      setError('कृपया कम्तिमा १० अंकको मान्य नेपाली फोन नम्बर प्रविष्ट गर्नुहोस् (उदा: 9812345678)।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: phoneClean,
          birthDetails,
          chartData,
          readingData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'साइन अप गर्न सकिएन।');
      }

      onSignupSuccess(data.user);
    } catch (err) {
      setError(err.message || 'त्रुटि भयो। पुनः प्रयास गर्नुहोस्।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <button className="btn-close-modal" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div className="lock-gold-circle" style={{ width: '56px', height: '56px', fontSize: '1.5rem', margin: '0 auto 0.75rem' }}>
            <Lock size={26} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--gold-light)' }}>
            १००% पूर्ण कुण्डली अनलक गर्नुहोस्
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            निःशुल्क दर्ता गरी विगतका प्रमुख घटनाहरू, विवाह, धन योग र प्रत्यक्ष ज्योतिषीसँग प्रश्न सोध्ने सुविधा पाउनुहोस्।
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(220, 38, 38, 0.15)', border: '1px solid var(--sindur-red)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>
              <User size={14} /> तपाईंको पूरा नाम
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="उदा. आयुष शर्मा"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>
              <Mail size={14} /> इमेल ठेगाना (Email)
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="उदा. aayush@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>
              <Phone size={14} /> मोबाइल नम्बर (Nepal Mobile Number)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ padding: '0.75rem 0.85rem', background: '#1E293B', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--gold-light)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                +977
              </span>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="९८xxxxxxxx (उदा. 9841234567)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              * तपाईंको फोन नम्बर गोप्य रहनेछ र कुण्डली परामर्शको लागि मात्र प्रयोग हुनेछ।
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-unlock-gold"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Sparkles size={18} />
            <span>{submitting ? 'अनलक गरिँदैछ...' : 'एक-क्लिकमा निःशुल्क अनलक गर्नुहोस्'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
