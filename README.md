# 🎫 MR NJP Event's - Système de Tickets avec QR Codes

## 📋 Vue d'ensemble

Système complet de gestion de tickets avec QR codes uniques pour les événements MR NJP Event's. Chaque ticket génère un QR code individuel pour une validation sécurisée.

## ✨ Fonctionnalités

### 🎫 Gestion des tickets
- **Tickets individuels** avec QR codes uniques
- **Support multi-tickets** par commande
- **Statuts** : En attente, Validé, Utilisé, Expiré
- **Base de données Supabase** PostgreSQL

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
- Compte Supabase (gratuit)
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

# Supabase (base de données)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://your-app.vercel.app
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

## 🗄️ Base de Données Supabase

### Configuration
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter le script SQL dans l'éditeur SQL :
```sql
-- Voir scripts/setup-supabase.sql
```

### Structure des tables
```sql
-- Table principale des tickets
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  orderId INTEGER,
  orderNumber INTEGER,
  ticketId TEXT UNIQUE,
  customerEmail TEXT,
  ticketTitle TEXT,
  quantity INTEGER,
  price TEXT,
  currency TEXT,
  qrCodeData TEXT,
  status TEXT,
  createdAt TIMESTAMP,
  validatedAt TIMESTAMP,
  usedAt TIMESTAMP,
  validatedBy TEXT
);

-- Table des validations
CREATE TABLE ticket_validations (
  id TEXT PRIMARY KEY,
  ticketId TEXT,
  validatedBy TEXT,
  validatedAt TIMESTAMP,
  notes TEXT
);
```

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
├── database-supabase.ts    # Base de données Supabase
├── ticket-service-supabase.ts # Service tickets
└── email.ts               # Service emails

pages/
├── api/                   # API endpoints
├── admin/                # Interface admin
├── mobile-simple.tsx     # Interface mobile
└── test-*.tsx           # Pages de test
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
- **Netlify** : Compatible
- **Railway** : Compatible
- **Docker** : Supporté

## 🎉 Fonctionnalités avancées

### Sécurité
- **Validation HMAC** des webhooks
- **CORS sécurisé** configuré
- **Gestion d'erreurs** robuste
- **Logs sécurisés** sans données sensibles

### Performance
- **Supabase optimisé** avec index
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