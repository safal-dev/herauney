import React, { useState } from 'react';
import { toDevanagari } from '../data/vedicData';

/**
 * Authentic North Indian Diamond Kundali (लग्न कुण्डली) SVG Component
 * Follows classical Vedic Jyotish geometry with 12 fixed houses, rotating Rashis, and Graha badges.
 */
export default function KundaliChart({ chartData, onSelectHouse }) {
  const [hoveredHouse, setHoveredHouse] = useState(null);

  if (!chartData || !chartData.lagna) {
    return (
      <div className="kundali-placeholder">
        <p>कुण्डली विवरण उपलब्ध छैन</p>
      </div>
    );
  }

  const { lagna, housePlanets } = chartData;
  const lagnaRashiNum = lagna.rashiNum; // 1 to 12

  // Calculate Rashi Number for each house (Counter-clockwise in North Indian chart)
  // House 1 = Lagna, House 2 = (Lagna) % 12 + 1, ...
  const getHouseRashi = (houseNum) => {
    return ((lagnaRashiNum + houseNum - 2) % 12) + 1;
  };

  // House geometry coordinates on a 400x400 canvas
  const housePolygons = {
    1: "200,0 100,100 200,200 300,100",        // 1st House (Top Center Diamond)
    2: "200,0 0,0 100,100",                   // 2nd House (Top Left Triangle)
    3: "0,0 0,200 100,100",                   // 3rd House (Far Left Upper Triangle)
    4: "0,200 100,100 200,200 100,300",       // 4th House (Left Diamond)
    5: "0,200 0,400 100,300",                 // 5th House (Far Left Lower Triangle)
    6: "0,400 200,400 100,300",               // 6th House (Bottom Left Triangle)
    7: "200,400 100,300 200,200 300,300",     // 7th House (Bottom Center Diamond)
    8: "200,400 400,400 300,300",             // 8th House (Bottom Right Triangle)
    9: "400,400 400,200 300,300",             // 9th House (Far Right Lower Triangle)
    10: "400,200 300,100 200,200 300,300",    // 10th House (Right Diamond)
    11: "400,200 400,0 300,100",              // 11th House (Far Right Upper Triangle)
    12: "200,0 400,0 300,100"                 // 12th House (Top Right Triangle)
  };

  // Mathematically calculated fixed text anchor positions for Rashi numbers (never touch any line)
  const rashiLabelPositions = {
    1:  { x: 200, y: 172 }, // 1st House (Top Center Diamond, 28px above center)
    2:  { x: 100, y: 72  }, // 2nd House (Top Left Triangle, centered on x=100)
    3:  { x: 72,  y: 100 }, // 3rd House (Far Left Upper Triangle, centered on y=100)
    4:  { x: 172, y: 200 }, // 4th House (Left Diamond, 28px left of center)
    5:  { x: 72,  y: 300 }, // 5th House (Far Left Lower Triangle, centered on y=300)
    6:  { x: 100, y: 328 }, // 6th House (Bottom Left Triangle, centered on x=100)
    7:  { x: 200, y: 228 }, // 7th House (Bottom Center Diamond, 28px below center)
    8:  { x: 300, y: 328 }, // 8th House (Bottom Right Triangle, centered on x=300)
    9:  { x: 328, y: 300 }, // 9th House (Far Right Lower Triangle, centered on y=300)
    10: { x: 228, y: 200 }, // 10th House (Right Diamond, 28px right of center)
    11: { x: 328, y: 100 }, // 11th House (Far Right Upper Triangle, centered on y=100)
    12: { x: 300, y: 72  }  // 12th House (Top Right Triangle, centered on x=300)
  };

  // Dedicated spacious center coordinates for rendering planets inside each house
  const planetCenterPositions = {
    1:  { x: 200, y: 80  }, // 1st House (Top Center Diamond body)
    2:  { x: 100, y: 36  }, // 2nd House (Top Left Triangle wide base)
    3:  { x: 36,  y: 100 }, // 3rd House (Far Left Upper Triangle wide base)
    4:  { x: 80,  y: 200 }, // 4th House (Left Diamond body)
    5:  { x: 36,  y: 300 }, // 5th House (Far Left Lower Triangle wide base)
    6:  { x: 100, y: 364 }, // 6th House (Bottom Left Triangle wide base)
    7:  { x: 200, y: 320 }, // 7th House (Bottom Center Diamond body)
    8:  { x: 300, y: 364 }, // 8th House (Bottom Right Triangle wide base)
    9:  { x: 364, y: 300 }, // 9th House (Far Right Lower Triangle wide base)
    10: { x: 320, y: 200 }, // 10th House (Right Diamond body)
    11: { x: 364, y: 100 }, // 11th House (Far Right Upper Triangle wide base)
    12: { x: 300, y: 36  }  // 12th House (Top Right Triangle wide base)
  };

  const handleHouseClick = (houseNum) => {
    if (onSelectHouse) {
      onSelectHouse({
        houseNum,
        rashiNum: getHouseRashi(houseNum),
        planets: housePlanets[houseNum] || []
      });
    }
  };

  return (
    <div className="kundali-container">
      <div className="kundali-header">
        <div className="kundali-title">
          <span className="kundali-badge">वैदिक लग्न कुण्डली</span>
          <h3>{chartData.name} को जन्म चक्र</h3>
        </div>
        <div className="kundali-submeta">
          <span>जन्म मिति: <strong>{chartData.dobBs || chartData.dob}</strong></span>
          <span>समय: <strong>{chartData.tobFormatted || chartData.tob}</strong></span>
          <span>लग्न: <strong>{lagna.rashiName} ({toDevanagari(lagna.degree)}°)</strong></span>
          <span>चन्द्र राशि: <strong>{chartData.moonSign.rashiName}</strong></span>
          <span>नक्षत्र: <strong>{chartData.moonSign.nakshatra} (चरण {toDevanagari(chartData.moonSign.pada)})</strong></span>
        </div>
      </div>

      <div className="kundali-svg-wrapper">
        <svg viewBox="0 0 400 400" className="kundali-svg">
          <defs>
            <radialGradient id="kundaliGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.15)" />
              <stop offset="100%" stopColor="rgba(7, 10, 18, 0)" />
            </radialGradient>
            <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.8"/>
            </filter>
          </defs>

          {/* Background Glow */}
          <rect x="0" y="0" width="400" height="400" fill="url(#kundaliGlow)" />

          {/* 1. House Interactive Background Fills */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
            const isHovered = hoveredHouse === houseNum;
            const isKendra = [1, 4, 7, 10].includes(houseNum);

            let houseFill = "rgba(15, 23, 42, 0.65)";
            if (isHovered) {
              houseFill = "rgba(245, 158, 11, 0.22)";
            } else if (isKendra) {
              houseFill = "rgba(30, 41, 59, 0.75)";
            }

            return (
              <polygon
                key={`house-fill-${houseNum}`}
                points={housePolygons[houseNum]}
                fill={houseFill}
                className="house-polygon"
                onMouseEnter={() => setHoveredHouse(houseNum)}
                onMouseLeave={() => setHoveredHouse(null)}
                onClick={() => handleHouseClick(houseNum)}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* 2. Fixed Classical Structural Grid Lines (अचल कुण्डली रेखाहरू - Always Fixed) */}
          <g className="kundali-fixed-grid" pointerEvents="none">
            {/* Outer Square Border */}
            <rect x="0" y="0" width="400" height="400" fill="none" stroke="url(#goldBorder)" strokeWidth="2.5" />

            {/* Diagonals (X) */}
            <line x1="0" y1="0" x2="400" y2="400" stroke="url(#goldBorder)" strokeWidth="1.6" />
            <line x1="400" y1="0" x2="0" y2="400" stroke="url(#goldBorder)" strokeWidth="1.6" />

            {/* Inscribed Diamond (Rhombus) */}
            <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="url(#goldBorder)" strokeWidth="1.6" />

            {/* Central Sacred Bindu */}
            <circle cx="200" cy="200" r="3.5" fill="#F59E0B" />
            <circle cx="200" cy="200" r="1.2" fill="#FFFFFF" />
          </g>

          {/* 3. Fixed Words & Numbers Layer (Devanagari Rashi Numbers and Graha Badges) */}
          <g className="kundali-text-layer" pointerEvents="none">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
              const rashiNum = getHouseRashi(houseNum);
              const rashiPos = rashiLabelPositions[houseNum];
              const pCenter = planetCenterPositions[houseNum];
              const planets = housePlanets[houseNum] || [];

              return (
                <g key={`house-text-${houseNum}`}>
                  {/* Fixed Rashi Number in Devanagari (Clean, never touches lines) */}
                  <text
                    x={rashiPos.x}
                    y={rashiPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="rashi-number"
                    fill="#F59E0B"
                    fontSize="13"
                    fontWeight="bold"
                    filter="url(#shadowFilter)"
                  >
                    {toDevanagari(rashiNum)}
                  </text>

                  {/* Fixed Graha Badges (Planets) */}
                  {planets.length > 0 && (
                    <g className="house-planets">
                      {planets.map((graha, idx) => {
                        const total = planets.length;
                        let offsetX = 0;
                        let offsetY = 0;

                        if (total === 1) {
                          offsetX = 0;
                          offsetY = 0;
                        } else if (total === 2) {
                          offsetX = (idx === 0 ? -13 : 13);
                          offsetY = 0;
                        } else if (total === 3) {
                          offsetX = (idx - 1) * 20;
                          offsetY = 0;
                        } else {
                          // 4 or more: 2x2 grid
                          offsetX = (idx % 2 === 0 ? -12 : 12);
                          offsetY = (Math.floor(idx / 2) === 0 ? -9 : 9);
                        }

                        return (
                          <text
                            key={graha.id}
                            x={pCenter.x + offsetX}
                            y={pCenter.y + offsetY}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#FFFFFF"
                            fontSize="15"
                            fontWeight="800"
                            filter="url(#shadowFilter)"
                            style={{ letterSpacing: '0.5px' }}
                          >
                            {graha.short}
                          </text>
                        );
                      })}
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Interactive House Details Bar */}
      <div className="kundali-legend">
        {hoveredHouse ? (
          <div className="legend-hover-detail animate-fade-in">
            <span className="legend-house-badge">{toDevanagari(hoveredHouse)} औं घर (भाव)</span>
            <span className="legend-rashi">राशि: <strong>{toDevanagari(getHouseRashi(hoveredHouse))}</strong></span>
            <span className="legend-grahas">
              ग्रहहरू: {housePlanets[hoveredHouse]?.length > 0 ? (
                housePlanets[hoveredHouse].map(g => (
                  <span key={g.id} className="badge-graha" style={{ borderColor: g.color }}>
                    {g.nameNp} ({g.short})
                  </span>
                ))
              ) : "कुनै ग्रह छैन (खाली)"}
            </span>
          </div>
        ) : (
          <div className="legend-hint">
            <span>✨ कुनै पनि घरमा कर्सर राखेर वा क्लिक गरेर घर र ग्रहको स्थिति हेर्नुहोस्।</span>
          </div>
        )}
      </div>
    </div>
  );
}
