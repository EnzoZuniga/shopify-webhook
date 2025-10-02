import { NextApiRequest, NextApiResponse } from "next";
import { readdir, mkdir } from "fs/promises";
import { join } from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const qrCodesDir = join(process.cwd(), "public", "qr-codes");
    
    // Créer le dossier s'il n'existe pas
    try {
      await mkdir(qrCodesDir, { recursive: true });
    } catch (error) {
      // Le dossier existe déjà, pas de problème
    }
    
    const files = await readdir(qrCodesDir);
    
    const qrCodes = files
      .filter(file => file.endsWith('.png'))
      .map(file => `/qr-codes/${file}`);

    res.status(200).json({ qrCodes });
  } catch (error) {
    console.error("Erreur lors de la lecture des QR codes:", error);
    // Retourner une liste vide au lieu d'une erreur 500
    res.status(200).json({ qrCodes: [] });
  }
} 