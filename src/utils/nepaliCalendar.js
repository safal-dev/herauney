import * as nepaliDatePkg from 'nepali-date-converter';
import { toDevanagari } from '../data/vedicData';

const NepaliDateClass = nepaliDatePkg.default?.default || nepaliDatePkg.default || nepaliDatePkg;

export const NEPALI_MONTHS = [
  { id: 1, nameNp: "बैशाख", nameEn: "Baisakh", days: 31 },
  { id: 2, nameNp: "जेठ", nameEn: "Jestha", days: 32 },
  { id: 3, nameNp: "असार", nameEn: "Ashadh", days: 32 },
  { id: 4, nameNp: "साउन", nameEn: "Shrawan", days: 32 },
  { id: 5, nameNp: "भदौ", nameEn: "Bhadra", days: 31 },
  { id: 6, nameNp: "असोज", nameEn: "Ashwin", days: 31 },
  { id: 7, nameNp: "कात्तिक", nameEn: "Kartik", days: 30 },
  { id: 8, nameNp: "मंसिर", nameEn: "Mangsir", days: 30 },
  { id: 9, nameNp: "पुस", nameEn: "Poush", days: 30 },
  { id: 10, nameNp: "माघ", nameEn: "Magh", days: 30 },
  { id: 11, nameNp: "फागुन", nameEn: "Falgun", days: 30 },
  { id: 12, nameNp: "चैत", nameEn: "Chaitra", days: 31 }
];

/**
 * Generate range of BS years (e.g. 2000 to 2085)
 */
export function getBsYearList() {
  const years = [];
  for (let y = 2085; y >= 2000; y--) {
    years.push({
      value: y,
      labelNp: `${toDevanagari(y)} वि.सं.`
    });
  }
  return years;
}

/**
 * Convert BS (Year, Month 1-12, Day 1-32) to AD Date string 'YYYY-MM-DD'
 */
export function convertBsToAd(bsYear, bsMonth, bsDay) {
  try {
    const nd = new NepaliDateClass(parseInt(bsYear, 10), parseInt(bsMonth, 10) - 1, parseInt(bsDay, 10));
    const jsDate = nd.toJsDate();
    const yyyy = jsDate.getFullYear();
    const mm = String(jsDate.getMonth() + 1).padStart(2, '0');
    const dd = String(jsDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (err) {
    console.error('Error converting BS to AD:', err);
    // Fallback: approximate ~56 years 8 months difference
    const estYear = parseInt(bsYear, 10) - 57;
    return `${estYear}-05-15`;
  }
}

/**
 * Convert AD Date string 'YYYY-MM-DD' to BS Date object & formatted string
 */
export function convertAdToBs(adDateString) {
  try {
    const [y, m, d] = adDateString.split('-').map(Number);
    const jsDate = new Date(y, m - 1, d);
    const nd = new NepaliDateClass(jsDate);
    
    const bsYear = nd.getYear();
    const bsMonth = nd.getMonth() + 1;
    const bsDay = nd.getDate();
    const monthObj = NEPALI_MONTHS.find(m => m.id === bsMonth) || NEPALI_MONTHS[0];

    return {
      year: bsYear,
      month: bsMonth,
      day: bsDay,
      monthNameNp: monthObj.nameNp,
      formattedNp: `${toDevanagari(bsYear)} ${monthObj.nameNp} ${toDevanagari(bsDay)} गते (वि.सं.)`,
      formattedEn: `${bsYear} ${monthObj.nameEn} ${bsDay} BS`
    };
  } catch (err) {
    console.error('Error converting AD to BS:', err);
    return null;
  }
}
