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

      // Send an initial message
      sendEvent({ message: 'Connection established' });

      // Setup heartbeat
      const heartbeatInterval = setInterval(() => {
          res.write(':heartbeat\n\n');
      }, 10000); // Send a heartbeat every 10 seconds

      // Keep the connection open
      req.on('close', () => {
          console.log('Connection closed by the client');
          clearInterval(heartbeatInterval); // Clear the heartbeat interval
          res.end();
      });

      // Note: Implement logic here to send real data to the client as needed
  } else {
      // Only allow GET requests for this endpoint
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
