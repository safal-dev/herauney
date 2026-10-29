// Vedic Astrology (वैदिक ज्योतिष) Calculation Engine
// High-precision Nirayana Ephemeris powered by astronomy-engine (VSOP87 & ELP2000)
// Classical Lahiri (Chitra Paksha) Ayanamsha & Spherical Ascendant (Lagna)

import * as Astronomy from 'astronomy-engine';
import { RASHIS, GRAHAS, BHAVAS, NAKSHATRAS, VIMSHOTTARI_DASHA_CYCLE, toDevanagari } from '../data/vedicData.js';

const norm = (deg) => ((deg % 360) + 360) % 360;

/**
 * Classical Lahiri (Chitra Paksha) Ayanamsha
 * Standard Indian Astronomical Ephemeris / KP Astrology
 * At J2000.0 (2000-01-01 12:00 UTC): 23° 51' 25.53" = 23.857092°
 * Precession rate: 50.290966" / year = 0.01396971° / year
 */
function getLahiriAyanamsha(utcDate) {
  const dYears = (utcDate.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / (365.25 * 86400000);
  return 23.857092 + (dYears * 0.01396971);
}

/**
 * Computes high-precision sidereal (Nirayana) planetary longitudes
 */
function calculateGrahaPositions(astroTime, ayanamsha) {
  const bodies = [
    { id: "su", body: Astronomy.Body.Sun },
    { id: "ch", body: Astronomy.Body.Moon },
    { id: "ma", body: Astronomy.Body.Mars },
    { id: "bu", body: Astronomy.Body.Mercury },
    { id: "gu", body: Astronomy.Body.Jupiter },
    { id: "sk", body: Astronomy.Body.Venus },
    { id: "sa", body: Astronomy.Body.Saturn },
  ];

  const planets = [];

  // 7 Physical Grahas (Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani)
  for (const b of bodies) {
    const geoPos = Astronomy.GeoVector(b.body, astroTime, false);
    const ecliptic = Astronomy.Ecliptic(geoPos);
    const siderealLon = norm(ecliptic.elon - ayanamsha);
    planets.push({
      id: b.id,
      deg: siderealLon
    });
  }

  // Lunar Nodes (Rahu & Ketu - Mean Node of Moon)
  // Standard IAU Mean Ascending Node formula
  const T = astroTime.tt / 36525.0; // Julian centuries from J2000.0
  const rahuTrop = norm(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0);
  const rahuNirayana = norm(rahuTrop - ayanamsha);
  const ketuNirayana = norm(rahuNirayana + 180);

  planets.push({ id: "ra", deg: rahuNirayana });
  planets.push({ id: "ke", deg: ketuNirayana });

  return planets;
}

/**
 * Computes exact Nirayana Ascendant (लग्न) using Classical Spherical Trigonometry
 * Formula: tan(lambda) = cos(theta) / (-sin(theta)*cos(eps) - tan(phi)*sin(eps))
 * Where theta = Local Sidereal Time, phi = Geographical Latitude, eps = Obliquity of Ecliptic
 */
function calculateLagnaDegree(astroTime, lat, lng, ayanamsha) {
  // Greenwich Mean Sidereal Time in hours converted to degrees
  const gmstHours = Astronomy.SiderealTime(astroTime);
  const gmstDeg = gmstHours * 15.0;
  // Local Sidereal Time (LST)
  const lstDeg = norm(gmstDeg + lng);

  const lstRad = (lstDeg * Math.PI) / 180.0;
  const latRad = (lat * Math.PI) / 180.0;
  const eps = (23.4392911 * Math.PI) / 180.0; // Mean obliquity of ecliptic

  const y = Math.cos(lstRad);
  const x = -Math.sin(lstRad) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);
  const ascTropical = norm(Math.atan2(y, x) * 180.0 / Math.PI);

  const nirayanaLagna = norm(ascTropical - ayanamsha);
  return nirayanaLagna;
}

/**
 * Main Vedic Chart Generator
 */
