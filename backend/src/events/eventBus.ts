import { Response } from 'express';
import { logger } from '../utils/logger';

export interface ServerEvent {
  type: string;
  data: any;
  timestamp: string;
}

class EventBus {
  private clients: Set<Response> = new Set();

  public addClient(res: Response): void {
    this.clients.add(res);
    logger.debug(`[SSE] Client connected. Total clients: ${this.clients.size}`);
  }

  public removeClient(res: Response): void {
    this.clients.delete(res);
    logger.debug(`[SSE] Client disconnected. Total clients: ${this.clients.size}`);
  }

  public broadcast(type: string, data: any): void {
    const event: ServerEvent = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    const payload = `event: ${type}\ndata: ${JSON.stringify(event)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err: any) {
        logger.warn(`[SSE] Error writing to client: ${err.message}`);
        this.clients.delete(client);
      }
    }
  }
}

export const eventBus = new EventBus();
