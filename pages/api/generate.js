// generate.js
// Main handler function
export default async function handler(req, res) {
    const { address } = req.query;
    const username = 'TWTEVQUXQX'; // Replace with your username
    const password = 'Free-84238'; // Replace with your password

    try {
        // Fetch building data
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
                res.status(200).json({ buildingData, propertyData, estateData});
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
