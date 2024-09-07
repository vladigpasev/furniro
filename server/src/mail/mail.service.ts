import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure the transporter with SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // Use environment variables
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Your SMTP username
        pass: process.env.SMTP_PASS, // Your SMTP password
      },
    });
  }

  // Method to send emails
  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER, // Sender address
        to, // List of recipients
        subject, // Subject line
        text, // Plain text body
        html, // HTML body (optional)
      };

      // Send email
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
    }
  }
}
