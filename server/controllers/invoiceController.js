const invoiceService = require('../services/invoiceService');

const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'All';
    
    const result = await invoiceService.getAllInvoices(page, limit, search, status);
    res.status(200).json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const { subtotal, tax, discount, shipping, total, items } = req.body;
    
    if (subtotal < 0 || tax < 0 || discount < 0 || shipping < 0 || total < 0) {
      const error = new Error('Financial amounts cannot be negative');
      error.statusCode = 400;
      throw error;
    }
    
    if (items && items.some(i => i.quantity < 0 || i.rate < 0)) {
      const error = new Error('Item quantity and rate cannot be negative');
      error.statusCode = 400;
      throw error;
    }

    const insertId = await invoiceService.createInvoice(req.body);
    const newInvoice = await invoiceService.getInvoiceById(insertId);
    res.status(201).json({ success: true, data: newInvoice });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { subtotal, tax, discount, shipping, total, items } = req.body;
    
    if ((subtotal !== undefined && subtotal < 0) || 
        (tax !== undefined && tax < 0) || 
        (discount !== undefined && discount < 0) || 
        (shipping !== undefined && shipping < 0) || 
        (total !== undefined && total < 0)) {
      const error = new Error('Financial amounts cannot be negative');
      error.statusCode = 400;
      throw error;
    }
    
    if (items && items.some(i => i.quantity < 0 || i.rate < 0)) {
      const error = new Error('Item quantity and rate cannot be negative');
      error.statusCode = 400;
      throw error;
    }

    const updated = await invoiceService.updateInvoice(req.params.id, req.body);
    if (!updated) {
      const error = new Error('Invoice not found or no changes made');
      error.statusCode = 404;
      throw error;
    }
    const updatedInvoice = await invoiceService.getInvoiceById(req.params.id);
    res.status(200).json({ success: true, data: updatedInvoice });
  } catch (error) {
    next(error);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const deleted = await invoiceService.deleteInvoice(req.params.id);
    if (!deleted) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

const duplicateInvoice = async (req, res, next) => {
  try {
    const newId = await invoiceService.duplicateInvoice(req.params.id);
    const newInvoice = await invoiceService.getInvoiceById(newId);
    res.status(201).json({ success: true, data: newInvoice });
  } catch (error) {
    if (error.message === 'Invoice not found') {
      const err = new Error('Original invoice not found');
      err.statusCode = 404;
      return next(err);
    }
    next(error);
  }
};

const emailInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { toEmail, subject, message, base64Pdf } = req.body;

    if (!toEmail || !subject || !base64Pdf) {
      const error = new Error('Please provide email, subject, and PDF attachment');
      error.statusCode = 400;
      throw error;
    }

    const nodemailer = require('nodemailer');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      const error = new Error('SMTP is not configured in server/.env file.');
      error.statusCode = 400;
      throw error;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const pdfBuffer = Buffer.from(base64Pdf.split('base64,')[1] || base64Pdf, 'base64');

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: subject,
      text: message || `Please find attached Invoice ${subject.replace('Invoice ', '')}.`,
      attachments: [
        {
          filename: `${subject.replace(/ /g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Invoice emailed successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
  emailInvoice
};
