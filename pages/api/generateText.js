
export default async function (req, res) {
    const { address, dataField, textInput1, textInput2, textInput3 } = req.body;
  
    if (!address || !dataField || !textInput1 || !textInput2 || !textInput3) {
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
          model: 'gpt-4',
          messages: [
            { 'role': 'system', 'content': `Du er en hjælpsom assistent, der skriver boligsalgstekster.` },
            { 'role': 'user', 'content': `Vi har en ejendom beliggende på ${address}. Bygningsdata er som følger: ${dataField}.` },
            { 'role': 'user', 'content': `Her er tre gode grunde til at købe boligen: 1. ${textInput1} 2. ${textInput2} 3. ${textInput3}` },
            { 'role': 'user', 'content': `Skrivestilen skal være: INDSÆT HER. Et eksempel til inspiration (kun stil - IKKE indhold) kunne være følgende: INDSÆT HER` },
            { 'role': 'user', 'content': `Generér en salgstekst i den beskrevne skrivestil på ca. 1000 tegn. Benyt kun bygningsdata, der er relevante ift. købsgrundene.` }
          ],
          temperature: 0.7,
          max_tokens: 600
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
  }
  