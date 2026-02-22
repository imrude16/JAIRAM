/**
 * OTP VERIFICATION EMAIL TEMPLATE
 * 
 * Sent when user registers or requests OTP resend
 * 
 * @param {string} name - User's first name
 * @param {string} otp - 6-digit OTP
 * @returns {string} - HTML email content
 */
const otpTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - JAIRAM</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                    JAIRAM
                                </h1>
                                <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">
                                    Journal of Advanced & Integrated Research in Acute Medicine
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                                    Hello ${name}! 👋
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                    Thank you for registering with JAIRAM. To complete your registration, please verify your email address using the OTP below:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                        Your Verification Code
                                    </p>
                                    <h1 style="margin: 0; color: #667eea; font-size: 48px; font-weight: bold; letter-spacing: 8px;">
                                        ${otp}
                                    </h1>
                                </div>
                                
                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    <strong>⏰ This code will expire in 10 minutes.</strong>
                                </p>
                                
                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    If you didn't request this code, please ignore this email or contact our support team if you have concerns.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                    © 2024 JAIRAM. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    Published by: Nexus Biomedical Research Foundation Trust
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

/**
 * WELCOME EMAIL TEMPLATE
 * 
 * Sent after successful email verification
 * 
 * @param {string} name - User's first name
 * @returns {string} - HTML email content
 */
const welcomeTemplate = (name) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to JAIRAM</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                    🎉 Welcome to JAIRAM!
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                                    Hello ${name}!
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                    Your account has been successfully verified! We're excited to have you as part of the JAIRAM community.
                                </p>
                                
                                <div style="background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                    <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">
                                        What you can do now:
                                    </h3>
                                    <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                                        <li>Browse and read published research articles</li>
                                        <li>Submit your manuscript for review</li>
                                        <li>Track your submission status</li>
                                        <li>Collaborate with co-authors</li>
                                    </ul>
                                </div>
                                
                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    If you have any questions or need assistance, please don't hesitate to reach out to our support team.
                                </p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="#" style="display: inline-block; padding: 15px 40px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                                        Get Started
                                    </a>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                    © 2024 JAIRAM. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    Published by: Nexus Biomedical Research Foundation Trust
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

/**
 * PASSWORD RESET EMAIL TEMPLATE
 * 
 * Sent when user requests password reset
 * 
 * @param {string} name - User's first name
 * @param {string} resetLink - Password reset link
 * @returns {string} - HTML email content
 */
const passwordResetTemplate = (name, resetLink) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - JAIRAM</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                    Password Reset
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                                    Hello ${name},
                                </h2>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                    We received a request to reset your password. Click the button below to create a new password:
                                </p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${resetLink}" style="display: inline-block; padding: 15px 40px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                                        Reset Password
                                    </a>
                                </div>
                                
                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    <strong>⏰ This link will expire in 1 hour.</strong>
                                </p>
                                
                                <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                                </p>
                                
                                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; color: #856404; font-size: 13px;">
                                        <strong>Security Tip:</strong> Never share your password or reset link with anyone.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                    © 2024 JAIRAM. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export {
    otpTemplate,
    welcomeTemplate,
    passwordResetTemplate,
};