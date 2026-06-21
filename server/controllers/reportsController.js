const reportsService = require('../services/reportsService');

const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Pass undefined if they are not provided, let service handle it
    const start = startDate || undefined;
    const end = endDate || undefined;
    
    const reportsData = await reportsService.getReportSummary(start, end);
    res.json(reportsData);
  } catch (error) {
    console.error('Error fetching reports summary:', error);
    res.status(500).json({ message: 'Error fetching reports summary' });
  }
};

const getRevenue = async (req, res) => {
  try {
    const revenueData = await reportsService.getRevenueBreakdown();
    res.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue breakdown:', error);
    res.status(500).json({ message: 'Error fetching revenue breakdown' });
  }
};

module.exports = {
  getReports,
  getRevenue
};
