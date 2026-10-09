export default function handler(req, res) {
  res.status(200).json({ status: "UP", message: "Health check OK", timestamp: new Date().toISOString() });
}
