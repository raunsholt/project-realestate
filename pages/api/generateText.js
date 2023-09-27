let tasks = {};
let taskIdCounter = 0;

export default async function (req, res) {
    const taskId = taskIdCounter++;
    tasks[taskId] = {
        status: 'running',
        result: null,
    };

    // Send the task ID back to the client immediately
    res.status(202).json({ taskId });

    // Then continue processing the request
    const { address, dataField, textInput1, textInput2, textInput3 } = req.body;

    if (!address || !dataField || !textInput1 || !textInput2 || !textInput3) {
        tasks[taskId].status = 'error';
        tasks[taskId].result = 'Please provide all required fields.';
        return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        tasks[taskId].status = 'error';
        tasks[taskId].result = 'OpenAI API key not configured, please set the OPENAI_API_KEY environment variable.';
        return;
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

        tasks[taskId].status = 'completed';
        tasks[taskId].result = data.choices[0].message.content.trim();
    } catch (error) {
        tasks[taskId].status = 'error';
        tasks[taskId].result = error.message;
    }
}

// Add a new endpoint to get the status of a task
export async function getTaskStatus(req, res) {
    const taskId = req.query.taskId;
    console.log('Task ID:', taskId); // Add this line
    const task = tasks[taskId];
    console.log('Task:', task); 
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  }
