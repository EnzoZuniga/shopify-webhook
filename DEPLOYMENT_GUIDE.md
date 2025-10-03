# 🚀 Guide de Déploiement Complet - MR NJP Event's

## 🎯 Solutions disponibles

### 🥇 **1. Supabase (RECOMMANDÉ)**
- **✅ PostgreSQL complet** avec interface graphique
- **✅ Plan gratuit généreux** (500MB, 2 projets)
- **✅ Intégration Vercel native**
- **✅ API REST automatique**
- **✅ Persistance permanente**

### 🥈 **2. PlanetScale**
- **✅ MySQL serverless** ultra-rapide
- **✅ Plan gratuit** (1 milliard de requêtes/mois)
- **✅ Branching de base de données**
- **✅ Scaling automatique**

### 🥉 **3. Neon**
- **✅ PostgreSQL serverless**
- **✅ Plan gratuit** (3GB storage)
- **✅ Branching comme Git**

### 🏆 **4. Turso**
- **✅ SQLite distribué** (parfait pour votre cas)
- **✅ Ultra-rapide** (Edge computing)
- **✅ Compatible avec votre code SQLite existant**

## 🚀 Déploiement avec Supabase (Recommandé)

### Étape 1 : Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. **Sign up** avec GitHub
3. **New Project** → Choisir l'organisation
4. **Nom** : `mr-njp-events-tickets`
5. **Database Password** : Générer un mot de passe fort
6. **Region** : Europe (Paris) pour la performance
7. **Wait** : 2-3 minutes pour la création

### Étape 2 : Configurer la base de données
1. Aller dans **SQL Editor** dans Supabase
2. Copier et exécuter le contenu de `scripts/setup-supabase.sql`
3. Vérifier que les tables sont créées

### Étape 3 : Configurer les variables d'environnement
Dans Vercel Dashboard → Settings → Environment Variables :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Shopify
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Resend
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Application
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### Étape 4 : Déploiement Vercel
```bash
# Build et déploiement
yarn build
vercel --prod
```

## 🛠️ Déploiement avec PlanetScale

### Étape 1 : Créer un projet PlanetScale
1. Aller sur [planetscale.com](https://planetscale.com)
2. **Sign up** avec GitHub
3. **New Database** → `mr-njp-events-tickets`
4. **Region** : Europe (Frankfurt)
5. **Wait** : 2-3 minutes

### Étape 2 : Configurer la base de données
```sql
-- Tables MySQL pour PlanetScale
CREATE TABLE tickets (
  id VARCHAR(255) PRIMARY KEY,
  orderId INT NOT NULL,
  orderNumber INT NOT NULL,
  ticketId VARCHAR(255) UNIQUE NOT NULL,
  customerEmail VARCHAR(255) NOT NULL,
  ticketTitle VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price VARCHAR(50) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  qrCodeData TEXT NOT NULL,
  status ENUM('pending', 'validated', 'used', 'expired') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  validatedAt TIMESTAMP NULL,
  usedAt TIMESTAMP NULL,
  validatedBy VARCHAR(255) NULL
);

CREATE TABLE ticket_validations (
  id VARCHAR(255) PRIMARY KEY,
  ticketId VARCHAR(255) NOT NULL,
  validatedBy VARCHAR(255) NOT NULL,
  validatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NULL
);
```

### Étape 3 : Variables d'environnement PlanetScale
```env
# PlanetScale
DATABASE_URL=mysql://username:password@host:port/database
DATABASE_HOST=your-host.planetscale.com
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database
```

## 🏆 Déploiement avec Turso (SQLite distribué)

### Étape 1 : Créer un projet Turso
1. Aller sur [turso.tech](https://turso.tech)
2. **Sign up** avec GitHub
3. **Create Database** → `mr-njp-events-tickets`
4. **Region** : Europe (Paris)
5. **Wait** : 1-2 minutes

### Étape 2 : Configurer la base de données
```sql
-- Tables SQLite pour Turso
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  orderId INTEGER NOT NULL,
  orderNumber INTEGER NOT NULL,
  ticketId TEXT UNIQUE NOT NULL,
  customerEmail TEXT NOT NULL,
  ticketTitle TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price TEXT NOT NULL,
  currency TEXT NOT NULL,
  qrCodeData TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  validatedAt DATETIME,
  usedAt DATETIME,
  validatedBy TEXT
);

CREATE TABLE ticket_validations (
  id TEXT PRIMARY KEY,
  ticketId TEXT NOT NULL,
  validatedBy TEXT NOT NULL,
  validatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
```

### Étape 3 : Variables d'environnement Turso
```env
# Turso
DATABASE_URL=libsql://your-database.turso.io
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## 📊 Comparaison des solutions

| Solution | Type | Plan Gratuit | Persistance | Performance | Intégration | Coût |
|----------|------|--------------|-------------|-------------|-------------|------|
| **Supabase** | PostgreSQL | 500MB, 2 projets | ✅ Permanente | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $0-25/mois |
| **PlanetScale** | MySQL | 1B requêtes/mois | ✅ Permanente | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $0-29/mois |
| **Neon** | PostgreSQL | 3GB storage | ✅ Permanente | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $0-19/mois |
| **Turso** | SQLite | 500MB, 1B requêtes | ✅ Permanente | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $0-29/mois |
| **JSON Files** | JSON | Illimité | ❌ Éphémère | ⭐⭐ | ⭐⭐⭐ | $0 |

## 🧪 Tests de déploiement

### Test de connexion
```bash
# Tester la connexion à la base de données
curl -X GET https://your-app.vercel.app/api/ticket/stats
```

### Test de génération
```bash
# Générer des tickets
curl -X POST https://your-app.vercel.app/api/ticket/generate \
  -H "Content-Type: application/json" \
  -d '{"orderData": {...}}'
```

### Test de validation
```bash
# Valider un ticket
curl -X POST https://your-app.vercel.app/api/ticket/validate/TICKET_ID \
  -H "Content-Type: application/json" \
  -d '{"validatedBy": "Test Admin"}'
```

## 🎯 Recommandation finale

### 🥇 **Pour votre cas d'usage : Supabase**
- **PostgreSQL** : Base de données professionnelle
- **Interface graphique** : Gestion facile des données
- **Plan gratuit** : Suffisant pour commencer
- **Intégration Vercel** : Parfaite
- **Évolutivité** : Scaling automatique

### 🥈 **Alternative : PlanetScale**
- **MySQL** : Très performant
- **Branching** : Gestion des versions de base de données
- **Plan gratuit** : Très généreux
- **Vitesse** : Ultra-rapide

### 🥉 **Pour garder SQLite : Turso**
- **SQLite distribué** : Compatible avec votre code existant
- **Edge computing** : Performance mondiale
- **Migration facile** : Pas de changement de code

## 🚀 Prochaines étapes

1. **Choisir une solution** (Supabase recommandé)
2. **Configurer la base de données**
3. **Déployer sur Vercel**
4. **Tester le système complet**
5. **Configurer les webhooks Shopify**

---

**Guide de déploiement complet !** 🚀

*Choisissez la solution qui correspond le mieux à vos besoins et budget.*
