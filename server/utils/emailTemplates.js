const emailTemplates = {
  // Welcome/Verification Email
  verificationEmail: (userName, verificationUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #667eea;
          margin-bottom: 20px;
          font-size: 24px;
        }
        .content p {
          margin-bottom: 15px;
          color: #555;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          padding: 15px 35px;
          background: #667eea;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 25px 0;
          font-size: 16px;
        }
        .button:hover {
          background: #5568d3;
        }
        .link-box {
          background: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
          word-break: break-all;
          font-size: 14px;
        }
        .footer {
          background: #f8f9fa;
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #6b7280;
          font-size: 13px;
          margin: 5px 0;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🎓 Welcome to Medical Journal</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for registering with the International Medical Journal. We're excited to have you join our community of researchers and medical professionals.</p>
          
          <p>To complete your registration and ensure the security of your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <div class="link-box">
            <strong>Alternatively, copy and paste this link:</strong><br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </div>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
          </div>
          
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          
          <p style="margin-top: 30px;">
            <strong>Best regards,</strong><br>
            The Medical Journal Team
          </p>
        </div>
        <div class="footer">
          <p><strong>International Medical Journal</strong></p>
          <p>ISSN: 2950-5933</p>
          <p style="margin-top: 15px;">&copy; 2026 Medical Journal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Password Reset Email
  passwordResetEmail: (userName, resetUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Reset</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .button {
          display: inline-block;
          padding: 15px 35px;
          background: #f5576c;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 25px 0;
        }
        .alert {
          background: #fee2e2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2 style="color: #f5576c; margin-bottom: 20px;">Hello ${userName},</h2>
          <p>We received a request to reset your password for your Medical Journal account.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="alert">
            <strong>⚠️ Security Notice:</strong> This link will expire in 10 minutes. If you didn't request this password reset, please ignore this email or contact our support team.
          </div>
          
          <p>Link not working? Copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #f5576c; margin: 15px 0;">${resetUrl}</p>
          
          <p style="margin-top: 30px;"><strong>Best regards,</strong><br>Medical Journal Security Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Medical Journal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Article Submission Confirmation
  submissionConfirmation: (authorName, articleTitle, manuscriptId) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Submission Confirmed</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .content { padding: 40px 30px; }
        .info-box {
          background: #f0fdf4;
          border: 1px solid #86efac;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .footer {
          background: #f8f9fa;
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✅ Submission Received</h1>
        </div>
        <div class="content">
          <h2 style="color: #22c55e; margin-bottom: 20px;">Dear Dr. ${authorName},</h2>
          <p>Thank you for submitting your manuscript to the International Medical Journal.</p>
          
          <div class="info-box">
            <p><strong>Manuscript ID:</strong> ${manuscriptId}</p>
            <p style="margin-top: 10px;"><strong>Title:</strong> ${articleTitle}</p>
            <p style="margin-top: 10px;"><strong>Status:</strong> Under Review</p>
          </div>
          
          <p>Your manuscript is now being processed by our editorial team. Here's what happens next:</p>
          <ol style="padding-left: 20px; margin: 15px 0;">
            <li>Initial editorial screening (1-2 days)</li>
            <li>Peer review assignment (3-5 days)</li>
            <li>Peer review process (4-6 weeks)</li>
            <li>Editorial decision</li>
          </ol>
          
          <p>You can track your manuscript status at any time through your author dashboard.</p>
          
          <p style="margin-top: 30px;"><strong>Best regards,</strong><br>Editorial Office<br>International Medical Journal</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Medical Journal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = emailTemplates;
