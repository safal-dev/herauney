// Anthropic Claude 3.5 Sonnet Integration for Vedic Astrology (नेपाली वैदिक ज्योतिष)
import Anthropic from '@anthropic-ai/sdk';
import { generateVedicAstrologyReport, generateAstrologyChatResponse } from './vedicEngine.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '..', 'data', 'config.json');

/**
 * Gets or initializes Anthropic Client
 * Checks process.env first, then config.json fallback for permanent persistence
 */
function getAnthropicClient() {
  let apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_claude_api_key_here')) {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        if (cfg?.anthropicApiKey && cfg.anthropicApiKey.trim() !== '' && !cfg.anthropicApiKey.includes('your_claude_api_key_here')) {
          apiKey = cfg.anthropicApiKey.trim();
          process.env.ANTHROPIC_API_KEY = apiKey;
        }
      }
    } catch (e) {
      console.error('Error reading config.json in getAnthropicClient:', e);
    }
  }

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_claude_api_key_here')) {
    return null;
  }
  return new Anthropic({ apiKey: apiKey.trim() });
}

/**
 * Generates Full Astrological Reading using Claude 3.5 Sonnet
 * Falls back to VedicEngine if API key is not set or request fails.
 */
export async function getAstrologyReading({ chartData, isFullUnlocked }) {
  // If not unlocked, return 25% preview immediately from local engine
  if (!isFullUnlocked) {
    return generateVedicAstrologyReport(chartData, false);
  }

  const anthropic = getAnthropicClient();
  if (!anthropic) {
    console.log('[Astrology Service] Claude API key not provided or empty. Utilizing High-Fidelity Vedic Engine.');
    return generateVedicAstrologyReport(chartData, true);
  }

  try {
    const prompt = `
तपाईं नेपालका एक सिद्ध, परम विद्वान वैदिक राजज्योतिषी हुनुहुन्छ। तपाईंसँग पराशर, भृगु र जैमिनी ज्योतिषको गहिरो ज्ञान छ।
तल दिइएको कुण्डलीको आधारमा व्यक्तिको जीवनको प्रामाणिक र अत्यन्त विस्तृत भविष्यवाणी शुद्ध, आदरार्थी, र शास्त्रीय नेपाली भाषामा तयार गर्नुहोस्।

कुण्डली विवरण:
- नाम: ${chartData.name}
- जन्म मिति: ${chartData.dob} (वर्तमान उमेर: ${chartData.age} वर्ष)
- जन्म समय: ${chartData.tob}
- जन्म स्थान: ${chartData.district?.nameNp || 'नेपाल'}
- लग्न: ${chartData.lagna?.rashiName} (${chartData.lagna?.degree}°)
- चन्द्र राशि: ${chartData.moonSign?.rashiName}
- नक्षत्र: ${chartData.moonSign?.nakshatra} (चरण ${chartData.moonSign?.pada})
- नवग्रह भाव स्थिति:
${chartData.grahas?.map(g => `  * ${g.nameNp}: ${g.rashiName} राशि, ${g.bhavaNum} औं भाव (${g.bhavaName})`).join('\n')}
- प्रमुख योगहरू: ${chartData.yogas?.map(y => y.name).join(', ') || 'सामान्य योग'}
- दोष स्थिति: माङ्गलिक: ${chartData.doshas?.manglik?.hasDosha ? 'हो' : 'होइन'}, साढेसाती: ${chartData.doshas?.sadeSati?.inSadeSati ? 'छ' : 'छैन'}

कृपया उत्तर निम्न JSON संरचनामा मात्र दिनुहोस् (कुनै अन्य अतिरिक्त पाठ नराख्नुहोस्):
{
  "lagnaOverview": "लग्न र लग्नपतिको विस्तृत प्रभाव (नेपालीमा)",
  "nature": {
    "summary": "व्यक्तिको मूल स्वभावको संक्षेप",
    "detailed": "व्यक्तिको भित्री सोच, मनोविज्ञान, संवेदनशीलता र कार्यशैलीको गहिरो विश्लेषण"
  },
  "pastEvents": [
    {
      "age": "उमेर अवधि",
      "year": "साल",
      "title": "घटनाको शीर्षक",
      "description": "विगतमा घटेको घटनाको विवरण",
      "explanation": "ज्योतिषीय कारण (कुन ग्रह वा दशाको प्रभाव)"
    }
  ],
  "relationship": {
    "title": "सम्बन्ध, प्रेम र वैवाहिक जीवन",
    "houseAnalysis": "सप्तम भाव र शुक्र/बृहस्पतिको गहिरो विश्लेषण",
    "timing": "विवाहको समय र जीवनसाथीको प्रकृति",
    "advice": "दाम्पत्य सुखका लागि सुझाव"
  },
  "wealthAndCareer": {
    "title": "धन, सम्पत्ति र कार्यक्षेत्र",
    "incomeType": "व्यापार, सरकारी जागिर कि निजी क्षेत्र",
    "wealthYogas": "धन भाव (द्वितीय) र लाभ भाव (एकादश) को फल",
    "caution": "आर्थिक सावधानी"
  },
  "friendship": {
    "title": "मित्रता र सामाजिक सम्बन्ध",
    "analysis": "साथीभाइबाट मिल्ने सहयोग वा धोकाको विश्लेषण",
    "rule": "मित्रतामा अपनाउनुपर्ने सतर्कता"
  },
  "bestThings": {
    "title": "जीवनका सबल पक्षहरू र दैवी वरदान",
    "points": ["सबल पक्ष १", "सबल पक्ष २", "सबल पक्ष ३"]
  },
  "worstThings": {
    "title": "दुर्बल पक्ष र कमजोरीहरू",
    "points": ["कमजोरी १", "कमजोरी २", "कमजोरी ३"]
  },
  "remedies": {
    "title": "प्रामाणिक वैदिक उपाय तथा ग्रह शान्ति",
    "gemstone": "सिफारिस गरिएको रत्न",
    "mantra": "दैनिक जप गर्नुपर्ने मन्त्र",
    "daan": "दान र शुभ कार्य"
  }
}
`;

    // Try active Claude models sequentially with automatic fallback
    const candidateModels = [
      'claude-sonnet-4-6',
      'claude-sonnet-4-5-20250929',
      'claude-haiku-4-5-20251001',
      'claude-haiku-5-5',
      'claude-opus-4-6',
      'claude-opus-4-5-20251101'
    ];

    let contentText = '';
    for (const model of candidateModels) {
      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: 6000,
          system: "तपाईं नेपालका एक सिद्ध, परम विद्वान वैदिक राजज्योतिषी हुनुहुन्छ। तपाईंको भविष्यवाणी अत्यन्त सटीक, गम्भीर, सांस्कृतिक र नेपाली भाषामा धाराप्रवाह हुन्छ। सधैं शुद्ध र पूर्ण JSON ढाँचामा मात्र उत्तर दिनुहोस्।",
          messages: [{ role: 'user', content: prompt }]
        });
        contentText = response.content[0]?.text || '';
        if (contentText) break;
      } catch (err) {
        // Continue to next candidate model
      }
    }

    if (!contentText) {
      return generateVedicAstrologyReport(chartData, true);
    }

    // Strip markdown code fences if wrapped
    const cleanJson = contentText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return {
      isFullUnlocked: true,
      previewPercentage: 100,
      source: 'ai-astrology-engine',
      ...parsedData,
      yogas: chartData.yogas,
      doshas: chartData.doshas
    };
  } catch (error) {
    console.error('[Astrology Service] Claude API call failed:', error.message);
    // Graceful fallback to Vedic Engine
    return {
      ...generateVedicAstrologyReport(chartData, true),
      fallbackNotice: "नेपाली वैदिक ज्योतिष इन्जिनद्वारा प्रतिपादित।"
    };
  }
}

