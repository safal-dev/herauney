import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Key, TrendingUp, Compass, MessageSquare, 
  Search, CheckCircle2, AlertCircle, RefreshCw, LogOut 
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState(null);

  // AI API Key management
  const [newApiKey, setNewApiKey] = useState('');
  const [keyUpdateMsg, setKeyUpdateMsg] = useState('');

  // Check saved admin token
  useEffect(() => {
    const token = localStorage.getItem('herauney_admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'लगइन असफल भयो।');
      }

      localStorage.setItem('herauney_admin_token', data.token);
      setIsAuthenticated(true);
      fetchDashboardData();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('herauney_admin_token');
    setIsAuthenticated(false);
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, consRes, statusRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/consultations'),
        fetch('/api/status')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (consRes.ok) setConsultations(await consRes.json());
      if (statusRes.ok) setApiStatus(await statusRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleUpdateApiKey = async (e) => {
    e.preventDefault();
    if (!newApiKey.trim()) return;

    try {
      const res = await fetch('/api/admin/update-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newApiKey })
      });

      const data = await res.json();
      if (res.ok) {
        setKeyUpdateMsg('✅ ' + data.message);
        setNewApiKey('');
        fetchDashboardData();
      } else {
        setKeyUpdateMsg('❌ ' + data.error);
      }
    } catch (err) {
      setKeyUpdateMsg('❌ API Key अद्यावधिक गर्दा समस्या आयो।');
    }
  };

  const handleRemoveApiKey = async () => {
    if (!window.confirm('के तपाईं निश्चित हुनुहुन्छ? यो API Key स्थायी रूपमा हट्नेछ।')) return;
    try {
      const res = await fetch('/api/admin/remove-key', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setKeyUpdateMsg('🗑️ ' + data.message);
        fetchDashboardData();
      }
    } catch (err) {
      setKeyUpdateMsg('❌ API Key हटाउन सकिएन।');
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.birthDetails?.district?.nameNp?.includes(q)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="admin-card animate-fade-in" style={{ maxWidth: '440px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="brand-icon-wrapper" style={{ margin: '0 auto 1.25rem' }}>
          <Shield size={24} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          सुपर एडमिन लगइन
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          प्रयोगकर्ताहरूको विवरण, फोन नम्बर र प्लेटफर्म विश्लेषण हेर्न पासवर्ड प्रविष्ट गर्नुहोस्।
        </p>

        {loginError && (
          <div style={{ padding: '0.65rem', background: 'rgba(220, 38, 38, 0.15)', border: '1px solid var(--sindur-red)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            <label>एडमिन पासवर्ड</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="पासवर्ड प्रविष्ट गर्नुहोस्"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              डिफल्ट पासवर्ड: <code>admin@herauney2026</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-unlock-gold"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Shield size={18} />
            <span>{loading ? 'प्रमाणीकरण हुँदैछ...' : 'एडमिन प्यानल खोल्नुहोस्'}</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container animate-fade-in">
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--gold-light)' }}>
            सुपर एडमिन ड्यासबोर्ड
          </h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            प्रयोगकर्ता व्यवस्थापन, फोन नम्बर लिड्स र AI सेवा स्थिति
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchDashboardData} className="btn-admin-switch">
            <RefreshCw size={15} />
            <span>रिफ्रेस</span>
          </button>
          <button onClick={handleLogout} className="btn-admin-switch" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171' }}>
            <LogOut size={15} />
            <span>लगआउट</span>
          </button>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="admin-stats-grid">
        <div className="stat-box">
          <div className="stat-number">{stats?.totalVisits || 0}</div>
          <div className="stat-label">कुल आगन्तुक (Visits)</div>
        </div>

        <div className="stat-box">
          <div className="stat-number">{stats?.totalKundalis || 0}</div>
          <div className="stat-label">बनाइएका कुण्डलीहरू (25% Views)</div>
        </div>

        <div className="stat-box">
          <div className="stat-number" style={{ color: '#34D399' }}>{stats?.totalSignups || users.length}</div>
          <div className="stat-label">दर्ता भएका प्रयोगकर्ता (Leads)</div>
        </div>

        <div className="stat-box">
          <div className="stat-number" style={{ color: '#38BDF8' }}>{stats?.conversionRate || '0%'}</div>
          <div className="stat-label">साइन अप रूपान्तरण दर</div>
        </div>

        <div className="stat-box">
          <div className="stat-number" style={{ color: '#FCD34D' }}>{stats?.totalConsultations || consultations.length}</div>
          <div className="stat-label">सोधिएका प्रश्नहरू (Chats)</div>
        </div>
      </div>

      {/* AI API Management Card */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} />
            <span>AI ज्योतिष सेवा कुञ्जी (API Key) व्यवस्थापन</span>
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span>स्थिति:</span>
            {(apiStatus?.hasApiKey || apiStatus?.hasClaudeKey) ? (
              <span style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                ● AI ज्योतिष इन्जिन सक्रिय (Live)
              </span>
            ) : (
              <span style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                ● वैदिक इन्जिन (Local Mode)
              </span>
            )}
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          तपाईंले यहाँ नयाँ AI API Key (sk-ant-...) राखेपछि यो <strong>स्थायी रूपमा सुरक्षित</strong> हुन्छ। सर्भर रिस्टार्ट भए पनि यो कहिल्यै हट्ने छैन (सुपर एडमिनले यहाँबाट नहटाएसम्म)।
        </p>

        {(apiStatus?.hasApiKey || apiStatus?.hasClaudeKey) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#34D399' }}>
              🔒 हालको सक्रिय Key: <code>{apiStatus.maskedKey || '••••••••'}</code> (स्थायी रूपमा सुरक्षित)
            </span>
            <button
              type="button"
              onClick={handleRemoveApiKey}
              className="btn-admin-switch"
              style={{ padding: '0.3rem 0.75rem', borderColor: '#EF4444', color: '#F87171', fontSize: '0.78rem' }}
            >
              🗑️ Key हटाउनुहोस् (Remove)
            </button>
          </div>
        )}

        {keyUpdateMsg && (
          <div style={{ padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', background: '#1E293B', color: 'var(--text-primary)' }}>
            {keyUpdateMsg}
          </div>
        )}

        <form onSubmit={handleUpdateApiKey} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="password"
            className="form-input"
            style={{ flex: 1, minWidth: '280px' }}
            placeholder="sk-ant-api03-..."
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
          />
          <button type="submit" className="btn-admin-switch" style={{ background: 'var(--gold-primary)', color: '#070A12', fontWeight: 'bold' }}>
            API Key सुरक्षित गर्नुहोस्
          </button>
        </form>
      </div>

      {/* Registered Users Table */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--gold-light)' }}>
              दर्ता भएका प्रयोगकर्ताहरू (User Leads — {filteredUsers.length})
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              १००% अनलक गर्न नाम, इमेल र फोन नम्बर दर्ता गरेका ग्राहकहरू।
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="नाम वा फोन नम्बर खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>नाम (Name)</th>
                <th>सम्पर्क फोन (Phone)</th>
                <th>इमेल (Email)</th>
                <th>जन्म जिल्ला (District)</th>
                <th>जन्म मिति र समय</th>
                <th>दर्ता मिति</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>
                      <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>
                        +977 {u.phone}
                      </span>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.birthDetails?.district?.nameNp || 'नेपाल'}</td>
                    <td>
                      {u.birthDetails?.dobBs || u.birthDetails?.dob 
                        ? `${u.birthDetails.dobBs || u.birthDetails.dob} (${u.birthDetails.tobFormatted || u.birthDetails.tob})` 
                        : '-'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleString('ne-NP')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    कुनै पनि प्रयोगकर्ता भेटिएन।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Questions & Consultation Logs */}
      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--gold-light)', marginBottom: '0.5rem' }}>
          ज्योतिष परामर्श तथा प्रश्नोत्तर लग (Consultation Logs)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          प्रयोगकर्ताहरूले ज्योतिषीसँग सोधेका वास्तविक प्रश्नहरू र प्राप्त जवाफहरू।
        </p>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>प्रयोगकर्ता</th>
                <th>सोधिएको प्रश्न (User Question)</th>
                <th>ज्योतिषीय जवाफ (Answer Snippet)</th>
                <th>समय</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length > 0 ? (
                consultations.slice(-10).reverse().map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.userName}</strong></td>
                    <td style={{ color: 'var(--gold-light)' }}>{c.question}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '350px' }}>
                      {c.answer.substring(0, 90)}...
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    अहिलेसम्म कुनै प्रश्न दर्ता भएको छैन।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
