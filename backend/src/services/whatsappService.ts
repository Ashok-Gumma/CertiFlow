import { config } from '../config';
import { logger } from '../utils/logger';

export interface WhatsAppSendResult {
  success: boolean;
  messageId: string;
  error?: string;
  isTimeout?: boolean;
}

export class WhatsAppService {
  /**
   * Simulates sending a WhatsApp message with simulated network latency,
   * configurable failure probability, and timeouts.
   */
  public static async sendMessage(params: {
    phoneNumber: string;
    candidateName: string;
    certificateNumber: string;
    pdfDownloadUrl: string;
    verificationUrl: string;
  }): Promise<WhatsAppSendResult> {
    const { phoneNumber, candidateName, certificateNumber } = params;
    
    // Simulate network delay (100ms - 400ms)
    const delay = Math.floor(Math.random() * 300) + 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const messageId = `WA-MSG-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Check for simulated timeout
    const rand = Math.random();
    if (rand < config.whatsapp.timeoutRate) {
      logger.warn(`[WhatsApp Simulator] Gateway timeout sending certificate ${certificateNumber} to ${phoneNumber}`);
      return {
        success: false,
        messageId,
        error: 'GATEWAY_TIMEOUT: Delivery receipt timed out from WhatsApp Cloud API.',
        isTimeout: true,
      };
    }

    // Check for simulated provider failure
    if (rand < (config.whatsapp.timeoutRate + config.whatsapp.failureRate)) {
      const simulatedErrors = [
        'NETWORK_CARRIER_UNREACHABLE: Handset temporarily out of coverage area.',
        'RECIPIENT_OPTED_OUT: Recipient phone number has not consented to WhatsApp business notifications.',
        'RATE_LIMIT_EXCEEDED: Daily business messaging quota threshold exceeded for destination tier.',
        'INVALID_DESTINATION_NUMBER: WhatsApp user account not active on provided mobile number.',
      ];
      const error = simulatedErrors[Math.floor(Math.random() * simulatedErrors.length)];
      logger.warn(`[WhatsApp Simulator] Failed delivering certificate ${certificateNumber} to ${phoneNumber}: ${error}`);
      return {
        success: false,
        messageId,
        error,
      };
    }

    logger.info(`[WhatsApp Simulator] Successfully delivered certificate ${certificateNumber} to ${candidateName} (${phoneNumber})`);
    return {
      success: true,
      messageId,
    };
  }
}