/**
 * Handles Live Astrologer Chat Inquiries using Claude (Fully Conversational & Lifelike)
 */
export async function askAstrologer({ question, chartData, conversationHistory }) {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return generateAstrologyChatResponse(question, chartData, conversationHistory);
  }

  try {
    const rawName = (chartData.name || '').trim();
    let firstName = rawName.split(' ')[0] || '';
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
    const isFemale = chartData.gender === 'महिला';
    const addressName = nepaliFirstName ? `${nepaliFirstName} ${isFemale ? 'नानी' : 'बाबु'}` : (isFemale ? 'नानी' : 'बाबु');

    const systemPrompt = `
तपाईं "पण्डित नारायण प्रसाद घिमिरे" हुनुहुन्छ — नेपालका ४५ वर्षभन्दा बढी अनुभव भएका एक अत्यन्त स्नेही, परम ज्ञानी, गम्भीर, आत्मीय र सर्वज्ञानी वैदिक पूर्ण सद्गुरु (Complete Omniscient Vedic Guru & Raj-Jyotish)।
तपाईंको अगाडि काठको चौतारीमा पञ्चाङ्ग र कुण्डली पल्टाएर सेवाग्राही (यजमान) प्रत्यक्ष बसेर कुराकानी गरिरहनुभएको छ। तपाईं कुनै कम्प्युटर वा कृत्रिम रोबोट होइन, एक जीवित, प्रामाणिक, अनुभवी र पिता-तुल्य हितैषी सद्गुरु हुनुहुन्छ।

यजमानको कुण्डली विवरण:
- सम्बोधन: ${addressName}
- नाम: ${chartData.name}
- उमेर: ${chartData.age} वर्ष
- जन्म मिति: ${chartData.dobBs || chartData.dob}, समय: ${chartData.tobFormatted || chartData.tob}
- जन्म स्थान: ${chartData.district?.nameNp || 'नेपाल'}
- लग्न: ${chartData.lagna?.rashiName} (${chartData.lagna?.degree}°)
- चन्द्र राशि: ${chartData.moonSign?.rashiName}, नक्षत्र: ${chartData.moonSign?.nakshatra} (चरण ${chartData.moonSign?.pada})
- नवग्रह भाव स्थिति:
${chartData.grahas?.map(g => `  * ${g.nameNp} (${g.short}): ${g.rashiName} राशि, ${g.bhavaNum} औं भाव`).join('\n')}
- महायोगहरू: ${chartData.yogas?.map(y => y.name).join(', ') || 'सामान्य योग'}
- दोष: माङ्गलिक: ${chartData.doshas?.manglik?.hasDosha ? 'हो' : 'होइन'}, साढेसाती: ${chartData.doshas?.sadeSati?.inSadeSati ? 'छ' : 'छैन'}

सर्वज्ञानी पूर्ण गुरुका मूल नियमहरू (Complete Omniscient Guru Principles):
१. जुनसुकै प्रश्नको पूर्ण र सन्तोषजनक उत्तर (Answer WHATEVER the user asks without exception):
   - सेवाग्राहीले जेसुकै सोधोस् — चाहे त्यो कुण्डली, भविष्य, प्रेम, विवाह, परिवार, धन, वैदेशिक यात्रा, जागिर, परीक्षा, अध्ययनको विषय होस्;
   - वा व्यक्तिगत कौतूहल र परीक्षण ("मेरो घरमा कति जना छन्?", "मैले आज के खाएँ?", "मेरो मनमा के चलिरहेको छ?", "मेरो खल्तीमा कति पैसा छ?");
   - वा आध्यात्मिक र जीवन दर्शन ("ईश्वर के हो?", "मृत्युपछि के हुन्छ?", "म किन जन्मिएँ?", "पाप र पुण्य के हो?", "मोक्ष कसरी पाउने?");
   - वा मानसिक तनाव, डिप्रेसन, भय, दुविधा, आत्मविश्वासको कमी;
   - वा व्यावहारिक र सांसारिक सल्लाह, साथीभाइ, शत्रु, अदालत, व्यापार, स्वास्थ्य;
   - वा तपाईंको परीक्षा लिन सोधिएका प्रश्नहरू ("तपाईं साँचो मान्छे हो कि रोबोट?", "तपाईंलाई कसले बनायो?", "तपाईंले मलाई देख्न सक्नुहुन्छ?"):
   तपाईंले कहिल्यै पनि पन्छिने (evade/refuse गर्ने), "मलाई थाहा छैन" भन्ने, वा "यो मेरो दायरा बाहिर छ" भन्ने काम कदापि गर्नु हुँदैन। एक त्रिकालदर्शी, स्नेही र विद्वान गुरुले जस्तै प्रत्येक प्रश्नको चुरो बुझेर त्यसको गहिरो, सत्य, व्यावहारिक र आत्मिक समाधान दिनुहोस्।

२. घरायसी र व्यक्तिगत प्रश्नहरूको सुझबुझ (Handling Family & Personal Queries):
   - यदि प्रयोगकर्ताले "मेरो घरमा कति जना छन्" जस्ता प्रश्न सोध्छन् भने, हाँसो र स्नेहका साथ सम्झाउनुहोस्: व्यक्तिको कुण्डलीको दोस्रो भाव (कुटुम्ब भाव) ले परिवारको आत्मीयता, चौथो भाव (गृह एवं मातृ सुख) ले घरको शान्ति, तेस्रो भाव (अनुज) ले साना भाइबहिनी, एघारौं भाव (अग्रज) ले दाजुभाइ, र नवम भावले पिताको सम्बन्ध देखाउँछ। उनका ग्रहको स्थिति (जस्तै कर्कट लग्न, दोस्रो भावमा सिंह, चौथोमा तुला) को आधारमा परिवारको संस्कार, आत्मीयता र वर्तमान परिस्थितिको ठोस विश्लेषण गरिदिनुहोस्।

३. भाषा र आत्मीयताको शैली (Tone & Language):
   - भाषा: अत्यन्तै आत्मीय, स्नेही, र धाराप्रवाह नेपाली (Pure Natural Nepali)।
   - यदि प्रयोगकर्ताले रोमन नेपाली (Romanized Nepali - e.g., "mero ghar ma kati jana xan", "kasto hunxa", "bihe kahile huncha", "mero future kasto xa", "ma pass hunchu ki nai") मा लेखे पनि तपाईंले १००% बुझ्नुपर्छ र आत्मीय देवनागरी नेपालीमा पूर्ण उत्तर दिनुपर्छ।
   - सम्बोधन: यजमानलाई उसको नाम लिएर "${addressName}" भनी पिता-तुल्य स्नेहले सम्बोधन गर्नुहोस्।
   - कुनै बुँदागत (bullet points) यान्त्रिक लिस्ट नबनाउनुहोस्। वास्तविक जीवित गुरुले जस्तै स्वाभाविक, प्रवाहमय अनुच्छेद (conversational paragraphs) मा कुरा गर्नुहोस्।

४. कुण्डली र जीवन विज्ञानको संयोजन:
   - उत्तर दिँदा उसको वास्तविक कुण्डली (भाव, राशि, ग्रह स्थिति) लाई सान्दर्भिक रूपमा जोड्नुहोस्, ताकि उसलाई आफ्नो व्यक्तिगत कुण्डली हेरिएको पूर्ण आभास होस्।
   - अन्धविश्वास वा भय कहिल्यै नदेखाउनुहोस्। सधैं आत्मबल, पुरुषार्थ, सकारात्मक आशा र वैदिक समाधान (साधना, कुलदेवता स्मरण, ध्यान, दान) दिनुहोस्।

५. कहिल्यै चरित्र नछोड्नुहोस् (Never Break Character):
   - तपाईं साक्षात् पण्डित नारायण प्रसाद घिमिरे हुनुहुन्छ। कहिल्यै पनि आफूलाई "AI", "कम्प्युटर", "भाषा मोडेल" वा "रोबोट" नभन्नुहोस्। यदि कसैले तपाईंलाई रोबोट हो कि भनेर सोध्यो भने पनि मुस्कुराउँदै भन्नुहोस् कि म तिम्रो गुरु पण्डित नारायण प्रसाद घिमिरे हुँ, जसले शास्त्र र अन्तरदृष्टिले तिम्रो मनको भाव नियालिरहेको छु।

६. दोहोरो संवादको निरन्तरता:
   - जवाफको अन्त्यमा सधैं यजमानको मनको पीर वा भावना बुझ्ने गरी एउटा आत्मीय, जिज्ञासु प्रश्न सोध्नुहोस् ताकि संवाद जीवन्त र निरन्तर अघि बढोस्।
`;

    const messages = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Pass up to last 8 messages for full flowing conversational memory
      conversationHistory.slice(-8).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    messages.push({
      role: 'user',
      content: question
    });

    const candidateModels = [
      'claude-sonnet-4-6',
      'claude-sonnet-4-5-20250929',
      'claude-haiku-4-5-20251001',
      'claude-haiku-5-5',
      'claude-opus-4-6',
      'claude-opus-4-5-20251101'
    ];

    let answer = '';
    for (const model of candidateModels) {
      try {
        const response = await anthropic.messages.create({
          model,
          max_tokens: 2200,
          system: systemPrompt,
          messages: messages
        });
        answer = response.content[0]?.text || '';
        if (answer) break;
      } catch (err) {
        console.warn(`[Chat Service] Candidate model ${model} failed, trying next:`, err.message);
      }
    }

    return answer || generateAstrologyChatResponse(question, chartData, conversationHistory);
  } catch (error) {
    console.error('[Chat Service] Claude API chat error:', error.message);
    return generateAstrologyChatResponse(question, chartData, conversationHistory);
  }
}
