# 🎯 Webhook Shopify Simple

Un webhook Shopify simple qui reçoit et affiche les données de commande.

## 🚀 Installation

1. Installez les dépendances :
```bash
npm install
```

2. Lancez le serveur de développement :
```bash
npm run dev
```

## 🔧 Configuration Shopify

1. Dans votre admin Shopify, allez dans **Paramètres > Notifications**
2. Créez un nouveau webhook avec :
   - **URL** : `https://votre-domaine.com/api/shopify/webhook`
   - **Événement** : `orders/paid`
   - **Format** : `JSON`

## 📁 Structure

```
├── api/shopify/webhook/route.ts  # Webhook principal
├── pages/api/qr-codes.ts         # API pour lister les QR codes
├── pages/index.tsx               # Interface de visualisation
├── public/qr-codes/               # Dossier des QR codes générés
└── .env.local                   # Variables d'environnement
```


## 🧪 Test

1. Configurez votre webhook Shopify
2. Faites une commande test
3. Vérifiez les logs dans votre terminal ou dashboard Vercel

## ✅ Fonctionnalités

- ✅ Reçoit les données de commande Shopify
- ✅ Affiche les données dans la console
- ✅ Retourne `{ success: true }` si tout va bien
- ✅ Gestion d'erreurs avec code 500