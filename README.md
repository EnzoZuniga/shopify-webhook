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

## 🛡️ Sécurité (OBLIGATOIRE)

- ✅ **Validation HMAC OBLIGATOIRE** (webhook refuse les requêtes sans secret)
- ✅ **Vérification des headers Shopify**
- ✅ **Protection contre les intrusions** (logs détaillés des tentatives)
- ✅ **Gestion d'erreurs robuste**

### ⚠️ Configuration de sécurité requise :
```bash
# OBLIGATOIRE - Sans ce secret, le webhook ne fonctionne pas
SHOPIFY_WEBHOOK_SECRET=votre_secret_shopify
```

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

## 📧 Configuration Email

### 1. Créer un compte Resend
1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre domaine d'email
4. Obtenez votre clé API

### 2. Variables d'environnement
```bash
# Copiez env.example vers .env.local
cp env.example .env.local

# Configurez vos variables
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@votre-domaine.com
ADMIN_EMAIL=admin@votre-domaine.com
```

### 3. Types d'emails envoyés
- ✅ **Email de confirmation client** : Détails de la commande, articles, total
- ✅ **Notification admin** : Résumé de la nouvelle commande reçue

## ✅ Fonctionnalités

- ✅ Reçoit les données de commande Shopify
- ✅ Envoie des emails automatiques (client + admin)
- ✅ Templates d'email personnalisés et professionnels
- ✅ Logs détaillés pour le debugging
- ✅ Validation HMAC pour la sécurité
- ✅ Interface de test intégrée
- ✅ Gestion d'erreurs robuste
- ✅ Retourne `{ success: true }` si tout va bien