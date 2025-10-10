import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "../../../lib/email";

// Configuration pour désactiver le parsing automatique du body
export const config = {
  api: {
    bodyParser: false,
  },
}

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
    // Lire le body brut pour la validation HMAC
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8');
    
    // Vérifier la signature HMAC pour la sécurité
    const shopifySignature = req.headers["x-shopify-hmac-sha256"] as string;
    const shopifyTopic = req.headers["x-shopify-topic"] as string;
    const shopifyShop = req.headers["x-shopify-shop-domain"] as string;
    
    console.log("🔐 Headers Shopify:", {
      signature: shopifySignature ? "Présent" : "Manquant",
      topic: shopifyTopic,
      shop: shopifyShop
    });

    // Vérifier la signature HMAC (OBLIGATOIRE pour la sécurité)
    if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
      console.error("❌ SHOPIFY_WEBHOOK_SECRET non configuré");
      return res.status(500).json({ error: "Configuration manquante" });
    }

    if (!shopifySignature) {
      console.error("❌ Signature HMAC manquante dans les headers");
      return res.status(401).json({ error: "Signature manquante" });
    }

    // Validation HMAC avec le body brut (comme Shopify le calcule)
    const hmac = crypto.createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET);
    hmac.update(rawBody, "utf8");
    const hash = hmac.digest("base64");
    
    if (hash !== shopifySignature) {
      console.error("❌ Signature HMAC invalide - Possible tentative d'intrusion");
      console.error("Hash calculé:", hash);
      console.error("Hash reçu:", shopifySignature);
      console.error("Secret configuré:", process.env.SHOPIFY_WEBHOOK_SECRET ? "Oui" : "Non");
      console.error("Body brut utilisé:", rawBody.substring(0, 100) + "...");
      return res.status(401).json({ error: "Signature invalide" });
    }
    
    console.log("✅ Signature HMAC valide - Webhook authentifié");

    // Parser le JSON maintenant que la validation est faite
    const body = JSON.parse(rawBody);
    
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

      // Envoyer l'email de confirmation au client uniquement
      try {
        console.log("📧 Envoi de l'email de confirmation...");
        const emailResult = await sendOrderConfirmationEmail(body);
        
        if (emailResult.success) {
          console.log("✅ Email de confirmation envoyé:", emailResult.emailId);
        } else {
          console.error("❌ Erreur envoi email client:", emailResult.error);
        }
      } catch (emailError) {
        console.error("❌ Erreur lors de l'envoi de l'email client:", emailError);
      }
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
