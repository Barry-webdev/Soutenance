#!/usr/bin/env node
/**
 * Script pour générer des clés secrètes sécurisées
 * Usage: node scripts/generate-secrets.js
 */

import crypto from 'crypto';

console.log('🔐 Génération de clés secrètes sécurisées...\n');

// Générer JWT_SECRET (64 bytes = 128 caractères hex)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ JWT_SECRET (copiez dans vos variables d\'environnement):');
console.log(jwtSecret);
console.log('');

// Générer SESSION_SECRET (32 bytes = 64 caractères hex)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('✅ SESSION_SECRET (copiez dans vos variables d\'environnement):');
console.log(sessionSecret);
console.log('');

// Générer un mot de passe fort pour MongoDB
const mongoPassword = crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');
console.log('✅ Mot de passe MongoDB suggéré:');
console.log(mongoPassword);
console.log('');

console.log('📋 Instructions:');
console.log('1. Copiez JWT_SECRET dans vos variables d\'environnement');
console.log('2. Copiez SESSION_SECRET dans vos variables d\'environnement');
console.log('3. Changez le mot de passe MongoDB dans MongoDB Atlas');
console.log('4. Mettez à jour MONGODB_URI avec le nouveau mot de passe');
console.log('');
console.log('⚠️  IMPORTANT: Ne partagez JAMAIS ces clés publiquement !');
console.log('⚠️  IMPORTANT: Utilisez des clés différentes pour dev/staging/production !');
