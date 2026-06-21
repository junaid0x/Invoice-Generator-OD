exports.getHealthStatus = (req, res) => {
  res.status(200).json({
    message: "API running"
  });
};
