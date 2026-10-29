import React from 'react';
import { Sparkles, Shield, UserCheck, Moon, Sun } from 'lucide-react';

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div className="nav-brand" onClick={() => setActiveTab('astrology')}>
          <div className="brand-icon-wrapper">
            <span>ॐ</span>
          </div>
          <div className="brand-text">
            <h1>हेराउने</h1>
            <span>नेपाली वैदिक ज्योतिष</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="nav-actions">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="nav-badge-user">
                <UserCheck size={14} />
                <span>{currentUser.name} (पूर्ण अनलक)</span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="btn-admin-switch"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171' }}
                  title="सत्र समाप्त गर्नुहोस्"
                >
                  लगआउट
                </button>
              )}
            </div>
          ) : (
            <div className="nav-badge-user" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#FCD34D' }}>
              <Sparkles size={14} />
              <span>अतिथि (२५% निःशुल्क)</span>
            </div>
          )}

          {/* Tab Switches */}
          <button
            className={`btn-admin-switch ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'admin' ? 'astrology' : 'admin')}
          >
            <Shield size={16} />
            <span>{activeTab === 'admin' ? 'कुण्डली तर्फ' : 'सुपर एडमिन'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
