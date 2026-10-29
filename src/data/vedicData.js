// Authentic Vedic Astrology (वैदिक ज्योतिष) Constants, Enums, and Definitions

export const RASHIS = [
  { id: 1, nameNp: "मेष", nameEn: "Aries", lord: "मंगल", element: "अग्नि", symbol: "भेँडा", nature: "चर", color: "#EF4444" },
  { id: 2, nameNp: "वृष", nameEn: "Taurus", lord: "शुक्र", element: "पृथ्वी", symbol: "साँढे", nature: "स्थिर", color: "#10B981" },
  { id: 3, nameNp: "मिथुन", nameEn: "Gemini", lord: "बुध", element: "वायु", symbol: "युगल", nature: "द्विस्वभाव", color: "#3B82F6" },
  { id: 4, nameNp: "कर्कट", nameEn: "Cancer", lord: "चन्द्र", element: "जल", symbol: "गँगटो", nature: "चर", color: "#F8FAFC" },
  { id: 5, nameNp: "सिंह", nameEn: "Leo", lord: "सूर्य", element: "अग्नि", symbol: "सिंह", nature: "स्थिर", color: "#F59E0B" },
  { id: 6, nameNp: "कन्या", nameEn: "Virgo", lord: "बुध", element: "पृथ्वी", symbol: "कुमारी", nature: "द्विस्वभाव", color: "#14B8A6" },
  { id: 7, nameNp: "तुला", nameEn: "Libra", lord: "शुक्र", element: "वायु", symbol: "तराजु", nature: "चर", color: "#EC4899" },
  { id: 8, nameNp: "वृश्चिक", nameEn: "Scorpio", lord: "मंगल", element: "जल", symbol: "बिच्छी", nature: "स्थिर", color: "#DC2626" },
  { id: 9, nameNp: "धनु", nameEn: "Sagittarius", lord: "गुरु", element: "अग्नि", symbol: "धनुर्धारी", nature: "द्विस्वभाव", color: "#FBBF24" },
  { id: 10, nameNp: "मकर", nameEn: "Capricorn", lord: "शनि", element: "पृथ्वी", symbol: "मगरमच्छ", nature: "चर", color: "#64748B" },
  { id: 11, nameNp: "कुम्भ", nameEn: "Aquarius", lord: "शनि", element: "वायु", symbol: "घैटो", nature: "स्थिर", color: "#6366F1" },
  { id: 12, nameNp: "मीन", nameEn: "Pisces", lord: "गुरु", element: "जल", symbol: "माछा", nature: "द्विस्वभाव", color: "#A855F7" }
];

export const GRAHAS = [
  { id: "su", nameNp: "सूर्य", nameEn: "Sun", short: "सू", nature: "क्रूर", exaltation: 1, debilitation: 7, color: "#F59E0B", gem: "माणिक्य (Ruby)" },
  { id: "ch", nameNp: "चन्द्र", nameEn: "Moon", short: "चं", nature: "सौम्य", exaltation: 2, debilitation: 8, color: "#E2E8F0", gem: "मोती (Pearl)" },
  { id: "ma", nameNp: "मंगल", nameEn: "Mars", short: "मं", nature: "क्रूर/पाप", exaltation: 10, debilitation: 4, color: "#EF4444", gem: "मूंगा (Red Coral)" },
  { id: "bu", nameNp: "बुध", nameEn: "Mercury", short: "बु", nature: "सौम्य", exaltation: 6, debilitation: 12, color: "#10B981", gem: "पन्ना (Emerald)" },
  { id: "gu", nameNp: "बृहस्पति (गुरु)", nameEn: "Jupiter", short: "बृ", nature: "परम शुभ", exaltation: 4, debilitation: 10, color: "#FBBF24", gem: "पुखराज (Yellow Sapphire)" },
  { id: "sk", nameNp: "शुक्र", nameEn: "Venus", short: "शु", nature: "शुभ", exaltation: 12, debilitation: 6, color: "#F472B6", gem: "हीरा (Diamond)" },
  { id: "sa", nameNp: "शनि", nameEn: "Saturn", short: "श", nature: "पाप/न्याय", exaltation: 7, debilitation: 1, color: "#64748B", gem: "नीलम (Blue Sapphire)" },
  { id: "ra", nameNp: "राहु", nameEn: "Rahu", short: "रा", nature: "छाया/पाप", exaltation: 2, debilitation: 8, color: "#9333EA", gem: "गोमेद (Hessonite)" },
  { id: "ke", nameNp: "केतु", nameEn: "Ketu", short: "के", nature: "छाया/मोक्ष", exaltation: 8, debilitation: 2, color: "#B45309", gem: "लहसुनिया (Cat's Eye)" }
];

