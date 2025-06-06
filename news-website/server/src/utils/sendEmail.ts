import nodemailer from 'nodemailer';
import logger from './logger';

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Validate required environment variables
const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'EMAIL_FROM_NAME',
  'EMAIL_FROM_ADDRESS'
];

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error(`Missing required email environment variables: ${missingVars.join(', ')}`);
  throw new Error(`Missing required email environment variables: ${missingVars.join(', ')}`);
}

// Create transporter with connection pooling
const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env['SMTP_HOST'],
  port: parseInt(process.env['SMTP_PORT'] || '587'),
  secure: process.env['SMTP_SECURE'] === 'true',
  auth: {
    user: process.env['SMTP_USERNAME'],
    pass: process.env['SMTP_PASSWORD'],
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function(error, _success) {
  if (error) {
    logger.error('SMTP Connection Error:', error);
    return;
  }
  logger.info('SMTP Server is ready to take our messages');
});

interface SendEmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResponse> => {
  try {
    // Input validation
    if (!options.to || !options.subject) {
      const errorMsg = 'Missing required email fields (to or subject)';
      logger.warn(errorMsg);
      return { success: false, message: errorMsg };
    }

    if (!options.text && !options.html) {
      const errorMsg = 'Either text or html content must be provided';
      logger.warn(errorMsg);
      return { success: false, message: errorMsg };
    }

    const mailOptions = {
      from: `"${process.env['EMAIL_FROM_NAME']}" <${process.env['EMAIL_FROM_ADDRESS']}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      // Add headers for better email deliverability
      headers: {
        'X-Laziness-level': '1000',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${options.to}`, {
      messageId: info.messageId,
      envelope: info.envelope
    });
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error sending email:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      to: options?.to,
      subject: options?.subject
    });
    
    return { 
      success: false, 
      message: `Failed to send email: ${errorMessage}`
    };
  }
};

export default sendEmail;
