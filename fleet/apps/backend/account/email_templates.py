"""
Email templates for sending welcome emails and notifications
"""

def get_user_welcome_email_template(user_data):
    """Generate HTML welcome email for new users"""
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FleetIA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">Welcome to FleetIA!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">Hello <strong>{user_data.get('first_name', 'User')}</strong>,</p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">We're thrilled to have you join the <strong>{user_data.get('company_name', 'FleetIA')}</strong> team on our fleet management platform!</p>
                            
                            <!-- Credentials Box -->
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <h3 style="margin: 0 0 15px; font-size: 18px; color: #333333;">Your Login Credentials</h3>
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: 600; color: #666; width: 120px;">Email:</td>
                                        <td style="padding: 8px 0; color: #333; font-family: monospace; font-size: 14px;">{user_data.get('email')}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: 600; color: #666;">Password:</td>
                                        <td style="padding: 8px 0; color: #333; font-family: monospace; font-size: 14px;">{user_data.get('password')}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; color: #856404; font-weight: 600;">⚠️ Important: Please change your password after your first login</p>
                            </div>
                            
                            <p style="margin: 20px 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">You can access your account and update your profile at:</p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <a href="http://localhost:3001/auth/signin" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">If you have any questions, feel free to reach out to us.</p>
                            
                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">Best regards,<br><strong>The FleetIA Team</strong></p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #666666;">© 2025 FleetIA. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """


def get_company_welcome_email_template(company_data):
    """Generate HTML welcome email for new companies"""
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FleetIA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">Welcome to FleetIA!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">Hello <strong>{company_data.get('name')}</strong>,</p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">Congratulations! Your company has been successfully onboarded to FleetIA - your comprehensive fleet management solution.</p>
                            
                            <!-- Info Box -->
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <h3 style="margin: 0 0 15px; font-size: 18px; color: #333333;">Your Company Details</h3>
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: 600; color: #666; width: 150px;">Company:</td>
                                        <td style="padding: 8px 0; color: #333;">{company_data.get('name')}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: 600; color: #666;">Email:</td>
                                        <td style="padding: 8px 0; color: #333;">{company_data.get('email')}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: 600; color: #666;">Subscription:</td>
                                        <td style="padding: 8px 0; color: #333; text-transform: capitalize;">{company_data.get('subscription_plan')} Plan</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: 600; color: #666;">Status:</td>
                                        <td style="padding: 8px 0; color: #28a745; font-weight: 600;">Active ✓</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; color: #0c5460;"><strong>Next Steps:</strong></p>
                                <ul style="margin: 10px 0 0 20px; padding: 0; font-size: 14px; color: #0c5460;">
                                    <li style="margin: 5px 0;">Add your vehicles to the fleet</li>
                                    <li style="margin: 5px 0;">Invite team members to your account</li>
                                    <li style="margin: 5px 0;">Set up your company profile</li>
                                    <li style="margin: 5px 0;">Configure your preferences</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 20px 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">Your administrator can access the dashboard at:</p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <a href="http://localhost:3001/auth/signin" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Get Started</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">If you have any questions, our support team is here to help.</p>
                            
                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">Best regards,<br><strong>The FleetIA Team</strong></p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #666666;">© 2025 FleetIA. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """

