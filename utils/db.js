const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Ścieżka do pliku bazy danych
const dbPath = path.join(__dirname, 'database.db');

// Sprawdź, czy katalog istnieje — jeśli nie, utwórz
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Połącz z bazą danych
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Błąd przy otwieraniu bazy danych:', err.message);
  } else {
    console.log('Połączono z bazą danych SQLite');
  }
});

// Tworzenie tabeli, jeśli nie istnieje
db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS meldunki (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          jednostka TEXT,
          typ TEXT,
          lat REAL,
          lon REAL,
          data TEXT
      );
  `);
});

// Funkcja do dodawania meldunku z automatyczną datą
function addMeldunek(meldunek) {
  const { jednostka, typ, lat, lon } = meldunek;
  const data = new Date().toISOString().replace('T', ' ').slice(0, 19); // format: YYYY-MM-DD HH:MM:SS

  db.run(
    'INSERT INTO meldunki (jednostka, typ, lat, lon, data) VALUES (?, ?, ?, ?, ?)',
    [jednostka, typ, lat, lon, data],
    function (err) {
      if (err) {
        return console.error('Błąd przy dodawaniu meldunku:', err.message);
      }
      console.log(`Dodano meldunek z ID ${this.lastID}`);
    }
  );
}

function getMeldunki(callback) {
  db.all('SELECT * FROM meldunki', [], (err, rows) => {
    if (err) {
      console.error(err);
      callback([]);
    } else {
      callback(rows);
    }
  });
}

module.exports = {
  addMeldunek, getMeldunki
};
