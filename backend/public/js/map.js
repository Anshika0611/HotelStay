if (!mapToken) {
  console.error("Mapbox token is not defined");
  throw new Error("Mapbox token is required");
}

if (!listing?.geography?.coordinates) {
  console.error("Listing coordinates are not defined");
  throw new Error("Listing coordinates are required");
}

if (!document.getElementById("map")) {
  console.error("Map container element not found");
  throw new Error("Map container element is required");
}

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: listing.geography.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
}); // console.log(coordinate);
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geography.coordinates)
  // this adds text as a popup on marker
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.title}</h4><p>Exact Location Will Be Provided After Booking</p>`
    )
  )
  .addTo(map);
