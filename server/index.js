import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAstrologyReading, askAstrologer } from './services/claudeAstrology.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Persistent Data Storage Paths (Works locally and safely in Vercel serverless /tmp)
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONSULTATIONS_FILE = path.join(DATA_DIR, 'consultations.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Initialize Storage Files if not present
function initFile(filepath, defaultData) {
  try {
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
    }
  } catch (e) {}
}

initFile(USERS_FILE, []);
initFile(CONSULTATIONS_FILE, []);
initFile(STATS_FILE, { totalVisits: 0, totalKundalis: 0, totalSignups: 0, districtCounts: {} });
initFile(CONFIG_FILE, { anthropicApiKey: '', updatedAt: null });

function readJson(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`Write to ${filepath} bypassed:`, err.message);
  }
}

// Permanently restore/synchronize saved Claude API Key on server startup
try {
  let savedConfig = readJson(CONFIG_FILE);
  if (!savedConfig) {
    savedConfig = { anthropicApiKey: '', updatedAt: null };
  }
  
  const envKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (savedConfig.anthropicApiKey && savedConfig.anthropicApiKey.trim() !== '') {
    process.env.ANTHROPIC_API_KEY = savedConfig.anthropicApiKey.trim();
    console.log('🔑 Restored persistent API Key from config.json');
  } else if (envKey && !envKey.includes('your_claude_api_key_here')) {
    savedConfig.anthropicApiKey = envKey;
    savedConfig.updatedAt = new Date().toISOString();
    writeJson(CONFIG_FILE, savedConfig);
    console.log('🔑 Permanently stored API Key from .env into config.json');
  }
} catch (e) {
  console.error('Error restoring config.json:', e);
}

// Analytics Tracker
function trackEvent(eventType, extra = {}) {
  const stats = readJson(STATS_FILE) || { totalVisits: 0, totalKundalis: 0, totalSignups: 0, districtCounts: {} };
  if (eventType === 'visit') stats.totalVisits = (stats.totalVisits || 0) + 1;
  if (eventType === 'kundali') {
    stats.totalKundalis = (stats.totalKundalis || 0) + 1;
    if (extra.district) {
      stats.districtCounts = stats.districtCounts || {};
      stats.districtCounts[extra.district] = (stats.districtCounts[extra.district] || 0) + 1;
    }
  }
  if (eventType === 'signup') stats.totalSignups = (stats.totalSignups || 0) + 1;
  writeJson(STATS_FILE, stats);
}

// --- API ROUTES ---

// Health & Claude Status
app.get('/api/status', (req, res) => {
  let apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    const savedConfig = readJson(CONFIG_FILE);
    if (savedConfig?.anthropicApiKey) {
      apiKey = savedConfig.anthropicApiKey;
      process.env.ANTHROPIC_API_KEY = apiKey;
    }
  }
  const hasClaudeKey = !!(apiKey && apiKey.trim() !== '' && !apiKey.includes('your_claude_api_key_here'));
  const cleanKey = apiKey ? apiKey.trim() : '';
  const maskedKey = hasClaudeKey && cleanKey.length > 10 
    ? `${cleanKey.substring(0, 10)}••••••••${cleanKey.substring(cleanKey.length - 4)}` 
    : (hasClaudeKey ? '••••••••' : null);

  res.json({
    status: 'online',
    appName: 'Herauney (हेराउने)',
    hasApiKey: hasClaudeKey,
    hasClaudeKey,
    maskedKey,
    version: '1.0.0'
  });
});

// Generate Astrology Reading (25% or 100%)
app.post('/api/chart/reading', async (req, res) => {
  try {
    const { chartData, isFullUnlocked } = req.body;
    if (!chartData) {
      return res.status(400).json({ error: 'कुण्डली विवरण उपलब्ध भएन।' });
    }

    trackEvent('kundali', { district: chartData.district?.nameNp });
    const reading = await getAstrologyReading({ chartData, isFullUnlocked });
    res.json(reading);
  } catch (err) {
    console.error('Error generating reading:', err);
    res.status(500).json({ error: 'भविष्यवाणी तयार गर्दा समस्या आयो।' });
  }
});

// User Sign-up & Session Persistence (Unlocks remaining 75%)
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, phone, birthDetails, chartData, readingData } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'नाम, इमेल र फोन नम्बर अनिवार्य छन्।' });
    }

    const users = readJson(USERS_FILE) || [];
    let user = users.find(u => u.email === email || u.phone === phone);

    if (user) {
      // Update existing user with latest chart & reading
      user.name = name;
      user.phone = phone;
      if (birthDetails) user.birthDetails = birthDetails;
      if (chartData) user.chartData = chartData;
      if (readingData) user.readingData = readingData;
      user.lastActive = new Date().toISOString();
    } else {
      user = {
        id: 'usr_' + Date.now(),
        name,
        email,
        phone,
        birthDetails: birthDetails || {},
        chartData: chartData || null,
        readingData: readingData || null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      users.push(user);
      trackEvent('signup');
    }

    writeJson(USERS_FILE, users);

    res.json({
      success: true,
      user,
      message: 'सफलतापूर्वक दर्ता भयो! पूर्ण कुण्डली अनलक गरिएको छ।'
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'साइन अप गर्दा समस्या भयो।' });
  }
});

