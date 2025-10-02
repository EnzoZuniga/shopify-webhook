import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log de toutes les requêtes entrantes
  console.log("🔍 Requête reçue:", {
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  if (req.method !== "POST") {
    console.log("❌ Méthode non autorisée:", req.method);
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // Vérifier la signature HMAC pour la sécurité
    const shopifySignature = req.headers["x-shopify-hmac-sha256"] as string;
    const shopifyTopic = req.headers["x-shopify-topic"] as string;
    const shopifyShop = req.headers["x-shopify-shop-domain"] as string;
    
    console.log("🔐 Headers Shopify:", {
      signature: shopifySignature ? "Présent" : "Manquant",
      topic: shopifyTopic,
      shop: shopifyShop
    });

    // Vérifier la signature HMAC (optionnel mais recommandé)
    if (shopifySignature && process.env.SHOPIFY_WEBHOOK_SECRET) {
      const body = JSON.stringify(req.body);
      const hmac = crypto.createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET);
      hmac.update(body, "utf8");
      const hash = hmac.digest("base64");
      
      if (hash !== shopifySignature) {
        console.error("❌ Signature HMAC invalide");
        return res.status(401).json({ error: "Signature invalide" });
      }
      console.log("✅ Signature HMAC valide");
    }

    // Lire le JSON envoyé par Shopify
    const body = req.body;
    
    // Logs détaillés pour le debugging
    console.log("📩 Webhook Shopify reçu :", {
      topic: shopifyTopic,
      shop: shopifyShop,
      data: body,
      timestamp: new Date().toISOString()
    });
    
    // Traitement spécifique selon le type d'événement
    if (shopifyTopic === "orders/paid") {
      console.log("💰 Commande payée reçue:", {
        orderId: body.id,
        orderNumber: body.order_number,
        totalPrice: body.total_price,
        customerEmail: body.customer?.email,
        lineItems: body.line_items?.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }
    
    // Retourner { success: true } en JSON si tout va bien
    res.status(200).json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      topic: shopifyTopic 
    });
    
  } catch (error) {
    // Logs d'erreur détaillés
    console.error("❌ Erreur webhook :", {
      error: error,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Retourner un code 500 avec un message d'erreur si ça plante
    res.status(500).json({ 
      error: "Erreur interne du serveur",
      timestamp: new Date().toISOString()
    });
  }
}
