const dashboardService = require('../services/dashboardService');

const getDashboardData = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Error in getDashboardData controller:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

module.exports = {
  getDashboardData
};
