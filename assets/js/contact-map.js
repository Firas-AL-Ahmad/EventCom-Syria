document.addEventListener('DOMContentLoaded', function () {
    // Check if the map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container #map not found.');
        return;
    }

    // Damascus coordinates
    const damascusCoords = [33.5138, 36.2765];
    const map = L.map('map').setView(damascusCoords, 13);

    // Add a tile layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker for the office location
    const marker = L.marker(damascusCoords).addTo(map);

    // Add a popup to the marker
    const popupContent = `
        <b>EventCom Syria Office</b><br>
        Damascus, Syria
    `;
    marker.bindPopup(popupContent).openPopup();

    // Handle potential resize issues
    setTimeout(() => {
        map.invalidateSize();
    }, 400);
});
