import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🧪 Test endpoint appelé:", {
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  res.status(200).json({ 
    success: true, 
    message: "Test endpoint fonctionne",
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
