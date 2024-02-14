// pages/api/updates.js

export default function handler(req, res) {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
  
      // Function to send a message to the client
      const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
  
      // Example: Send an initial message
      sendEvent({ message: 'Connection established' });
  
      // Keep the connection open
      req.on('close', () => {
        console.log('Connection closed');
        res.end();
      });
  
      // Here, you would have logic to periodically check for updates
      // and use sendEvent() to send them to the client.
    } else {
      // Only allow GET requests for this endpoint
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  