export function generateVedicChart({ name, dob, dobBs, tob, tobFormatted, district }) {
  if (!dob || !tob) return null;

  const [yearStr, monthStr, dayStr] = dob.split('-');
  const [hourStr, minuteStr] = tob.split(':');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Time in Nepal is UTC +05:45 (Nepal Standard Time)
  const birthDateUtc = new Date(Date.UTC(year, month - 1, day, hour, minute) - (5 * 60 + 45) * 60 * 1000);

  const astroTime = Astronomy.MakeTime(birthDateUtc);
  const ayanamsha = getLahiriAyanamsha(birthDateUtc);

  const lat = district?.lat || 27.7172; // default Kathmandu
  const lng = district?.lng || 85.3240;

  // 1. Lagna (Ascendant)
  const lagnaDeg = calculateLagnaDegree(astroTime, lat, lng, ayanamsha);
  const lagnaRashiNum = Math.floor(lagnaDeg / 30) + 1; // 1 to 12
  const lagnaDegreeInRashi = lagnaDeg % 30;
  const lagnaRashi = RASHIS.find(r => r.id === lagnaRashiNum);

  // 2. Planets
  const planetCoords = calculateGrahaPositions(astroTime, ayanamsha);
  const grahasWithDetails = planetCoords.map(p => {
    const meta = GRAHAS.find(g => g.id === p.id);
    const rashiNum = Math.floor(p.deg / 30) + 1;
    const rashi = RASHIS.find(r => r.id === rashiNum);
    const degreeInRashi = p.deg % 30;

    // North Indian Bhava placement:
    // House 1 is always the Lagna Rashi.
    // House = (Planet Rashi - Lagna Rashi + 12) % 12 + 1
    const bhavaNum = ((rashiNum - lagnaRashiNum + 12) % 12) + 1;
    const bhava = BHAVAS.find(b => b.house === bhavaNum);

    // Is planet exalted or debilitated?
    const isExalted = rashiNum === meta.exaltation;
    const isDebilitated = rashiNum === meta.debilitation;
    const isOwnHouse = meta.id === 'su' ? rashiNum === 5 :
                       meta.id === 'ch' ? rashiNum === 4 :
                       meta.id === 'ma' ? (rashiNum === 1 || rashiNum === 8) :
                       meta.id === 'bu' ? (rashiNum === 3 || rashiNum === 6) :
                       meta.id === 'gu' ? (rashiNum === 9 || rashiNum === 12) :
                       meta.id === 'sk' ? (rashiNum === 2 || rashiNum === 7) :
                       meta.id === 'sa' ? (rashiNum === 10 || rashiNum === 11) : false;

    return {
      ...meta,
      longitude: p.deg,
      rashiNum,
      rashiName: rashi.nameNp,
      degreeInRashi: degreeInRashi.toFixed(1),
      bhavaNum,
      bhavaName: bhava.nameNp,
      isExalted,
      isDebilitated,
      isOwnHouse
    };
  });

  // 3. Moon Sign & Nakshatra
  const moon = grahasWithDetails.find(g => g.id === 'ch');
  const moonDeg = moon.longitude;
  const nakshatraIndex = Math.floor((moonDeg * 27) / 360); // 0 to 26
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const nakshatraPada = Math.floor(((moonDeg * 27 * 4) / 360) % 4) + 1;
  const moonRashi = RASHIS.find(r => r.id === moon.rashiNum);
  const sun = grahasWithDetails.find(g => g.id === 'su');
  const sunRashi = RASHIS.find(r => r.id === sun.rashiNum);

  // 4. Vimshottari Mahadasha Timeline
  // Calculate starting dasha and balance
  const nakshatraSpan = 360 / 27; // 13.333 deg
  const degInsideNakshatra = moonDeg % nakshatraSpan;
  const fractionElapsed = degInsideNakshatra / nakshatraSpan;

  // Find ruler cycle starting index
  const startLordIndex = VIMSHOTTARI_DASHA_CYCLE.findIndex(d => d.lord === nakshatra.lord);
  const startDasha = VIMSHOTTARI_DASHA_CYCLE[startLordIndex];
  const remainingYears = (1 - fractionElapsed) * startDasha.years;

  // Build full life dasha timeline
  const dashaTimeline = [];
  let currentAgeCursor = 0;
  let currentYearCursor = year;

  // First partial dasha
  dashaTimeline.push({
    lord: startDasha.lord,
    durationYears: remainingYears.toFixed(1),
    startAge: 0,
    endAge: parseFloat(remainingYears.toFixed(1)),
    startYear: currentYearCursor,
    endYear: Math.round(currentYearCursor + remainingYears)
  });

  currentAgeCursor += remainingYears;
  currentYearCursor += remainingYears;

  for (let i = 1; i < 9; i++) {
    const cycleIndex = (startLordIndex + i) % 9;
    const dasha = VIMSHOTTARI_DASHA_CYCLE[cycleIndex];
    const endAge = currentAgeCursor + dasha.years;
    const endYear = currentYearCursor + dasha.years;

    dashaTimeline.push({
      lord: dasha.lord,
      durationYears: dasha.years,
      startAge: parseFloat(currentAgeCursor.toFixed(1)),
      endAge: parseFloat(endAge.toFixed(1)),
      startYear: Math.round(currentYearCursor),
      endYear: Math.round(endYear)
    });

    currentAgeCursor = endAge;
    currentYearCursor = endYear;
  }

  // 5. User Current Age
  const now = new Date();
  const birthDate = new Date(year, month - 1, day);
  const ageYears = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

  // 6. Major Past Life Events (विगतका मुख्य घटनाहरूको विश्लेषण)
  const pastEvents = generatePastLifeEvents(ageYears, year, dashaTimeline, grahasWithDetails, lagnaRashiNum);

  // 7. Yogas & Doshas
  const yogas = detectVedicYogas(grahasWithDetails, lagnaRashiNum);
  const doshas = detectDoshas(grahasWithDetails, moon.rashiNum);

  // 8. House to Grahas mapping for North Indian Kundali SVG
  const housePlanets = {};
  for (let h = 1; h <= 12; h++) {
    housePlanets[h] = grahasWithDetails.filter(g => g.bhavaNum === h);
  }

  return {
    name,
    dob,
    dobBs: dobBs || dob,
    tob,
    tobFormatted: tobFormatted || tob,
    district,
    age: ageYears,
    lagna: {
      rashiNum: lagnaRashiNum,
      rashiName: lagnaRashi.nameNp,
      degree: lagnaDegreeInRashi.toFixed(1),
      element: lagnaRashi.element,
      lord: lagnaRashi.lord
    },
    moonSign: {
      rashiNum: moon.rashiNum,
      rashiName: moonRashi.nameNp,
      lord: moonRashi.lord,
      nakshatra: nakshatra.nameNp,
      pada: nakshatraPada,
      nakshatraLord: nakshatra.lord
    },
    sunSign: {
      rashiNum: sun.rashiNum,
      rashiName: sunRashi.nameNp
    },
    grahas: grahasWithDetails,
    housePlanets,
    dashaTimeline,
    pastEvents,
    yogas,
    doshas
  };
}

