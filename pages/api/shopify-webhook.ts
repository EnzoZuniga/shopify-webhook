import type { NextApiRequest, NextApiResponse } from "next";
const crypto = require("crypto");

const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET || "";

module.exports = async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Méthode non autorisée");
  }

  const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;
  const body = JSON.stringify(req.body);

  const digest = crypto
    .createHmac("sha256", SHOPIFY_SECRET)
    .update(body, "utf8")
    .digest("base64");

  if (digest !== hmacHeader) {
    return res.status(401).send("Webhook non vérifié");
  }

  const order = req.body;
  console.log("Commande reçue :", order.id, order.customer?.email);

  res.status(200).send("Webhook reçu !");
};
