# 🛠️ Guide de Développement - MR NJP Event's

## 📋 Structure du Projet

```
shopify-webhook/
├── lib/                    # Services principaux
│   ├── database-sqlite.ts  # Base de données SQLite
│   ├── email.ts           # Service emails
│   └── ticket-service.ts # Service tickets
├── pages/                 # Pages Next.js
│   ├── api/              # API endpoints
│   ├── admin/            # Interface admin
│   └── *.tsx            # Pages publiques
├── src/                  # Templates et composants
├── types/               # Types TypeScript
├── data/               # Base de données
└── public/            # Assets statiques
```

## 🔧 Développement Local

### Prérequis
- Node.js 18+
- Yarn
- SQLite3

### Installation
```bash
# Cloner et installer
git clone <repo>
cd shopify-webhook
yarn install

# Variables d'environnement
cp env.example .env.local
# Éditer .env.local
```

### Démarrage
```bash
# Développement
yarn dev

# Production
yarn build
yarn start
```

## 🗄️ Base de Données

### Structure SQLite
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
  createdAt DATETIME,
  validatedAt DATETIME,
  usedAt DATETIME,
  validatedBy TEXT
);

-- Table des validations
CREATE TABLE ticket_validations (
  id TEXT PRIMARY KEY,
  ticketId TEXT,
  validatedBy TEXT,
  validatedAt DATETIME,
  notes TEXT
);
```

### Gestion des données
```typescript
// Service de base de données
import { Database } from 'better-sqlite3';

// Connexion
const db = new Database('data/qrcodes.db');

// Requêtes préparées
const stmt = db.prepare('SELECT * FROM tickets WHERE status = ?');
const tickets = stmt.all('pending');
```

## 📧 Service Emails

### Configuration Resend
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Envoi d'email
await resend.emails.send({
  from: 'noreply@domain.com',
  to: ['customer@email.com'],
  subject: 'Vos tickets',
  html: template
});
```

### Templates
- **Templates React** dans `src/email-templates.ts`
- **Styles inline** pour compatibilité
- **Responsive design** mobile/desktop

## 🎫 Service Tickets

### Génération de tickets
```typescript
// Options de génération
const options = {
  orderId: 123,
  orderNumber: 1380,
  customerEmail: 'user@email.com',
  lineItems: [...],
  currency: 'EUR'
};

// Génération
const tickets = await ticketService.generateTicketsForOrder(options);
```

### QR Codes
- **Bibliothèque** : `qrcode`
- **Format** : Base64 PNG
- **Taille** : 200x200px par défaut
- **Couleurs** : Thème MR NJP Event's

## 📱 Interface Mobile

### Pages mobiles
- **`/mobile-simple`** - Interface principale
- **`/test-mobile`** - Tests et génération

### Fonctionnalités
- **Saisie manuelle** d'ID de ticket
- **Validation en temps réel**
- **Design responsive**
- **Feedback visuel**

## 🔌 API Endpoints

### Tickets
```typescript
// Génération
POST /api/ticket/generate
{
  "orderData": { ... }
}

// Validation
POST /api/ticket/validate/[ticketId]
{
  "validatedBy": "Admin",
  "notes": "Optional"
}

// Marquage utilisé
PUT /api/ticket/validate/[ticketId]

// Statistiques
GET /api/ticket/stats
```

### Shopify Webhook
```typescript
// Webhook de commande
POST /api/shopify/webhook
// Validation HMAC automatique
// Génération de tickets
// Envoi d'email
```

## 🧪 Tests et Débogage

### Pages de test
- **`/test-tickets`** - Test génération tickets
- **`/test-mobile`** - Test interface mobile
- **`/admin/qr-codes`** - Interface admin

### Logs et débogage
```typescript
// Logs automatiques
console.log('🎫 Ticket généré:', ticketId);
console.log('✅ Validation réussie:', ticketId);
console.log('❌ Erreur:', error);
```

## 🚀 Déploiement

### Vercel (recommandé)
```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod

# Variables d'environnement
# Configurer dans Vercel Dashboard
```

### Variables d'environnement
```env
# Shopify
SHOPIFY_WEBHOOK_SECRET=secret

# Resend
RESEND_API_KEY=key
FROM_EMAIL=noreply@domain.com

# Application
NEXT_PUBLIC_BASE_URL=https://domain.com
```

## 📊 Monitoring

### Métriques importantes
- **Tickets générés** par jour
- **Taux de validation** des tickets
- **Erreurs** d'API
- **Performance** des requêtes

### Logs à surveiller
- **Génération** de tickets
- **Validation** des tickets
- **Erreurs** d'email
- **Erreurs** de base de données

## 🔒 Sécurité

### Bonnes pratiques
- **Validation HMAC** des webhooks
- **Requêtes préparées** SQL
- **Validation** des entrées
- **Logs sécurisés** (pas de données sensibles)

### Gestion des erreurs
```typescript
try {
  // Opération
} catch (error) {
  console.error('❌ Erreur:', error);
  return { success: false, error: 'Message utilisateur' };
}
```

## 🎨 Design et UX

### Thème MR NJP Event's
- **Couleurs** : Brun (#8B4513) et crème (#FDF8ED)
- **Typographie** : Moderne et lisible
- **Responsive** : Mobile-first
- **Accessibilité** : Contraste et tailles

### Composants réutilisables
- **Boutons** avec styles cohérents
- **Formulaires** avec validation
- **Messages** d'erreur/succès
- **Loading** states

## 📈 Performance

### Optimisations
- **SQLite** avec index
- **Requêtes préparées**
- **Cache** des données
- **Compression** des images

### Monitoring
- **Temps de réponse** API
- **Utilisation** mémoire
- **Taille** base de données
- **Erreurs** en temps réel

---

**Guide de développement complet !** 🚀

*Pour toute question, consulter le README principal ou les commentaires dans le code.*
