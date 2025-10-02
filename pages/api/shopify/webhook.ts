import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // Lire le JSON envoyé par Shopify
    const body = req.body;
    
    // Afficher le contenu du webhook dans la console
    console.log("📩 Webhook Shopify reçu :", body);
    
    // Retourner { success: true } en JSON si tout va bien
    res.status(200).json({ success: true });
    
  } catch (error) {
    // Afficher l'erreur dans la console
    console.error("❌ Erreur webhook :", error);
    
    // Retourner un code 500 avec un message d'erreur si ça plante
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
