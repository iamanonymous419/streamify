export const healthCheck = (_req, res) => {
  const health = getHealthStatus();
  res.status(200).json(health);
};

const getHealthStatus = () => {
  return {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};