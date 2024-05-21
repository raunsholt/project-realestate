export default async function (req, res) {
  const { address, dataField, textInput1, textInput2, textInput3, textStyle, temperature } = req.body;

  if (!address || !dataField || !textStyle || !textInput1 || !textInput2 || !textInput3) {
    return res.status(400).json({ error: { message: "Please provide all required fields." } });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please set the OPENAI_API_KEY environment variable.",
      }
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `Du er en hjælpsom assistent, der skriver boligsalgstekster.` },
          { role: 'user', content: `Vi har en ejendom beliggende på ${address}. Bygningsdata er som følger: ${dataField}.` },
          { role: 'user', content: `Her er tre gode grunde til at købe boligen: 1. ${textInput1} 2. ${textInput2} 3. ${textInput3}` },
          { role: 'user', content: `Skrivestilen skal være ${textStyle}` },
          { role: 'user', content: `Generér tre variationer af en salgstekst i den beskrevne skrivestil. En til hjemmesider på ca. 800 tegn med én overskrift inkluderet. En til butiksvinduer på ca. 400 tegn. med én overskrift inkluderet. En til sociale medier på ca. 200 tegn uden overskrift eller hashtags. Brug tre bindestreger (---) til at adskille afsnittene. Benyt kun bygningsdata, der er relevante ift. købsgrundene.` }
        ],
        temperature: temperature,
        max_tokens: 600
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error.message);
    }

    res.status(200).json({ result: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
}
