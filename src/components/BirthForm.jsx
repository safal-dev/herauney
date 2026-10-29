import React, { useState, useEffect } from 'react';
import { NEPAL_DISTRICTS } from '../data/nepalDistricts';
import { NEPALI_MONTHS, getBsYearList, convertBsToAd, convertAdToBs } from '../utils/nepaliCalendar';
import { toDevanagari } from '../data/vedicData';
import { Sparkles, Calendar, Clock, MapPin, User, ArrowRightLeft } from 'lucide-react';

export default function BirthForm({ onSubmit, loading, onCancel, showCancelBtn }) {
  // Calendar mode: 'BS' (वि.सं. - default for Nepali users) or 'AD' (ई.सं.)
  const [calendarType, setCalendarType] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).calendarType || 'BS';
    } catch (e) {}
    return 'BS';
  });

  // BS fields
  const [bsYear, setBsYear] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).bsYear || 2055;
    } catch (e) {}
    return 2055;
  });
  const [bsMonth, setBsMonth] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).bsMonth || 2;
    } catch (e) {}
    return 2;
  });
  const [bsDay, setBsDay] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).bsDay || 1;
    } catch (e) {}
    return 1;
  });

  // AD field
  const [adDate, setAdDate] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).adDate || '1998-05-14';
    } catch (e) {}
    return '1998-05-14';
  });

  // 12-Hour AM/PM Time fields
  const [timeHour, setTimeHour] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).timeHour || 6;
    } catch (e) {}
    return 6;
  });
  const [timeMinute, setTimeMinute] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).timeMinute || 30;
    } catch (e) {}
    return 30;
  });
  const [timeAmPm, setTimeAmPm] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) return JSON.parse(saved).timeAmPm || 'AM';
    } catch (e) {}
    return 'AM';
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('herauney_last_form_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          gender: parsed.gender || 'पुरुष',
          country: 'नेपाल',
          districtId: parsed.districtId || 'kathmandu'
        };
      }
    } catch (e) {}
    return {
      name: '',
      gender: 'पुरुष',
      country: 'नेपाल',
      districtId: 'kathmandu'
    };
  });

  const bsYears = getBsYearList();

  // Keep AD date updated when BS changes
  useEffect(() => {
    if (calendarType === 'BS') {
      const convertedAd = convertBsToAd(bsYear, bsMonth, bsDay);
      setAdDate(convertedAd);
    }
  }, [bsYear, bsMonth, bsDay, calendarType]);

  // Keep BS date updated when AD changes
  const handleAdChange = (e) => {
    const val = e.target.value;
    setAdDate(val);
    const convertedBs = convertAdToBs(val);
    if (convertedBs) {
      setBsYear(convertedBs.year);
      setBsMonth(convertedBs.month);
      setBsDay(convertedBs.day);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickDemo = () => {
    setFormData({
      name: 'आयुष शर्मा',
      gender: 'पुरुष',
      country: 'नेपाल',
      districtId: 'kathmandu'
    });
    setCalendarType('BS');
    setBsYear(2055);
    setBsMonth(2);
    setBsDay(1);
    setAdDate('1998-05-14');
    setTimeHour(6);
    setTimeMinute(30);
    setTimeAmPm('AM');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedDistrict = NEPAL_DISTRICTS.find(d => d.id === formData.districtId) || NEPAL_DISTRICTS[0];

    const currentMonthObj = NEPALI_MONTHS.find(m => m.id === Number(bsMonth)) || NEPALI_MONTHS[0];
    const formattedBs = `${toDevanagari(bsYear)} ${currentMonthObj.nameNp} ${toDevanagari(bsDay)} गते (वि.सं.)`;

    // Convert 12-Hour AM/PM to 24-Hour time for ephemeris calculation
    let h24 = parseInt(timeHour, 10);
    if (timeAmPm === 'PM' && h24 < 12) h24 += 12;
    if (timeAmPm === 'AM' && h24 === 12) h24 = 0;
    const tob24 = `${String(h24).padStart(2, '0')}:${String(timeMinute).padStart(2, '0')}`;

    // Formatted 12-hour Nepali time string
    const timePeriodLabel = timeAmPm === 'AM' ? 'बिहान' : (timeHour < 4 || timeHour === 12 ? 'दिउँसो' : (timeHour < 8 ? 'साँझ' : 'राति'));
    const formattedTime12 = `${timePeriodLabel} ${toDevanagari(timeHour)}:${toDevanagari(String(timeMinute).padStart(2, '0'))} (${timeHour}:${String(timeMinute).padStart(2, '0')} ${timeAmPm})`;

    // Persist form inputs in localStorage so details are remembered
    try {
      localStorage.setItem('herauney_last_form_data', JSON.stringify({
        ...formData,
        calendarType,
        bsYear,
        bsMonth,
        bsDay,
        adDate,
        timeHour,
        timeMinute,
        timeAmPm
      }));
    } catch (e) {
      console.error('Error saving form data to localStorage:', e);
    }

    onSubmit({
      ...formData,
      dob: adDate, // Pass AD date for ephemeris calculation
      dobBs: formattedBs, // Pass authentic BS date for presentation
      tob: tob24, // 24-hr time for accurate ephemeris
      tobFormatted: formattedTime12, // 12-hr AM/PM formatted for user display
      calendarType,
      district: selectedDistrict
    });
  };

  // Get max days for currently selected BS month
  const currentMonthData = NEPALI_MONTHS.find(m => m.id === Number(bsMonth)) || NEPALI_MONTHS[0];
  const maxDays = currentMonthData.days || 32;

  return (
    <div className="form-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--gold-light)' }}>
            आफ्नो जन्म विवरण प्रविष्ट गर्नुहोस्
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            नेपालको वि.सं. (Bikram Sambat) र ७७ जिल्लाको सटीक अक्षांश अनुसार लग्न कुण्डली निर्माण हुनेछ।
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickDemo}
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px dashed var(--gold-primary)',
            color: 'var(--gold-light)',
            padding: '0.4rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          ⚡ नमुना विवरण भर्नुहोस्
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Name */}
          <div className="form-group">
            <label>
              <User size={15} /> पूरा नाम (Full Name)
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="तपाईंको नाम (उदा. आयुष शर्मा)"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label>लिङ्ग (Gender)</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-select"
            >
              <option value="पुरुष">पुरुष (Male)</option>
              <option value="महिला">महिला (Female)</option>
              <option value="अन्य">अन्य (Other)</option>
            </select>
          </div>

          {/* Date of Birth with BS / AD Toggle */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ margin: 0 }}>
                <Calendar size={15} /> जन्म मिति (Date of Birth)
              </label>

              {/* BS / AD Toggle Tabs */}
              <div style={{ display: 'inline-flex', background: 'var(--bg-deep)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setCalendarType('BS')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    background: calendarType === 'BS' ? 'var(--gold-primary)' : 'transparent',
                    color: calendarType === 'BS' ? '#070A12' : 'var(--text-secondary)'
                  }}
                >
                  🇳🇵 वि.सं. (BS)
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarType('AD')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    background: calendarType === 'AD' ? 'var(--gold-primary)' : 'transparent',
                    color: calendarType === 'AD' ? '#070A12' : 'var(--text-secondary)'
                  }}
                >
                  🌐 ई.सं. (AD)
                </button>
              </div>
            </div>

            {/* BS Date Inputs (Year, Month, Day) */}
            {calendarType === 'BS' ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '0.5rem' }}>
                  {/* BS Year */}
                  <select
                    value={bsYear}
                    onChange={(e) => setBsYear(Number(e.target.value))}
                    className="form-select"
                  >
                    {bsYears.map(y => (
                      <option key={y.value} value={y.value}>{y.labelNp}</option>
                    ))}
                  </select>

                  {/* BS Month */}
                  <select
                    value={bsMonth}
                    onChange={(e) => setBsMonth(Number(e.target.value))}
                    className="form-select"
                  >
                    {NEPALI_MONTHS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nameNp} ({m.nameEn})
                      </option>
                    ))}
                  </select>

                  {/* BS Day */}
                  <select
                    value={bsDay}
                    onChange={(e) => setBsDay(Number(e.target.value))}
                    className="form-select"
                  >
                    {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>
                        {toDevanagari(d)} गते
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conversion feedback badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <ArrowRightLeft size={13} color="var(--gold-primary)" />
                  <span>ई.सं. (AD Solar Date): <strong style={{ color: 'var(--gold-light)' }}>{adDate}</strong> (खगोल गणनाका लागि)</span>
                </div>
              </div>
            ) : (
              /* AD Date Picker */
              <div>
                <input
                  type="date"
                  required
                  value={adDate}
                  onChange={handleAdChange}
                  className="form-input"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <ArrowRightLeft size={13} color="var(--gold-primary)" />
                  <span>वि.सं. रूपान्तरण: <strong style={{ color: 'var(--gold-light)' }}>{toDevanagari(bsYear)} {currentMonthData.nameNp} {toDevanagari(bsDay)} गते</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Time of Birth - 12 Hour Format (AM / PM) */}
          <div className="form-group">
            <label>
              <Clock size={15} /> जन्म समय (Time of Birth - १२ घण्टा AM/PM)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.6fr', gap: '0.5rem' }}>
              {/* Hour Dropdown (1 to 12) */}
              <select
                value={timeHour}
                onChange={(e) => setTimeHour(Number(e.target.value))}
                className="form-select"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {toDevanagari(String(h).padStart(2, '0'))} ({h}) बजे
                  </option>
                ))}
              </select>

              {/* Minute Dropdown (00 to 59) */}
              <select
                value={timeMinute}
                onChange={(e) => setTimeMinute(Number(e.target.value))}
                className="form-select"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>
                    {toDevanagari(String(m).padStart(2, '0'))} मिनेट
                  </option>
                ))}
              </select>

              {/* AM / PM Selector */}
              <div style={{ display: 'flex', background: 'var(--bg-deep)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <button
                  type="button"
                  onClick={() => setTimeAmPm('AM')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.2rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeAmPm === 'AM' ? 'var(--gold-primary)' : 'transparent',
                    color: timeAmPm === 'AM' ? '#070A12' : 'var(--text-secondary)'
                  }}
                >
                  AM (बिहान)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeAmPm('PM')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.2rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    background: timeAmPm === 'PM' ? 'var(--gold-primary)' : 'transparent',
                    color: timeAmPm === 'PM' ? '#070A12' : 'var(--text-secondary)'
                  }}
                >
                  PM (दिउँसो/साँझ)
                </button>
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              चयन गरिएको समय: <strong style={{ color: 'var(--gold-light)' }}>{timeAmPm === 'AM' ? 'बिहान' : (timeHour < 4 || timeHour === 12 ? 'दिउँसो' : (timeHour < 8 ? 'साँझ' : 'राति'))} {toDevanagari(timeHour)}:{toDevanagari(String(timeMinute).padStart(2, '0'))} ({timeHour}:{String(timeMinute).padStart(2, '0')} {timeAmPm})</strong>
            </span>
          </div>

          {/* Country */}
          <div className="form-group">
            <label>
              <MapPin size={15} /> जन्म देश (Country)
            </label>
            <input
              type="text"
              name="country"
              value="नेपाल (Nepal)"
              disabled
              className="form-input"
              style={{ opacity: 0.8, cursor: 'not-allowed' }}
            />
          </div>

          {/* District */}
          <div className="form-group">
            <label>
              <MapPin size={15} /> जन्म जिल्ला (District - नेपालका ७७ जिल्ला)
            </label>
            <select
              name="districtId"
              value={formData.districtId}
              onChange={handleChange}
              className="form-select"
            >
              {NEPAL_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameNp} — ({d.nameEn}, {d.province})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button type="submit" disabled={loading} className="btn-submit-kundali" style={{ flex: 1, minWidth: '220px' }}>
            <Sparkles size={20} />
            <span>{loading ? 'कुण्डली गणना हुँदैछ...' : 'वैदिक कुण्डली बनाउनुहोस्'}</span>
          </button>
          {showCancelBtn && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-admin-switch"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderColor: 'var(--border-gold-subtle)' }}
            >
              रद्द गर्नुहोस् (मेरो कुण्डलीमा फर्कनुहोस्)
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
