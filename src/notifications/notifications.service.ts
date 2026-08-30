import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly apiKey: string;
  private readonly clientId: string;
  private readonly senderId: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('ONFON_API_KEY');
    this.clientId = this.configService.get('ONFON_CLIENT_ID');
    this.senderId = this.configService.get('ONFON_SENDER_ID');
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://api.onfonmedia.co.ke/v1/sms/SendBulkSMS',
        {
          SenderId: this.senderId,
          IsUnicode: true,
          // Billing notices must remain in the customer's inbox. Flash SMS is
          // disruptive and disappears before a user can act on payment details.
          IsFlash: this.configService.get('ONFON_IS_FLASH') === 'true',
          MessageParameters: [
            {
              Number: phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.substring(1)}`,
              Text: message,
            },
          ],
          ApiKey: this.apiKey,
          ClientId: this.clientId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.status === 200;
    } catch (error) {
      console.error('SMS sending failed:', error.response?.data || error.message);
      return false;
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