export const BHAVAS = [
  { house: 1, nameNp: "तनु (प्रथम भाव / लग्न)", nameEn: "1st House (Ascendant)", significations: "शारीरिक गठन, रूप, तेज, स्वभाव, आत्मविश्वास, शिर, जीवनको सुरुवात" },
  { house: 2, nameNp: "धन (द्वितीय भाव)", nameEn: "2nd House (Wealth & Speech)", significations: "सञ्चित धन, परिवार, वाणी, भोजन, आँखा, प्रारम्भिक शिक्षा" },
  { house: 3, nameNp: "सहज (तृतीय भाव / पराक्रम)", nameEn: "3rd House (Siblings & Courage)", significations: "पराक्रम, भाइबहिनी, साहस, लेखन, सञ्चार, छोटो यात्रा, हात" },
  { house: 4, nameNp: "सुख (चतुर्थ भाव / मातृ)", nameEn: "4th House (Mother & Property)", significations: "माताको सुख, घर, जग्गाजमिन, वाहन, मानसिक शान्ति, छाती" },
  { house: 5, nameNp: "सुत (पञ्चम भाव / बुद्धि)", nameEn: "5th House (Children & Intellect)", significations: "सन्तान सुख, उच्च बुद्धि, विद्या, प्रेम सम्बन्ध, पूर्वजन्मको पुण्य, मन्त्र साधना" },
  { house: 6, nameNp: "रिपु (षष्ठ भाव / शत्रु)", nameEn: "6th House (Enemies & Health)", significations: "शत्रु, रोग, ऋण, मुद्दामामिला, प्रतिस्पर्धा, मामा, सेवा कर्म" },
  { house: 7, nameNp: "जाया (सप्तम भाव / विवाह)", nameEn: "7th House (Marriage & Partnership)", significations: "दाम्पत्य जीवन, जीवनसाथीको प्रकृति, व्यापारिक साझेदारी, कामवासना, दैनिक रोजगार" },
  { house: 8, nameNp: "रन्ध्र (अष्टम भाव / आयु)", nameEn: "8th House (Longevity & Transformation)", significations: "आयु, मृत्यु, दुर्घटना, अचानक धन लाभ, गुप्त विद्या, गूढ रहस्य, पैतृक सम्पत्ति" },
  { house: 9, nameNp: "धर्म (नवम भाव / भाग्य)", nameEn: "9th House (Fortune & Dharma)", significations: "भाग्य, धर्म, पिता, गुरु, उच्च ज्ञान, लामो तीर्थयात्रा, आध्यामिकता" },
  { house: 10, nameNp: "कर्म (दशम भाव / पेशा)", nameEn: "10th House (Career & Status)", significations: "पेशा, जागिर, व्यापार, सामाजिक प्रतिष्ठा, अधिकार, राज्य सम्मान, कर्मक्षेत्र" },
  { house: 11, nameNp: "आय (एकादश भाव / लाभ)", nameEn: "11th House (Gains & Friends)", significations: "आर्थिक लाभ, मनोकामना पूर्ति, ठूला दाजुभाइ, मित्र मण्डली, समाजमा प्रतिष्ठा" },
  { house: 12, nameNp: "व्यय (द्वादश भाव / मोक्ष)", nameEn: "12th House (Loss & Liberation)", significations: "खर्च, मोक्ष, विदेश यात्रा, वैदेशिक बसोबास, अस्पताल, जेल, शयन सुख" }
];

