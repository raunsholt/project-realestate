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

function loadPolicy(policyType) {
  const filePath = path.join(process.cwd(), 'policies', `${policyType}.txt`);
  return fs.readFileSync(filePath, 'utf8');
}

/* export default async function (req, res) {
  const { question, policyType } = req.body; // get policyType from request

  if (!question) {
    return res.status(400).json({ error: { message: "Please provide a question." } });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
  }

  const policyContent = loadPolicy(policyType); // load the selected policy
  const messages = [
    {role: "system", content: "Du er en hjælpsom skadebehandler hos en forsikringsvirksomhed. Du svarer KUN på spørgsmål relateret til forsikring og policer."},
    {role: "user", content: `Med udgangspunkt i følgende police: "${policyContent}", besvar følgende spørgsmål: "${question}"`}
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",  // Update to GPT-4's identifier
        messages: messages,
        max_tokens: 500,  // Increase max tokens for longer answers
        temperature: 0.6
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error.message);
    }

    res.status(200).json({ result: data.choices[0].message.content.trim() });
  } catch(error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
} */
