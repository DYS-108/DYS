const fs = require('fs');
const path = require('path');

const os = require('os');

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const dataDir = isServerless ? path.join(os.tmpdir(), 'dys_data') : path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'database.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.warn("Data directory initialization notice:", err.message);
}

// Initial Database Structure
const initialData = {
  counters: {
    registration_seq: 1000,
    payment_seq: 0
  },
  registrations: [],
  payments: []
};

// In-memory fallback if disk is completely restricted
let memoryDB = { ...initialData };

function readDB() {
  try {
    if (!fs.existsSync(dbFile)) {
      return memoryDB;
    }
    const content = fs.readFileSync(dbFile, 'utf8');
    const parsed = JSON.parse(content);
    memoryDB = parsed;
    return parsed;
  } catch (err) {
    console.warn("Notice reading database file, using memory cache:", err.message);
    return memoryDB;
  }
}

function writeDB(data) {
  try {
    memoryDB = data;
    const tempFile = `${dbFile}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, dbFile);
  } catch (err) {
    console.warn("Notice writing database file (memory state preserved):", err.message);
  }
}

module.exports = {
  readDB,
  writeDB
};
