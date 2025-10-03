#!/bin/bash

# Script de nettoyage du projet MR NJP Event's
echo "🧹 Nettoyage du projet..."

# Supprimer les fichiers temporaires
echo "📁 Suppression des fichiers temporaires..."
rm -rf .next/
rm -rf out/
rm -rf build/
rm -rf node_modules/.cache/

# Nettoyer les logs
echo "📝 Nettoyage des logs..."
rm -f *.log
rm -f logs/*.log

# Nettoyer les fichiers de sauvegarde
echo "💾 Nettoyage des sauvegardes..."
rm -rf data/backup/

# Réinstaller les dépendances
echo "📦 Réinstallation des dépendances..."
rm -rf node_modules/
rm -f package-lock.json
yarn install

# Vérifier la structure
echo "✅ Vérification de la structure..."
echo "📁 Structure du projet :"
tree -I 'node_modules|.next|.git' -a

echo "🎉 Nettoyage terminé !"
echo "🚀 Le projet est prêt pour la production."
