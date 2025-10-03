# 🎫 MR NJP Event's - Système de Tickets avec QR Codes

## 📋 Vue d'ensemble

Système complet de gestion de tickets avec QR codes uniques pour les événements MR NJP Event's. Chaque ticket génère un QR code individuel pour une validation sécurisée.

## ✨ Fonctionnalités

### 🎫 Gestion des tickets
- **Tickets individuels** avec QR codes uniques
- **Support multi-tickets** par commande
- **Statuts** : En attente, Validé, Utilisé, Expiré
- **Base de données SQLite** performante

### 📧 Emails automatiques
- **Génération automatique** lors des commandes Shopify
- **Templates professionnels** avec QR codes
- **Design responsive** pour mobile et desktop
- **Intégration** avec Resend

### 📱 Interface mobile
- **Scanner mobile** pour validation
- **Interface responsive** optimisée
- **Validation en temps réel**
- **Gestion des erreurs** intuitive

### 👨‍💼 Interface admin
- **Dashboard** avec statistiques
- **Gestion des tickets** en temps réel
- **Validation manuelle** des tickets
- **Suivi complet** des statuts

## 🚀 Installation

### Prérequis
- Node.js 18+
- Yarn ou npm
- Compte Resend (pour les emails)

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd shopify-webhook

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp env.example .env.local
# Éditer .env.local avec vos clés API
```

### Variables d'environnement
```env
# Shopify
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Resend (emails)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 🎯 Utilisation

### Pages principales
- **`/`** - Page d'accueil avec liens
- **`/test-tickets`** - Test de génération de tickets
- **`/test-mobile`** - Test interface mobile
- **`/mobile-simple`** - Interface mobile de validation
- **`/admin/qr-codes`** - Interface admin
- **`/email-preview`** - Aperçu des emails

### API Endpoints
- **`/api/ticket/generate`** - Génération de tickets
- **`/api/ticket/validate/[ticketId]`** - Validation de tickets
- **`/api/ticket/stats`** - Statistiques des tickets
- **`/api/shopify/webhook`** - Webhook Shopify

## 🏗️ Architecture

### Base de données
- **SQLite** avec tables optimisées
- **Index** pour les performances
- **Transactions ACID** sécurisées
- **Migration automatique** des données

### Structure des tickets
```sql
tickets:
- id (TEXT PRIMARY KEY)
- orderId (INTEGER)
- orderNumber (INTEGER)
- ticketId (TEXT UNIQUE) -- Identifiant unique
- customerEmail (TEXT)
- ticketTitle (TEXT)
- qrCodeData (TEXT) -- QR code base64
- status (TEXT) -- pending/validated/used/expired
- createdAt, validatedAt, usedAt, validatedBy
```

### Workflow complet
1. **Commande payée** → Webhook Shopify
2. **Génération tickets** → QR codes individuels
3. **Email automatique** → Templates avec QR codes
4. **Validation mobile** → Interface scanner
5. **Suivi admin** → Dashboard temps réel

## 📱 Interface mobile

### Scanner de tickets
- **Saisie manuelle** de l'ID du ticket
- **Interface responsive** optimisée mobile
- **Validation en temps réel**
- **Feedback visuel** des actions

### Utilisation
1. Ouvrir `/mobile-simple` sur téléphone
2. Saisir l'ID du ticket (visible sous le QR code)
3. Valider ou marquer comme utilisé
4. Confirmer l'action

## 🎨 Design et UX

### Thème MR NJP Event's
- **Couleurs** : Brun (#8B4513) et crème (#FDF8ED)
- **Typographie** : Moderne et lisible
- **Responsive** : Mobile-first design
- **Accessibilité** : Contraste et tailles optimisées

### Templates email
- **Design professionnel** avec logo
- **QR codes intégrés** pour chaque ticket
- **Instructions claires** pour l'utilisation
- **Compatible** tous clients email

## 🔧 Développement

### Scripts disponibles
```bash
yarn dev          # Développement
yarn build        # Production
yarn start        # Serveur production
yarn lint         # Linting
```

### Structure du code
```
lib/
├── database-sqlite.ts    # Base de données SQLite
├── ticket-service.ts     # Service tickets
└── email.ts             # Service emails

pages/
├── api/                 # API endpoints
├── admin/              # Interface admin
├── mobile-simple.tsx   # Interface mobile
└── test-*.tsx         # Pages de test
```

## 📊 Monitoring et logs

### Logs automatiques
- **Génération** de tickets
- **Validation** des tickets
- **Erreurs** et exceptions
- **Performance** des requêtes

### Statistiques
- **Tickets totaux** par statut
- **Validations** par validateur
- **Performance** en temps réel
- **Erreurs** et taux de succès

## 🚀 Déploiement

### Vercel (recommandé)
```bash
# Déployer sur Vercel
vercel --prod

# Variables d'environnement
# Configurer dans Vercel Dashboard
```

### Autres plateformes
- **Heroku** : Compatible
- **Railway** : Compatible
- **Docker** : Supporté

## 🎉 Fonctionnalités avancées

### Sécurité
- **Validation HMAC** des webhooks
- **Transactions ACID** pour la cohérence
- **Gestion d'erreurs** robuste
- **Logs sécurisés** sans données sensibles

### Performance
- **SQLite optimisé** avec index
- **Requêtes préparées** pour la sécurité
- **Cache intelligent** des données
- **Compression** des images QR codes

### Évolutivité
- **Support** de milliers de tickets
- **API REST** standardisée
- **Architecture modulaire**
- **Tests intégrés**

## 📞 Support

### Documentation
- **README** : Guide complet
- **Code** : Commentaires détaillés
- **API** : Endpoints documentés
- **Tests** : Pages de test intégrées

### Débogage
- **Logs détaillés** dans la console
- **Pages de test** pour validation
- **Interface admin** pour monitoring
- **API stats** pour les métriques

---

**Système prêt pour la production !** 🚀

*Développé pour MR NJP Event's - Gestion complète des tickets avec QR codes*