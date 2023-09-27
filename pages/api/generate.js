import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { address } = req.query;

  try {
      const addressResponse = await fetch(`https://api.dataforsyningen.dk/adresser?q=${address}`);
      const addressData = await addressResponse.json();

      if (addressData.length > 0) {
          const adresseid = addressData[0].id;

          const buildingResponse = await fetch(`https://api.dataforsyningen.dk/bbrlight/enheder?adresseid=${adresseid}`);
          const buildingData = await buildingResponse.json();

          if (buildingData.length > 0) {
              res.status(200).json(buildingData);
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