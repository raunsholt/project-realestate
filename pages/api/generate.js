import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

async function findPlaceByType(address, type) {
    // Function body commented out to bypass Google Maps API usage
    /*
    const addressResponse = await fetch(`https://api.dataforsyningen.dk/adresser?q=${address}`);
    const addressData = await addressResponse.json();

    if (addressData.length > 0) {
        const coordinates = addressData[0].adgangsadresse.adgangspunkt.koordinater;
        const lng = coordinates[0];
        const lat = coordinates[1];

        for (let radius = 500; radius <= 4000; radius += 500) {
            const placesResponse = await client.placesNearby({
                params: {
                    location: { lat, lng },
                    radius: radius,
                    type: type,
                    key: process.env.GOOGLE_MAPS_API_KEY,
                },
            });

            const places = placesResponse.data.results;
            if (places.length > 0) {
                return { name: places[0].name, radius: `mindre end ${radius} meter` };
            }
        }
    }

    return null; // Return null if no place found
    */
    return null;
}

// Main handler function
export default async function handler(req, res) {
    const { address } = req.query;

    try {
        // Fetch building data
        const addressResponse = await fetch(`https://api.dataforsyningen.dk/adresser?q=${address}`);
        const addressData = await addressResponse.json();

        if (addressData.length > 0) {
            const adresseid = addressData[0].id;
            const buildingResponse = await fetch(`https://api.dataforsyningen.dk/bbrlight/enheder?adresseid=${adresseid}`);
            const buildingData = await buildingResponse.json();

            /*
            // Code related to nearbyPlaces is commented out
            const placeTypes = [ ... ];
            const placeTypeMapping = { ... };
            let nearbyPlaces = {};

            for (const type of placeTypes) {
                const place = await findPlaceByType(address, type);
                if (place) {
                    const friendlyName = placeTypeMapping[type] || type; // Default to type if no mapping found
                    nearbyPlaces[friendlyName] = `${place.name} (${place.radius})`;
                }
            }
            */

            if (buildingData.length > 0) {
                // Modified to exclude nearbyPlaces from the response
                res.status(200).json({ buildingData /*, nearbyPlaces*/ });
            } else {
                res.status(404).json({ message: "No building data found for the specified address." });
            }
        } else {
            res.status(404).json({ message: "Address not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
