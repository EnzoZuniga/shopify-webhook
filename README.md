# 🎯 Webhook Shopify - Debugging & Monitoring

Un webhook Shopify robuste avec logs détaillés et validation de sécurité pour recevoir les commandes.

## 🚀 Installation

1. Installez les dépendances :
```bash
npm install
```

2. Configurez les variables d'environnement :
```bash
cp env.example .env.local
# Éditez .env.local avec vos valeurs
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

## 🔧 Configuration Shopify

1. Dans votre admin Shopify, allez dans **Paramètres > Notifications**
2. Créez un nouveau webhook avec :
   - **URL** : `https://votre-domaine.vercel.app/api/shopify/webhook`
   - **Événement** : `orders/paid`
   - **Format** : `JSON`
   - **Secret** : (optionnel) Ajoutez un secret pour la sécurité

## 🔍 Debugging - Pourquoi vous ne recevez pas les webhooks

### 1. Vérifiez l'URL du webhook
- ✅ L'URL doit être accessible publiquement
- ✅ L'URL doit pointer vers `/api/shopify/webhook`
- ✅ Testez l'URL avec un navigateur (doit retourner "Méthode non autorisée")

### 2. Vérifiez les logs Vercel
```bash
# Dans Vercel Dashboard :
# 1. Allez dans votre projet
# 2. Cliquez sur "Functions"
# 3. Cliquez sur "View Function Logs"
# 4. Cherchez les logs avec 🔍, 📩, ou ❌
```

### 3. Testez localement
```bash
# Testez votre webhook localement
curl -X POST http://localhost:3000/api/shopify/webhook \
  -H "Content-Type: application/json" \
  -H "x-shopify-topic: orders/paid" \
  -H "x-shopify-shop-domain: test.myshopify.com" \
  -d '{"id": 123, "order_number": "1001"}'
```

### 4. Vérifiez la configuration Shopify
- ✅ L'événement est bien `orders/paid`
- ✅ Le format est bien `JSON`
- ✅ Le webhook est actif (pas en pause)
- ✅ Votre boutique a des commandes payées récentes

## 📊 Logs détaillés

Le webhook log maintenant :
- 🔍 Toutes les requêtes entrantes
- 🔐 Headers Shopify (signature, topic, shop)
- 📩 Données reçues avec timestamp
- 💰 Détails des commandes payées
- ❌ Erreurs détaillées avec stack trace

## 🛡️ Sécurité

- ✅ Validation HMAC (si `SHOPIFY_WEBHOOK_SECRET` configuré)
- ✅ Vérification des headers Shopify
- ✅ Gestion d'erreurs robuste

## 📁 Structure

```
├── pages/api/shopify/webhook.ts  # Webhook principal avec logs
├── pages/index.tsx               # Interface de test
├── env.example                   # Variables d'environnement
└── README.md                     # Ce fichier
```

## 🧪 Test

1. **Test local** : Utilisez le bouton "Tester le webhook" sur la page d'accueil
2. **Test Shopify** : Faites une commande test dans votre boutique
3. **Vérifiez les logs** : Dans Vercel Dashboard → Functions → Logs

## ✅ Fonctionnalités

- ✅ Reçoit les données de commande Shopify
- ✅ Logs détaillés pour le debugging
- ✅ Validation HMAC pour la sécurité
- ✅ Interface de test intégrée
- ✅ Gestion d'erreurs robuste
- ✅ Retourne `{ success: true }` si tout va bien