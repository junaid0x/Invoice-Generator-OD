const customerService = require('../services/customerService');

const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    const result = await customerService.getAllCustomers(page, limit, search);
    res.status(200).json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { company_name, email } = req.body;
    if (!company_name) {
      const error = new Error('Company name is required');
      error.statusCode = 400;
      throw error;
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      throw error;
    }
    const insertId = await customerService.createCustomer(req.body);
    const newCustomer = await customerService.getCustomerById(insertId);
    res.status(201).json({ success: true, data: newCustomer });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { company_name, email } = req.body;
    if (!company_name) {
      const error = new Error('Company name is required');
      error.statusCode = 400;
      throw error;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      throw error;
    }
    const updated = await customerService.updateCustomer(req.params.id, req.body);
    if (!updated) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    const updatedCustomer = await customerService.getCustomerById(req.params.id);
    res.status(200).json({ success: true, data: updatedCustomer });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const deleted = await customerService.deleteCustomer(req.params.id);
    if (!deleted) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      const customError = new Error('Cannot delete customer because they have associated invoices.');
      customError.statusCode = 400;
      return next(customError);
    }
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
