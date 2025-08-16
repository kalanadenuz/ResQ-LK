const express = require('express');
const { USSDService } = require('../services/smsService');

const router = express.Router();

// USSD endpoint for Dialog/Mobitel gateway
router.post('/dialog', async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });
    
    // Handle USSD request
    const response = await USSDService.handleUSSDRequest(sessionId, serviceCode, phoneNumber, text);
    
    res.set('Content-Type', 'text/plain');
    res.send(response);
    
  } catch (error) {
    console.error('USSD handling error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END Sorry, there was an error. Please try again later.');
  }
});

// USSD endpoint for Mobitel gateway
router.post('/mobitel', async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    console.log('USSD Request (Mobitel):', { sessionId, serviceCode, phoneNumber, text });
    
    // Handle USSD request
    const response = await USSDService.handleUSSDRequest(sessionId, serviceCode, phoneNumber, text);
    
    res.set('Content-Type', 'text/plain');
    res.send(response);
    
  } catch (error) {
    console.error('USSD handling error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END Sorry, there was an error. Please try again later.');
  }
});

// Generic USSD endpoint
router.post('/', async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    console.log('USSD Request (Generic):', { sessionId, serviceCode, phoneNumber, text });
    
    // Handle USSD request
    const response = await USSDService.handleUSSDRequest(sessionId, serviceCode, phoneNumber, text);
    
    res.set('Content-Type', 'text/plain');
    res.send(response);
    
  } catch (error) {
    console.error('USSD handling error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END Sorry, there was an error. Please try again later.');
  }
});

// USSD session management
router.post('/session', async (req, res) => {
  try {
    const { sessionId, phoneNumber, action } = req.body;
    
    console.log('USSD Session:', { sessionId, phoneNumber, action });
    
    // Handle session management (start, end, timeout)
    if (action === 'start') {
      // Session started
      console.log(`USSD session started for ${phoneNumber}`);
    } else if (action === 'end') {
      // Session ended
      console.log(`USSD session ended for ${phoneNumber}`);
    } else if (action === 'timeout') {
      // Session timeout
      console.log(`USSD session timeout for ${phoneNumber}`);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('USSD session error:', error);
    res.status(500).json({ error: 'Session management failed' });
  }
});

// USSD callback for delivery reports
router.post('/callback', async (req, res) => {
  try {
    const { messageId, status, phoneNumber } = req.body;
    
    console.log('USSD Callback:', { messageId, status, phoneNumber });
    
    // Update SMS delivery status
    // This would typically update the sms_logs table
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('USSD callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// USSD configuration endpoint
router.get('/config', (req, res) => {
  res.json({
    serviceCode: '*123#',
    welcomeMessage: 'Welcome to ResQ-LK Emergency Response',
    options: [
      '1. Request Relief',
      '2. Volunteer Help', 
      '3. Emergency Status',
      '4. Contact Support'
    ],
    timeout: 30, // seconds
    maxRetries: 3
  });
});

module.exports = router;
