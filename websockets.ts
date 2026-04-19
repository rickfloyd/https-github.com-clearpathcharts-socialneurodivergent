import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wssInstance: WebSocketServer | null = null;

/**
 * WebSocket Server for Institutional Data Streams.
 * Handles real-time pushes for prices, news, and system alerts.
 */
export function setupWebSockets(server: Server) {
  const wss = new WebSocketServer({ server });
  wssInstance = wss;

  // console.log('Institutional WebSocket Server initialized.');

  wss.on('connection', (ws: WebSocket) => {
    // console.log('Client connected to Institutional Stream.');

    // Send initial welcome message
    ws.send(JSON.stringify({
      type: 'SYSTEM',
      message: 'Connected to ClearPath Institutional Data Stream v4.2.0',
      timestamp: Date.now()
    }));

    // Simulate real-time institutional news pushes
    const newsInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'NEWS_UPDATE',
          data: {
            title: 'Institutional Liquidity Shift Detected',
            source: 'ClearPath Engine',
            impact: 'High',
            timestamp: Date.now()
          }
        }));
      }
    }, 15000);

    // Simulate real-time price alerts or system heartbeats
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'HEARTBEAT',
          status: 'HEALTHY',
          latency: '0.8ms',
          timestamp: Date.now()
        }));
      }
    }, 5000);

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        console.log('Received from client:', parsed);
        
        // Echo back or handle specific client requests
        ws.send(JSON.stringify({
          type: 'ACK',
          received: parsed.type,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Failed to parse client message');
      }
    });

    ws.on('close', () => {
      // console.log('Client disconnected from Institutional Stream.');
      clearInterval(newsInterval);
      clearInterval(heartbeatInterval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket Error:', error);
    });
  });

  return wss;
}

export function broadcastToAll(data: any) {
  if (!wssInstance) return;
  const message = JSON.stringify(data);
  wssInstance.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
