import { Request, Response } from 'express';
import { sendEmail } from '../utils/sendEmail';

/**
 * @desc    Test email sending
 * @route   POST /api/v1/test/email
 * @access  Public
 */
export const testEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { to, subject, text, html } = req.body;

    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide to, subject, and either text or html content'
      });
    }

    // Send test email
    const result = await sendEmail({
      to,
      subject,
      text,
      html
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        to,
        subject,
        messageId: result.messageId
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
