const settingsService = require('../services/settingsService');

const getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updatedSettings = await settingsService.updateSettings(req.body);
    res.json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the URL path
    const logoUrl = `/uploads/${req.file.filename}`;
    res.json({ logo_url: logoUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Error uploading logo' });
  }
};

const testEmail = async (req, res, next) => {
  try {
    const mailService = require('../services/mailService');
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: req.user ? req.user.email : process.env.SMTP_USER, // Send to current admin or self
      subject: 'Test Email - Ocean Developers Invoice Suite',
      text: 'Congratulations! Your SMTP email configuration is working perfectly.',
      html: '<h3>Congratulations!</h3><p>Your SMTP email configuration is working perfectly.</p>'
    };

    await mailService.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully!'
    });
  } catch (error) {
    console.error('Test email failed:', error);
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadLogo,
  testEmail
};
