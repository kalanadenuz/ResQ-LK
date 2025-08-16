const twilio = require('twilio');
const db = require('../config/database');

// Initialize Twilio client (mock for development)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Mock SMS service for development
class SMSService {
  static async sendSMS(to, message) {
    try {
      // Log SMS to database
      await db.promise().query(
        'INSERT INTO sms_logs (phone, message, direction, status) VALUES (?, ?, ?, ?)',
        [to, message, 'outbound', 'sent']
      );

      // In development, just log the SMS
      if (!twilioClient) {
        console.log(`[SMS] To: ${to}, Message: ${message}`);
        return { success: true, messageId: `mock_${Date.now()}` };
      }

      // In production, send via Twilio
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });

      // Update SMS log with Twilio message ID
      await db.promise().query(
        'UPDATE sms_logs SET status = ? WHERE phone = ? AND message = ? ORDER BY created_at DESC LIMIT 1',
        ['delivered', to, message]
      );

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending error:', error);
      
      // Log failed SMS
      await db.promise().query(
        'INSERT INTO sms_logs (phone, message, direction, status) VALUES (?, ?, ?, ?)',
        [to, message, 'outbound', 'failed']
      );

      throw error;
    }
  }

  static async sendOTP(phone, otp) {
    const message = `Your ResQ-LK verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS(phone, message);
  }

  static async sendReliefConfirmation(phone, requestToken, location) {
    const message = `Your relief request has been confirmed. Token: ${requestToken}. Location: ${location}. Help is on the way.`;
    return this.sendSMS(phone, message);
  }

  static async sendVolunteerConfirmation(phone, status) {
    const message = status === 'accepted' 
      ? 'Your volunteer offer has been accepted. Please check the app for details.'
      : 'Your volunteer offer has been reviewed. Thank you for your willingness to help.';
    return this.sendSMS(phone, message);
  }

  static async sendEmergencyAlert(phone, emergencyType, location) {
    const message = `EMERGENCY ALERT: ${emergencyType} reported at ${location}. Please stay safe and follow official instructions.`;
    return this.sendSMS(phone, message);
  }
}

// USSD Service for feature phone users
class USSDService {
  static async handleUSSDRequest(sessionId, serviceCode, phoneNumber, text) {
    try {
      let response = '';
      
      if (text === '') {
        // Main menu
        response = `CON Welcome to ResQ-LK Emergency Response
1. Request Relief
2. Volunteer Help
3. Emergency Status
4. Contact Support`;
      } else if (text === '1') {
        // Relief request menu
        response = `CON Relief Request
Please provide your location:
(Enter full address)`;
      } else if (text === '1*') {
        // Location provided, ask for people count
        const location = text.split('*')[1];
        response = `CON People Count
How many people need help?
(Enter number)`;
      } else if (text.match(/^1\*.*\*$/)) {
        // People count provided, ask for needs
        const parts = text.split('*');
        const location = parts[1];
        const peopleCount = parts[2];
        response = `CON Emergency Needs
What do you need?
1. Food & Water
2. Medical Help
3. Shelter
4. Transportation
5. Other`;
      } else if (text.match(/^1\*.*\*.*$/)) {
        // Complete relief request
        const parts = text.split('*');
        const location = parts[1];
        const peopleCount = parts[2];
        const needs = parts[3];
        
        // Create relief request
        const requestToken = this.generateRequestToken();
        const needsMap = {
          '1': 'Food & Water',
          '2': 'Medical Help', 
          '3': 'Shelter',
          '4': 'Transportation',
          '5': 'Other'
        };
        
        const needsText = needsMap[needs] || 'Other';
        
        await db.promise().query(
          'INSERT INTO relief_requests (location, people_count, needs, request_token, urgency_level) VALUES (?, ?, ?, ?, ?)',
          [location, peopleCount, needsText, requestToken, 'high']
        );
        
        // Send confirmation SMS
        await SMSService.sendReliefConfirmation(phoneNumber, requestToken, location);
        
        response = `END Relief request submitted successfully!
Token: ${requestToken}
You will receive SMS confirmation.
Thank you for using ResQ-LK.`;
      } else if (text === '2') {
        // Volunteer menu
        response = `CON Volunteer Help
What skills do you have?
1. Medical
2. Rescue
3. Logistics
4. Communication
5. Other`;
      } else if (text.match(/^2\*$/)) {
        // Skills provided, ask for availability
        const skills = text.split('*')[1];
        response = `CON Availability
When are you available?
1. Immediately
2. Today
3. This week
4. On call`;
      } else if (text.match(/^2\*.*\*$/)) {
        // Complete volunteer offer
        const parts = text.split('*');
        const skills = parts[1];
        const availability = parts[2];
        
        const skillsMap = {
          '1': 'Medical',
          '2': 'Rescue',
          '3': 'Logistics',
          '4': 'Communication',
          '5': 'Other'
        };
        
        const availabilityMap = {
          '1': 'Immediately',
          '2': 'Today',
          '3': 'This week',
          '4': 'On call'
        };
        
        const skillsText = skillsMap[skills] || 'Other';
        const availabilityText = availabilityMap[availability] || 'On call';
        
        // Create volunteer offer
        await db.promise().query(
          'INSERT INTO volunteer_offers (skills, availability, location, status) VALUES (?, ?, ?, ?)',
          [skillsText, availabilityText, 'Location to be provided', 'pending']
        );
        
        response = `END Volunteer offer submitted!
Skills: ${skillsText}
Availability: ${availabilityText}
We will contact you soon.
Thank you for volunteering!`;
      } else if (text === '3') {
        // Emergency status
        response = `END Emergency Status
For real-time updates, please check our website or contact emergency services directly.
Stay safe!`;
      } else if (text === '4') {
        // Contact support
        response = `END Contact Support
Emergency: 119
ResQ-LK Support: +94 11 123 4567
Email: support@resq-lk.lk`;
      } else {
        response = `END Invalid option selected. Please try again.`;
      }
      
      return response;
    } catch (error) {
      console.error('USSD handling error:', error);
      return `END Sorry, there was an error. Please try again later.`;
    }
  }

  static generateRequestToken() {
    return 'REQ' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
}

module.exports = {
  SMSService,
  USSDService
};