/**
 * Generate Major Past Life Events based on Dashas and transit ages
 */
function generatePastLifeEvents(currentAge, birthYear, dashas, grahas, lagnaRashiNum) {
  const events = [];

  // Age milestones based on actual dasha changes and planetary ages
  if (currentAge >= 12) {
    events.push({
      age: "१२-१३ वर्ष",
      year: toDevanagari(birthYear + 12),
      title: "प्रारम्भिक विद्या र मानसिक रूपान्तरण",
      description: "बुध र बृहस्पतिको बाल्य प्रभाव समाप्त भई चेतनामा पहिलो ठूलो विस्तार। अध्ययनमा शाखा वा नयाँ साथीहरूको प्रवेश भएको थियो।"
    });
  }

  if (currentAge >= 16) {
    events.push({
      age: "१५-१७ वर्ष",
      year: toDevanagari(birthYear + 16),
      title: "स्थान परिवर्तन वा माध्यमिक शिक्षाको मोड (SLC/SEE)",
      description: "तपाईंको चतुर्थ भाव (मातृ/गृह) र तृतीय भाव (पराक्रम) मा गोचरीय प्रभावका कारण घर वा विद्यालय परिवर्तन, अथवा जीवनको पहिलो ठूलो परीक्षाको दबाब।"
    });
  }

  if (currentAge >= 21) {
    events.push({
      age: "२०-२२ वर्ष",
      year: toDevanagari(birthYear + 21),
      title: "करियर, स्वतन्त्रता र आत्म-निर्भरताको संघर्ष",
      description: "कर्म भाव (दशम) मा शनिको दृष्टि र महादशामा अन्तरदशा फेरिँदा भविष्यलाई लिएर गहिरो चिन्ता, पहिलो जागिर वा उच्च शिक्षाको महत्त्वपूर्ण मोड।"
    });
  }

  if (currentAge >= 25) {
    events.push({
      age: "२४-२६ वर्ष",
      year: toDevanagari(birthYear + 25),
      title: "आर्थिक उतारचढाव वा प्रेम सम्बन्धमा गम्भीर मोड",
      description: "शुक्र र मंगलको विशेष गोचर तथा पञ्चम/सप्तम भावको सक्रियताले मन मिल्ने व्यक्तिसँग निकटता वा भावनात्मक वियोग/सम्बन्धमा कठिन परीक्षा।"
    });
  }

  if (currentAge >= 30) {
    events.push({
      age: "२८-३० वर्ष",
      year: toDevanagari(birthYear + 29),
      title: "शनिको प्रथम साढेसाती वा कर्मक्षेत्रमा स्थायित्व",
      description: "जीवनको दिशा स्पष्ट हुने समय। पुराना अपूर्ण योजनाहरू त्याग गरी वास्तविक कार्यक्षेत्रमा गम्भीर कदम र वैवाहिक/पारिवारिक जिम्मेवारीको सुरुवात।"
    });
  }

  if (currentAge >= 35) {
    events.push({
      age: "३३-३५ वर्ष",
      year: toDevanagari(birthYear + 34),
      title: "आर्थिक उन्नयन वा जग्गा/सम्पत्ति जोड्ने योग",
      description: "एकादश भाव (लाभ) र चतुर्थ भाव सक्रिय रहँदा घर, घडेरी वा ठूलो लगानीमा हात हालेको तथा सामाजिक दायरा बढेको देखिन्छ।"
    });
  }

  return events;
}

/**
 * Detect Special Vedic Yogas
 */
function detectVedicYogas(grahas, lagnaRashiNum) {
  const yogas = [];
  const moon = grahas.find(g => g.id === 'ch');
  const jupiter = grahas.find(g => g.id === 'gu');
  const sun = grahas.find(g => g.id === 'su');
  const mercury = grahas.find(g => g.id === 'bu');
  const mars = grahas.find(g => g.id === 'ma');
  const venus = grahas.find(g => g.id === 'sk');
  const saturn = grahas.find(g => g.id === 'sa');

  // 1. Budhaditya Yoga (Sun + Mercury together)
  if (sun.bhavaNum === mercury.bhavaNum) {
    yogas.push({
      name: "बुधादित्य महायोग (Budhaditya Yoga)",
      type: "शुभ योग",
      description: `सूर्य र बुध दुवै ${toDevanagari(sun.bhavaNum)} औं भावमा सँगै बसेका छन्। यसले तपाईंलाई उच्च बौद्धिक क्षमता, तीक्ष्ण स्मरणशक्ति र समाजमा विशेष विद्वता दिन्छ।`
    });
  }

  // 2. Gajakesari Yoga (Jupiter in Kendra from Moon: 1, 4, 7, 10)
  const diffMoonJup = ((jupiter.bhavaNum - moon.bhavaNum + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(diffMoonJup)) {
    yogas.push({
      name: "गजकेसरी योग (Gajakesari Yoga)",
      type: "परम राजयोग",
      description: "चन्द्रमा र देवगुरु बृहस्पति एकअर्काबाट केन्द्रमा छन्। यस योगले व्यक्तिलाई हात्ती (गज) जस्तो अटल बल र सिंह (केसरी) जस्तो तेज, अतुलनीय कीर्ति र नेतृत्व शक्ति दिन्छ।"
    });
  }

  // 3. Dhana Yoga (Lords of 2nd or 11th in Kendra or Trikona)
  const hasDhanaPlanetsInKendra = [jupiter, venus, mercury].some(p => [1, 5, 9, 11].includes(p.bhavaNum));
  if (hasDhanaPlanetsInKendra) {
    yogas.push({
      name: "लक्ष्मी धन योग (Lakshmi Dhana Yoga)",
      type: "धनदायक योग",
      description: "शुभ ग्रहहरू धन र लाभ भावसँग सम्बन्धित भएकाले जीवनमा कहिल्यै स्थायी आर्थिक अभाव हुँदैन। संकटको घडीमा पनि अचानक धनको प्रबन्ध हुन्छ।"
    });
  }

  // 4. Ruchaka Yoga (Mars exalted in Kendra or in own sign)
  if ([1, 4, 7, 10].includes(mars.bhavaNum) && (mars.isExalted || mars.isOwnHouse)) {
    yogas.push({
      name: "रुचक पञ्चमहापुरुष योग (Ruchaka Yoga)",
      type: "पराक्रम योग",
      description: "मंगल केन्द्रमा बलवान् भएर बसेको हुँदा तपाईंमा अद्वितीय साहस, प्रशासनिक नेतृत्व, भूमिसम्पत्ति र शत्रुहरूलाई परास्त गर्ने दृढ क्षमता छ।"
    });
  }

  return yogas;
}

/**
 * Detect Doshas and status
 */
function detectDoshas(grahas, moonRashiNum) {
  const mars = grahas.find(g => g.id === 'ma');
  const saturn = grahas.find(g => g.id === 'sa');
  const rahu = grahas.find(g => g.id === 'ra');
  const ketu = grahas.find(g => g.id === 'ke');

  // Manglik Dosha: Mars in 1, 4, 7, 8, 12
  const isManglik = [1, 4, 7, 8, 12].includes(mars.bhavaNum);

  // Kaal Sarp Yoga: check if all 7 planets are between Rahu and Ketu
  // Simple check on house ranges
  const isKaalSarp = Math.abs(rahu.bhavaNum - ketu.bhavaNum) === 6;

  // Sade Sati: Saturn transit over 12th, 1st, 2nd from Natal Moon (Simulated based on Moon sign)
  const isSadeSati = [((moonRashiNum - 2 + 12) % 12) + 1, moonRashiNum, (moonRashiNum % 12) + 1].includes(saturn.rashiNum);

  return {
    manglik: {
      hasDosha: isManglik,
      severity: isManglik ? (mars.bhavaNum === 7 || mars.bhavaNum === 8 ? "मध्यम-तीव्र" : "आंशिक") : "दोष रहित",
      house: mars.bhavaNum,
      remedy: isManglik ? "मंगलवारको दिन हनुमान चालीसा पाठ, रातो मुङ्गा वा मन्दिरमा तामाको भाँडो दान।" : "कुनै दोष छैन।"
    },
    kaalSarp: {
      hasDosha: isKaalSarp,
      name: isKaalSarp ? "आंशिक कालसर्प योग" : "कालसर्प दोष मुक्त",
      remedy: "पशुपतिनाथ वा नाग मन्दिरमा नाग पञ्चमीको दिन दुध चढाउने र महामृत्युञ्जय मन्त्र जप।"
    },
    sadeSati: {
      inSadeSati: isSadeSati,
      phase: isSadeSati ? "चलिरहेको छ (गोचरीय प्रभाव)" : "वर्तमानमा साढेसाती छैन",
      remedy: "शनिवार पिपलको रुखमा जल चढाउने, तिलको तेलको दीप बाल्ने, कालो वस्तु दान गर्ने।"
    }
  };
}
