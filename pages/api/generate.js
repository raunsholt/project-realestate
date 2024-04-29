// // generate.js
// import 'dotenv/config';

// // Use environment variables for sensitive information
// // const username = process.env.API_USERNAME;
// // const password = process.env.API_PASSWORD;

// const username = "TWTEVQUXQX";
// const password = "Free-84238";

// export default async function handler(req, res) {
//     const { address } = req.query;

//     // Check if environment variables are set
//     if (!username || !password) {
//       return res.status(500).json({
//         error: "API credentials not configured properly."
//       });
//     }

//     const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

//     try {
//         // Fetch address data
//         const addressResponse = await fetch(`https://api.dataforsyningen.dk/adresser?q=${address}`);
//         const addressData = await addressResponse.json();

//         if (addressData.length === 0) {
//             return res.status(404).json({ error: 'Address not found.' });
//         }

//         const adresseid = addressData[0].id;

//         // Fetch building data
//         const buildingResponse = await fetch(`https://services.datafordeler.dk/BBR/BBRPublic/1/rest/enhed?Format=JSON&adresseIdentificerer=${adresseid}`, {
//             headers: { 'Authorization': authHeader }
//         });
//         const buildingData = await buildingResponse.json();

//         if (buildingData.length === 0) {
//             return res.status(404).json({ error: 'Building data not found.' });
//         }

//         const estateId = buildingData[0]["bygning"];

//         // Fetch estate data
//         const estateResponse = await fetch(`https://services.datafordeler.dk/BBR/BBRPublic/1/rest/bygning?Format=JSON&Id=${estateId}`, {
//             headers: { 'Authorization': authHeader }
//         });
//         const estateData = await estateResponse.json();

//         if (estateData.length === 0) {
//             return res.status(404).json({ error: 'Estate data not found.' });
//         }

//         const propertyId = estateData[0]["grund"];

//         // Fetch property data
//         const propertyResponse = await fetch(`https://services.datafordeler.dk/BBR/BBRPublic/1/rest/grund?Format=JSON&Id=${propertyId}`, {
//             headers: { 'Authorization': authHeader }
//         });
//         const propertyData = await propertyResponse.json();

//         if (propertyData.length === 0) {
//             return res.status(404).json({ error: 'Property data not found.' });
//         }

//         // Assuming you want to return some combined data to the client
//         res.status(200).json({
//             address: addressData[0],
//             building: buildingData[0],
//             estate: estateData[0],
//             property: propertyData[0]
//         });

//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// }


// ----

// generate.js
// Main handler function
export default async function handler(req, res) {
    const { address } = req.query;
    const username = 'TWTEVQUXQX'; // Replace with your username
    const password = 'Free-84238'; // Replace with your password

    try {
        // Fetch building data
        // console.log(address)
        const addressResponse = await fetch(`https://api.dataforsyningen.dk/adresser?q=${address}`);
        const addressData = await addressResponse.json();

        if (addressData.length > 0) {
            const adresseid = addressData[0].id;
            const buildingResponse = await fetch(`https://services.datafordeler.dk/BBR/BBRPublic/1/rest/enhed?username=TWTEVQUXQX&password=Free-84238&Format=JSON&adresseIdentificerer=${adresseid}`);
            const buildingData = await buildingResponse.json();

            const estateId = buildingData[0]["bygning"];
            const estateResponse = await fetch(`https://services.datafordeler.dk/BBR/BBRPublic/1/rest/bygning?username=TWTEVQUXQX&password=Free-84238&Format=JSON&Id=${estateId}`);
            const estateData = await estateResponse.json();

            const propertyId = estateData[0]["grund"];
            const propertyResponse = await fetch(`https://services.datafordeler.dk/BBR/BBRPublic/1/rest/bygning?username=TWTEVQUXQX&password=Free-84238&Format=JSON&Grund=${propertyId}`);
            const propertyData = await propertyResponse.json();

            if (buildingData.length > 0) {
                res.status(200).json({ buildingData, propertyData, estateData });
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
