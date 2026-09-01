const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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

function readDB() {
  try {
    if (!fs.existsSync(dbFile)) {
      writeDB(initialData);
      return initialData;
    }
    const content = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database file:", err);
    return initialData;
  }
}

function writeDB(data) {
  try {
    const tempFile = `${dbFile}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, dbFile);
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

module.exports = {
  readDB,
  writeDB
};
