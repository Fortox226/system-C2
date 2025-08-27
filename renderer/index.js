const form = document.getElementById('meldunek-form');
const map = L.map('map').setView([50.98743894088497, 16.41671810638387], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

console.log("window.api:", window.api);


form.addEventListener('submit', (e) => {
  e.preventDefault();

  const meldunek = {
    jednostka: document.getElementById('jednostka').value,
    typ: document.getElementById('typ').value,
    lat: parseFloat(document.getElementById('lat').value),
    lon: parseFloat(document.getElementById('lon').value)
  };

  console.log('Meldunek do wysłania:', meldunek); // <- sprawdź w konsoli

  if (window.api && window.api.addMeldunek) {
    window.api.addMeldunek(meldunek);
    L.marker([meldunek.lat, meldunek.lon]).addTo(map)
      .bindPopup(`${meldunek.jednostka} - ${meldunek.typ}`);
  } else {
    console.error('window.api.addMeldunek is not available');
  }
});

async function zaladujTabele() {
  const meldunki = await window.api.getMeldunki();
  const tbody = document.getElementById('meldunki-tbody');
  tbody.innerHTML = ''; // wyczyść tabelę

  meldunki.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.jednostka}</td>
      <td>${m.typ}</td>
      <td>${m.lat}</td>
      <td>${m.lon}</td>
      <td>${new Date(m.data).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
  
}

// odśwież po dodaniu nowego meldunku
document.getElementById('wyslijBtn').addEventListener('click', () => {
  const meldunek = {
    jednostka: document.getElementById('jednostka').value,
    typ: document.getElementById('typ').value,
    meldunek: document.getElementById('meldunek').value,
    lat: document.getElementById('lat').value,
    lon: document.getElementById('lon'),
    data: new Date().toLocaleString()
  };
  window.api.addMeldunek(meldunek);
  setTimeout(zaladujTabele, 200); // małe opóźnienie żeby zapisało w DB
});

// załaduj przy starcie
zaladujTabele();

