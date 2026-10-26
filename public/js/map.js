// // Initialize map with Carto Light style
// function initMap(listings, centerLat, centerLng) {
//   // Create map object
//   const map = L.map("map").setView([centerLat, centerLng], 12);

//   // Add Carto Light tiles (Airbnb-like design)
//   L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
//     subdomains: "abcd",
//     maxZoom: 19
//   }).addTo(map);

//   // Loop through all listings and add markers
//   listings.forEach(listing => {
//     if (listing.lat && listing.lng) {
//       L.marker([listing.lat, listing.lng])
//         .addTo(map)
//         .bindPopup(`<b>${listing.title}</b><br>${listing.location}`);
//     }
//   });
// }
