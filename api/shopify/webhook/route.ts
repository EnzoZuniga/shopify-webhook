import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET || "";

export async function POST(req: Request) {
  try {
    // Vérification de sécurité Shopify (HMAC)
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    if (SHOPIFY_SECRET && hmacHeader) {
      const digest = crypto
        .createHmac("sha256", SHOPIFY_SECRET)
        .update(bodyText, "utf8")
        .digest("base64");

      if (digest !== hmacHeader) {
        console.log("❌ Webhook non vérifié - HMAC invalide");
        return NextResponse.json({ error: "Webhook non vérifié" }, { status: 401 });
      }
    }

    console.log("📩 Webhook reçu :", body);

    // Vérifier que c'est bien une commande payée
    if (body.financial_status !== "paid") {
      console.log("❌ Commande non payée, ignorée");
      return NextResponse.json({ message: "Commande non payée" });
    }

    // Récupérer les informations de la commande
    const orderId = body.id;
    const customerEmail = body.customer?.email;
    const customerName = `${body.customer?.first_name || ""} ${body.customer?.last_name || ""}`.trim();
    const totalPrice = body.total_price;
    const currency = body.currency;

    console.log(`✅ Commande payée reçue : ${orderId} pour ${customerEmail}`);

    // Créer le contenu du QR code
    const qrContent = {
      orderId: orderId,
      customerEmail: customerEmail,
      customerName: customerName,
      totalPrice: totalPrice,
      currency: currency,
      timestamp: new Date().toISOString()
    };

    // Générer le QR code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrContent), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Créer le dossier pour sauvegarder les QR codes
    const qrCodesDir = join(process.cwd(), "public", "qr-codes");
    await mkdir(qrCodesDir, { recursive: true });

    // Sauvegarder le QR code
    const qrCodePath = join(qrCodesDir, `order-${orderId}.png`);
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "");
    await writeFile(qrCodePath, base64Data, "base64");

    console.log(`🎯 QR code généré et sauvegardé : ${qrCodePath}`);

    // TODO: Ici vous pouvez ajouter l'envoi d'email avec le QR code
    // ou l'upload vers un service de stockage cloud

    return NextResponse.json({ 
      success: true, 
      message: "QR code généré avec succès",
      qrCodePath: `/qr-codes/order-${orderId}.png`,
      orderId: orderId
    });

  } catch (error) {
    console.error("❌ Erreur webhook :", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
