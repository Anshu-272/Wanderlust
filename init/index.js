
// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("connect to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//     await mongoose.connect(MONGO_URL);
// };

// const initDB = async () => {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) => ({...obj, owner: "6903681c2ba0238ee1c1af17",
//       geometry: {
//       type: "Point",
//       coordinates: [11.2558, 43.7696] // You can use these dummy coordinates
//     }
//     }));
//     await Listing.insertMany(initData.data);
//     console.log("data was initialized");
// };

// initDB();

// --- Start copying from here ---

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const path = require("path");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// A delay function to be polite to the Nominatim (OpenStreetMap) API
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
  await initDB();
  console.log("Database was initialized!");
  await mongoose.connection.close();
}

const initDB = async () => {
    // 1. Delete all old listings
    await Listing.deleteMany({});
    console.log("Old listings deleted.");

    // 2. Loop through each listing in data.js
    for (let listingData of initData.data) {
        try {
            // --- This is the new part that uses Nominatim ---
            console.log(`Fetching coordinates for: ${listingData.title}`);
            
            // 3. Format the address for the API
            const query = `${listingData.location}, ${listingData.country}`;
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

            // 4. Call the API (fetch)
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'WanderlustApp/1.0 (abhishekh@example.com)' // API requires a user-agent
                }
            });
            const data = await response.json();
            
            if (data && data.length > 0) {
                // 5. Get the coordinates from the response
                const lon = parseFloat(data[0].lon);
                const lat = parseFloat(data[0].lat);

                // 6. Create the new listing object
                const newListing = new Listing({
                    ...listingData,
                    
                    // --- 7. Add the REAL Owner ID ---
                    //    REPLACE THIS ID WITH YOUR OWN
                    owner: "6903921a8ee7846690f82d95", 
                    
                    // --- 8. Add the correct geometry from Nominatim ---
                    geometry: {
                        type: "Point",
                        coordinates: [lon, lat] // [longitude, latitude]
                    },

                    // --- 9. Add the missing category ---
                    category: "Trending" 
                });

                // 10. Save the fully updated listing
                await newListing.save();
                console.log(`Saved: ${newListing.title}`);

            } else {
                console.log(`Could not find coordinates for: ${listingData.title}`);
            }

            // --- 11. Wait for 1 second before the next request ---
            await delay(1000); 

        } catch (err) {
            console.log(`Error processing listing "${listingData.title}":`, err.message);
        }
    }
};

// Run the main function
main().catch(err => console.log(err));