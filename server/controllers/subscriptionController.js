const subscriptionService = require('../services/subscriptionService');

const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions(req.isDemo);
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id, req.isDemo);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const { customer_id, service_type, purchase_date } = req.body;
    
    if (!customer_id || !service_type || !purchase_date) {
      return res.status(400).json({ message: 'Customer, Service Type, and Purchase Date are required' });
    }

    if (req.body.price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const id = await subscriptionService.createSubscription(req.body, req.isDemo);
    res.status(201).json({ id, message: 'Subscription created successfully' });
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const updated = await subscriptionService.updateSubscription(req.params.id, req.body, req.isDemo);
    if (!updated) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteSubscription = async (req, res, next) => {
  try {
    const deleted = await subscriptionService.deleteSubscription(req.params.id, req.isDemo);
    if (!deleted) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const renewSubscription = async (req, res, next) => {
  try {
    const { renewal_date, price } = req.body;
    if (!renewal_date) {
      return res.status(400).json({ message: 'Renewal Date is required' });
    }
    if (price < 0) {
      return res.status(400).json({ message: 'Renewal Price cannot be negative' });
    }

    await subscriptionService.renewSubscription(req.params.id, req.body, req.isDemo);
    res.json({ message: 'Subscription renewed successfully' });
  } catch (error) {
    next(error);
  }
};

const activateMaintenanceContract = async (req, res, next) => {
  try {
    const { contract_start, contract_end, price } = req.body;
    if (!contract_start || !contract_end) {
      return res.status(400).json({ message: 'Contract Start and End dates are required' });
    }
    if (new Date(contract_end) < new Date(contract_start)) {
      return res.status(400).json({ message: 'Contract End cannot be before Contract Start' });
    }
    if (price < 0) {
      return res.status(400).json({ message: 'Contract Price cannot be negative' });
    }

    await subscriptionService.activateMaintenanceContract(req.params.id, req.body, req.isDemo);
    res.json({ message: 'Maintenance Contract activated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  renewSubscription,
  activateMaintenanceContract
};