export const NAKSHATRAS = [
  { id: 1, nameNp: "अश्विनी", lord: "केतु", deity: "अश्विनी कुमार", symbol: "घोडाको शिर" },
  { id: 2, nameNp: "भरणी", lord: "शुक्र", deity: "यमराज", symbol: "योनि" },
  { id: 3, nameNp: "कृत्तिका", lord: "सूर्य", deity: "अग्नि", symbol: "चक्कु/आगो" },
  { id: 4, nameNp: "रोहिणी", lord: "चन्द्र", deity: "ब्रह्मा", symbol: "रथ" },
  { id: 5, nameNp: "मृगशिरा", lord: "मंगल", deity: "सोम/चन्द्र", symbol: "मृगको शिर" },
  { id: 6, nameNp: "आर्द्रा", lord: "राहु", deity: "रुद्र", symbol: "आँसुको थोपा" },
  { id: 7, nameNp: "पुनर्वसु", lord: "गुरु", deity: "अदिति", symbol: "धनुषको वाण" },
  { id: 8, nameNp: "पुष्य", lord: "शनि", deity: "बृहस्पति", symbol: "गाईको थुन/फूल" },
  { id: 9, nameNp: "आश्लेषा", lord: "बुध", deity: "सर्प", symbol: "कुण्डली मारेको सर्प" },
  { id: 10, nameNp: "मघा", lord: "केतु", deity: "पितृ", symbol: "राजसिंहासन" },
  { id: 11, nameNp: "पूर्वाफाल्गुनी", lord: "शुक्र", deity: "भग", symbol: "खाट/झुला" },
  { id: 12, nameNp: "उत्तराफाल्गुनी", lord: "सूर्य", deity: "अर्यमा", symbol: "बिस्तारा" },
  { id: 13, nameNp: "हस्त", lord: "चन्द्र", deity: "सूर्य/सवितृ", symbol: "हातको पञ्जा" },
  { id: 14, nameNp: "चित्रा", lord: "मंगल", deity: "विश्वकर्मा", symbol: "चम्किलो रत्न" },
  { id: 15, nameNp: "स्वाती", lord: "राहु", deity: "वायु", symbol: "कलिलो बिरुवा/मोती" },
  { id: 16, nameNp: "विशाखा", lord: "गुरु", deity: "इन्द्राग्नि", symbol: "तोरणद्वार" },
  { id: 17, nameNp: "अनुराधा", lord: "शनि", deity: "मित्र", symbol: "कमलको फूल" },
  { id: 18, nameNp: "ज्येष्ठा", lord: "बुध", deity: "इन्द्र", symbol: "गोलाकार कुण्डल/छाता" },
  { id: 19, nameNp: "मूल", lord: "केतु", deity: "निर्ऋति", symbol: "रुखको जरा" },
  { id: 20, nameNp: "पूर्वाषाढा", lord: "शुक्र", deity: "वरुण/जल", symbol: "सुपारीको पाङ्ग्रा" },
  { id: 21, nameNp: "उत्तराषाढा", lord: "सूर्य", deity: "विश्वेदेव", symbol: "हात्तीको दाँत" },
  { id: 22, nameNp: "श्रवण", lord: "चन्द्र", deity: "विष्णु", symbol: "कान/तीन पाइला" },
  { id: 23, nameNp: "धनिष्ठा", lord: "मंगल", deity: "अष्टवसु", symbol: "मृदंग/बाँसुरी" },
  { id: 24, nameNp: "शतभिषा", lord: "राहु", deity: "वरुण", symbol: "सयवटा तारा/गोलो वृत्त" },
  { id: 25, nameNp: "पूर्वाभाद्रपदा", lord: "गुरु", deity: "अजैकपाद", symbol: "तरबार/खाटका खुट्टा" },
  { id: 26, nameNp: "उत्तराभाद्रपदा", lord: "शनि", deity: "अहिर्बुध्न्य", symbol: "सागरमा तैरिरहेको सर्प" },
  { id: 27, nameNp: "रेवती", lord: "बुध", deity: "पूषा", symbol: "माछा/जोडी माछा" }
];

export const VIMSHOTTARI_DASHA_CYCLE = [
  { lord: "केतु", years: 7, startNakshatras: [1, 10, 19] },
  { lord: "शुक्र", years: 20, startNakshatras: [2, 11, 20] },
  { lord: "सूर्य", years: 6, startNakshatras: [3, 12, 21] },
  { lord: "चन्द्र", years: 10, startNakshatras: [4, 13, 22] },
  { lord: "मंगल", years: 7, startNakshatras: [5, 14, 23] },
  { lord: "राहु", years: 18, startNakshatras: [6, 15, 24] },
  { lord: "गुरु", years: 16, startNakshatras: [7, 16, 25] },
  { lord: "शनि", years: 19, startNakshatras: [8, 17, 26] },
  { lord: "बुध", years: 17, startNakshatras: [9, 18, 27] }
];

// Devanagari Number Formatter
export const toDevanagari = (num) => {
  if (num === null || num === undefined) return "";
  const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num).replace(/[0-9]/g, (w) => devanagariDigits[+w]);
};
