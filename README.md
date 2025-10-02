# 🎯 Générateur de QR Codes Shopify

Ce projet génère automatiquement des QR codes quand une commande Shopify est payée.

## 🚀 Installation

1. Installez les dépendances :
```bash
npm install
```

2. Configurez vos variables d'environnement dans `.env.local` :
```env
SHOPIFY_SECRET=votre_secret_shopify
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

## 🔧 Configuration Shopify

1. Dans votre admin Shopify, allez dans **Paramètres > Notifications**
2. Créez un nouveau webhook avec :
   - **URL** : `https://votre-domaine.com/api/shopify/webhook`
   - **Événement** : `orders/paid`
   - **Format** : `JSON`

## 📱 Fonctionnalités

- ✅ Génération automatique de QR code pour les commandes payées
- ✅ Sauvegarde des QR codes dans `/public/qr-codes/`
- ✅ Interface web pour visualiser les QR codes générés
- ✅ Vérification de sécurité des webhooks Shopify

## 🎯 Contenu du QR Code

Le QR code contient :
- ID de la commande
- Email du client
- Nom du client
- Prix total
- Devise
- Timestamp

## 📁 Structure

```
├── api/shopify/webhook/route.ts  # Webhook principal
├── pages/api/qr-codes.ts         # API pour lister les QR codes
├── pages/index.tsx               # Interface de visualisation
├── public/qr-codes/               # Dossier des QR codes générés
└── .env.local                   # Variables d'environnement
```

## 🧪 Test

1. Créez une commande test dans Shopify
2. Marquez-la comme payée
3. Vérifiez que le QR code apparaît sur `/`

Maintenant, testons votre installation : 