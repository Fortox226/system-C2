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

// ===== Live tracking – markery aktualizowane =====
const liveMarkers = new Map(); // key = unit -> Leaflet marker

async function refreshLiveMarkers() {
  try {
    const positions = await window.api.getLivePositions(); // [{unit, lat, lon, acc, spd, ts}, ...]
    positions.forEach(p => {
      const key = p.unit;
      console.log(p.lat)
      console.log(p.lon)
      if (!liveMarkers.has(key)) {
        const m = L.marker([p.lat, p.lon], { title: key });
        m.addTo(map).bindPopup(
          `<b>${key}</b><br/>${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}<br/>${new Date(p.ts).toLocaleString()}`
        );
        liveMarkers.set(key, m);
      } else {
        const m = liveMarkers.get(key);
        m.setLatLng([p.lat, p.lon]);
        m.setPopupContent(
          `<b>${key}</b><br/>${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}<br/>${new Date(p.ts).toLocaleString()}`
        );
      }
    });
  } catch (e) {
    console.error('Błąd odświeżania pozycji live:', e);
  }
}

// Odświeżaj co 2 sekundy (możesz zmienić)
setInterval(refreshLiveMarkers, 2000);
refreshLiveMarkers();
// ===== /Live tracking =====