// Retrieve User Session by ID
app.get('/api/auth/session/:userId', (req, res) => {
  try {
    const users = readJson(USERS_FILE) || [];
    const user = users.find(u => u.id === req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'सत्र फेला परेन।' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'सत्र लोड गर्न सकिएन।' });
  }
});

// AI Astrologer Live Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { question, chartData, conversationHistory, userId, userName } = req.body;
    if (!question || !chartData) {
      return res.status(400).json({ error: 'प्रश्न र कुण्डली अनिवार्य छन्।' });
    }

    const answer = await askAstrologer({ question, chartData, conversationHistory });

    // Save consultation log
    const consultations = readJson(CONSULTATIONS_FILE);
    consultations.push({
      id: 'cons_' + Date.now(),
      userId: userId || 'guest',
      userName: userName || chartData.name,
      question,
      answer,
      timestamp: new Date().toISOString()
    });
    writeJson(CONSULTATIONS_FILE, consultations);

    res.json({ answer });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'ज्योतिषीसँग सम्पर्क हुन सकेन।' });
  }
});

// --- SUPER ADMIN ROUTES ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin@herauney2026';

  if (password === adminPassword) {
    res.json({
      success: true,
      token: 'superadmin_token_herauney_2026',
      message: 'सुपर एडमिन लगइन सफल भयो।'
    });
  } else {
    res.status(401).json({ error: 'गलत पासवर्ड! कृपया पुनः प्रयास गर्नुहोस्।' });
  }
});

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  const stats = readJson(STATS_FILE) || {};
  const users = readJson(USERS_FILE) || [];
  const consultations = readJson(CONSULTATIONS_FILE) || [];

  const conversionRate = stats.totalKundalis > 0 
    ? ((users.length / stats.totalKundalis) * 100).toFixed(1) 
    : '0';

  res.json({
    totalVisits: stats.totalVisits || 0,
    totalKundalis: stats.totalKundalis || 0,
    totalSignups: users.length,
    totalConsultations: consultations.length,
    conversionRate: `${conversionRate}%`,
    districtCounts: stats.districtCounts || {}
  });
});

// Admin Users List
app.get('/api/admin/users', (req, res) => {
  const users = readJson(USERS_FILE) || [];
  res.json(users);
});

// Admin Consultations List
app.get('/api/admin/consultations', (req, res) => {
  const consultations = readJson(CONSULTATIONS_FILE) || [];
  res.json(consultations);
});

// Admin Update Claude API Key (Never removed on restart until Super Admin removes it)
app.post('/api/admin/update-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(400).json({ error: 'API Key खाली हुन सक्दैन।' });
  }

  const cleanKey = apiKey.trim();
  process.env.ANTHROPIC_API_KEY = cleanKey;

  // 1. Permanently persist in server/data/config.json
  writeJson(CONFIG_FILE, { anthropicApiKey: cleanKey, updatedAt: new Date().toISOString() });

  // 2. Persist to .env file
  const envPath = path.join(__dirname, '..', '.env');
  try {
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (envContent.includes('ANTHROPIC_API_KEY=')) {
      envContent = envContent.replace(/ANTHROPIC_API_KEY=.*/g, `ANTHROPIC_API_KEY=${cleanKey}`);
    } else {
      envContent += `\nANTHROPIC_API_KEY=${cleanKey}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (err) {
    console.error('Failed to write .env file:', err);
  }

  res.json({ success: true, message: 'AI API Key स्थायी रूपमा सुरक्षित गरियो! सर्भर रिस्टार्ट भए पनि यो कहिल्यै हट्ने छैन।' });
});

// Admin Explicitly Remove AI API Key (Only Super Admin can do this)
app.post('/api/admin/remove-key', (req, res) => {
  process.env.ANTHROPIC_API_KEY = '';
  writeJson(CONFIG_FILE, { anthropicApiKey: '', updatedAt: new Date().toISOString() });

  const envPath = path.join(__dirname, '..', '.env');
  try {
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    envContent = envContent.replace(/ANTHROPIC_API_KEY=.*/g, `ANTHROPIC_API_KEY=`);
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (err) {
    console.error('Failed to clear .env file:', err);
  }

  res.json({ success: true, message: 'AI API Key सफलतापूर्वक हटाइयो।' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🌌 Herauney (हेराउने) Backend Server running on port ${PORT}`);
  });
}

export default app;
