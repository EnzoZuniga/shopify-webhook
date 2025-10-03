# 🚀 Guide de Déploiement Vercel - MR NJP Event's

## ⚠️ Problèmes identifiés et solutions

### 🔴 Problème principal : SQLite sur Vercel
**SQLite ne fonctionne pas sur Vercel** car :
- Système de fichiers éphémère
- Pas de persistance entre les déploiements
- Limitations des fonctions serverless

### ✅ Solution implémentée
- **Service Vercel** : `lib/ticket-service-vercel.ts`
- **Base de données JSON** : Système de fichiers éphémère
- **Détection automatique** : `process.env.VERCEL`
- **Fallback intelligent** : SQLite local, JSON sur Vercel

## 🛠️ Configuration requise

### Variables d'environnement Vercel
```env
# Shopify
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Resend (emails)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Application
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### Configuration Vercel
```json
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "buildCommand": "yarn build",
  "installCommand": "yarn install",
  "framework": "nextjs"
}
```

## 🔧 Déploiement étape par étape

### 1. Préparation
```bash
# Vérifier que le projet se build localement
yarn build

# Tester les API endpoints
yarn dev
# Tester : http://localhost:3000/api/ticket/stats
```

### 2. Déploiement Vercel
```bash
# Installation Vercel CLI
npm i -g vercel

# Connexion à Vercel
vercel login

# Déploiement
vercel --prod

# Ou via GitHub (recommandé)
# Connecter le repo GitHub à Vercel
```

### 3. Configuration des variables
Dans le dashboard Vercel :
1. **Settings** → **Environment Variables**
2. Ajouter toutes les variables d'environnement
3. **Redeploy** pour appliquer les changements

## 📊 Architecture de déploiement

### 🏠 Développement local
```
SQLite Database (data/qrcodes.db)
├── Tables : tickets, ticket_validations
├── Persistance : Fichier local
└── Performance : Optimale
```

### ☁️ Production Vercel
```
JSON Files (/tmp/)
├── tickets.json : Données des tickets
├── validations.json : Historique des validations
├── Persistance : Éphémère (redémarre à chaque déploiement)
└── Performance : Acceptable pour MVP
```

## ⚠️ Limitations Vercel

### 🔴 Limitations importantes
- **Pas de persistance** : Données perdues à chaque redéploiement
- **Performance** : JSON files moins rapide que SQLite
- **Concurrence** : Risque de corruption avec accès simultanés
- **Évolutivité** : Limité à quelques centaines de tickets

### 🟡 Solutions recommandées
Pour la production à grande échelle :
1. **Base de données externe** : PostgreSQL, MySQL
2. **Service de base de données** : PlanetScale, Supabase
3. **Cache Redis** : Pour les performances
4. **CDN** : Pour les assets statiques

## 🧪 Tests de déploiement

### Tests à effectuer
```bash
# 1. Test de génération de tickets
curl -X POST https://your-app.vercel.app/api/ticket/generate \
  -H "Content-Type: application/json" \
  -d '{"orderData": {...}}'

# 2. Test de validation
curl -X POST https://your-app.vercel.app/api/ticket/validate/TICKET_ID \
  -H "Content-Type: application/json" \
  -d '{"validatedBy": "Test Admin"}'

# 3. Test des statistiques
curl https://your-app.vercel.app/api/ticket/stats
```

### Pages de test
- **`/test-tickets`** : Test génération de tickets
- **`/test-mobile`** : Test interface mobile
- **`/mobile-simple`** : Interface de validation
- **`/admin/qr-codes`** : Interface admin

## 🔍 Monitoring et logs

### Logs Vercel
```bash
# Voir les logs en temps réel
vercel logs

# Logs spécifiques à une fonction
vercel logs --function=api/ticket/generate
```

### Métriques importantes
- **Temps de réponse** des API
- **Erreurs** de génération de tickets
- **Utilisation** de la mémoire
- **Taille** des fichiers JSON

## 🚨 Dépannage

### Erreurs courantes

#### 1. "better-sqlite3" ne se compile pas
```bash
# Solution : Le service Vercel utilise JSON
# Vérifier que process.env.VERCEL est détecté
```

#### 2. Variables d'environnement manquantes
```bash
# Vérifier dans Vercel Dashboard
# Settings → Environment Variables
```

#### 3. Timeout des fonctions
```json
// Dans vercel.json
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 4. Erreurs de build
```bash
# Vérifier les logs de build
vercel logs --build

# Rebuild complet
vercel --force
```

## 📈 Optimisations

### Performance
- **Cache** des données en mémoire
- **Compression** des QR codes
- **Optimisation** des requêtes JSON
- **CDN** pour les assets

### Sécurité
- **Validation HMAC** des webhooks
- **Rate limiting** des API
- **CORS** configuré
- **Logs sécurisés**

## 🎯 Prochaines étapes

### Pour la production
1. **Base de données externe** (PostgreSQL)
2. **Cache Redis** pour les performances
3. **Monitoring** avec Sentry
4. **Backup** automatique des données

### Évolutions possibles
1. **API GraphQL** pour plus de flexibilité
2. **WebSockets** pour les mises à jour temps réel
3. **Queue system** pour les emails
4. **Analytics** détaillées

---

**Déploiement Vercel optimisé !** 🚀

*Le système fonctionne sur Vercel avec des limitations acceptables pour un MVP.*
