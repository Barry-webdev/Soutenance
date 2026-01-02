#!/usr/bin/env node

/**
 * Script de test complet pour vérifier que l'application est prête pour la production
 */

import fetch from 'node-fetch';
import fs from 'fs';

const API_BASE = 'http://localhost:4000/api';
const FRONTEND_URL = 'http://localhost:5175';

// Couleurs pour les logs
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️ ${message}`, 'blue');
}

function logHeader(message) {
    log(`\n${colors.bold}🔍 ${message}${colors.reset}`, 'blue');
}

// Variables globales pour les tests
let authToken = null;
let testUserId = null;
let testReportId = null;

/**
 * Test de connectivité de base
 */
async function testConnectivity() {
    logHeader('Test de connectivité');
    
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            logSuccess('Backend accessible');
            return true;
        } else {
            logError(`Backend non accessible: ${response.status}`);
            return false;
        }
    } catch (error) {
        logError(`Erreur de connexion: ${error.message}`);
        return false;
    }
}

/**
 * Test d'inscription
 */
async function testRegistration() {
    logHeader('Test d\'inscription');
    
    const testUser = {
        name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        phone: '123456789'
    };

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok) {
            logSuccess('Inscription réussie');
            testUserId = data.data.user.id;
            authToken = data.data.token;
            logInfo(`Token généré: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            logError(`Erreur inscription: ${data.error || data.message}`);
            return false;
        }
    } catch (error) {
        logError(`Erreur inscription: ${error.message}`);
        return false;
    }
}

/**
 * Test de connexion
 */
async function testLogin() {
    logHeader('Test de connexion');
    
    const loginData = {
        email: 'babdoulrazzai@gmail.com',
        password: 'kathioure'
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            logSuccess('Connexion admin réussie');
            logInfo(`Utilisateur: ${data.data.user.name} (${data.data.user.role})`);
            // Utiliser le token admin pour les tests suivants
            authToken = data.data.token;
            return true;
        } else {
            logError(`Erreur connexion: ${data.error || data.message}`);
            return false;
        }
    } catch (error) {
        logError(`Erreur connexion: ${error.message}`);
        return false;
    }
}

/**
 * Test de création de signalement
 */
async function testReportCreation() {
    logHeader('Test de création de signalement');
    
    // Utiliser le token du citoyen créé lors de l'inscription
    const citizenToken = authToken; // Le token de l'utilisateur inscrit
    
    // Mais d'abord, récupérer le token admin pour les autres tests
    const loginData = {
        email: 'babdoulrazzai@gmail.com',
        password: 'kathioure'
    };

    try {
        // Connexion admin pour récupérer le token admin
        const adminResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const adminData = await adminResponse.json();
        const adminToken = adminData.data.token;

        // Maintenant, créer un signalement avec le token citoyen
        const reportData = {
            description: 'Test de signalement automatique',
            wasteType: 'plastique',
            location: {
                lat: 11.0591,
                lng: -12.3953
            },
            address: 'Test Address, Pita, Guinée'
        };

        const response = await fetch(`${API_BASE}/waste`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${citizenToken}`
            },
            body: JSON.stringify(reportData)
        });

        const data = await response.json();

        if (response.ok) {
            logSuccess('Signalement créé avec succès');
            testReportId = data.data._id;
            logInfo(`ID du signalement: ${testReportId}`);
            
            // Remettre le token admin pour les tests suivants
            authToken = adminToken;
            return true;
        } else {
            logError(`Erreur création signalement: ${data.error || data.message}`);
            // Remettre le token admin même en cas d'erreur
            authToken = adminToken;
            return false;
        }
    } catch (error) {
        logError(`Erreur création signalement: ${error.message}`);
        return false;
    }
}

/**
 * Test de récupération des signalements
 */
async function testReportsRetrieval() {
    logHeader('Test de récupération des signalements');
    
    try {
        const response = await fetch(`${API_BASE}/waste`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const reports = data.data || data;
            logSuccess(`${Array.isArray(reports) ? reports.length : 'Données'} signalements récupérés`);
            if (Array.isArray(reports) && reports.length > 0) {
                logInfo(`Premier signalement: ${reports[0].description}`);
            }
            return true;
        } else {
            logError(`Erreur récupération: ${data.error || data.message}`);
            return false;
        }
    } catch (error) {
        logError(`Erreur récupération: ${error.message}`);
        return false;
    }
}

/**
 * Test des statistiques
 */
async function testStats() {
    logHeader('Test des statistiques');
    
    try {
        const response = await fetch(`${API_BASE}/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const stats = data.data || data;
            logSuccess('Statistiques récupérées');
            logInfo(`Total signalements: ${stats.totalReports || 0}`);
            logInfo(`Total utilisateurs: ${stats.totalUsers || 0}`);
            logInfo(`Signalements collectés: ${stats.collectedReports || 0}`);
            return true;
        } else {
            logError(`Erreur statistiques: ${data.error || data.message}`);
            return false;
        }
    } catch (error) {
        logError(`Erreur statistiques: ${error.message}`);
        return false;
    }
}

/**
 * Test de mise à jour du statut d'un signalement
 */
async function testStatusUpdate() {
    logHeader('Test de mise à jour de statut');
    
    if (!testReportId) {
        logWarning('Aucun signalement de test disponible');
        return true;
    }

    try {
        const response = await fetch(`${API_BASE}/waste/${testReportId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status: 'collected'
            })
        });

        const data = await response.json();

        if (response.ok) {
            const report = data.data || data;
            logSuccess('Statut mis à jour avec succès');
            logInfo(`Nouveau statut: ${report.status}`);
            return true;
        } else {
            logError(`Erreur mise à jour: ${data.error || data.message}`);
            return false;
        }
    } catch (error) {
        logError(`Erreur mise à jour: ${error.message}`);
        return false;
    }
}

/**
 * Test de la base de données
 */
async function testDatabase() {
    logHeader('Test de la base de données');
    
    try {
        const response = await fetch(`${API_BASE}/health/db`);
        
        if (response.ok) {
            logSuccess('Base de données accessible');
            return true;
        } else {
            logError('Base de données non accessible');
            return false;
        }
    } catch (error) {
        logError(`Erreur base de données: ${error.message}`);
        return false;
    }
}

/**
 * Test des middlewares de sécurité
 */
async function testSecurity() {
    logHeader('Test des middlewares de sécurité');
    
    try {
        // Test sans token
        const response = await fetch(`${API_BASE}/waste`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Test sans auth',
                wasteType: 'plastique',
                location: { lat: 11, lng: -12 }
            })
        });

        if (response.status === 401) {
            logSuccess('Middleware d\'authentification fonctionne');
            return true;
        } else {
            logWarning('Middleware d\'authentification pourrait être défaillant');
            return false;
        }
    } catch (error) {
        logError(`Erreur test sécurité: ${error.message}`);
        return false;
    }
}

/**
 * Vérification des fichiers de configuration
 */
function testConfigFiles() {
    logHeader('Vérification des fichiers de configuration');
    
    const requiredFiles = [
        'backend/package.json',
        'backend/.env',
        'backend/.env.production',
        'backend/server.js',
        'front-end/package.json',
        'front-end/.env',
        'front-end/.env.production',
        'front-end/vite.config.ts',
        'backend/railway.json',
        'front-end/vercel.json',
        'render.yaml'
    ];

    let allFilesExist = true;

    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            logSuccess(`${file} existe`);
        } else {
            logError(`${file} manquant`);
            allFilesExist = false;
        }
    }

    return allFilesExist;
}

/**
 * Test de build de production
 */
async function testProductionBuild() {
    logHeader('Test de build de production');
    
    try {
        // Test build frontend
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        logInfo('Build du frontend...');
        const { stdout, stderr } = await execAsync('npm run build', { 
            cwd: 'front-end',
            timeout: 60000 
        });

        if (stderr && !stderr.includes('warning')) {
            logError(`Erreur build: ${stderr}`);
            return false;
        }

        logSuccess('Build frontend réussi');
        
        // Vérifier que le dossier dist existe
        if (fs.existsSync('front-end/dist')) {
            logSuccess('Dossier dist créé');
            return true;
        } else {
            logError('Dossier dist non créé');
            return false;
        }
    } catch (error) {
        logError(`Erreur build: ${error.message}`);
        return false;
    }
}

/**
 * Fonction principale de test
 */
async function runAllTests() {
    log(`\n${colors.bold}🚀 TESTS DE PRÉPARATION PRODUCTION - EcoPulse${colors.reset}`, 'blue');
    log(`${colors.blue}================================================${colors.reset}`);
    
    const tests = [
        { name: 'Fichiers de configuration', fn: testConfigFiles },
        { name: 'Connectivité backend', fn: testConnectivity },
        { name: 'Base de données', fn: testDatabase },
        { name: 'Inscription utilisateur', fn: testRegistration },
        { name: 'Création signalement', fn: testReportCreation },
        { name: 'Connexion admin', fn: testLogin },
        { name: 'Récupération signalements', fn: testReportsRetrieval },
        { name: 'Statistiques', fn: testStats },
        { name: 'Mise à jour statut', fn: testStatusUpdate },
        { name: 'Sécurité', fn: testSecurity },
        { name: 'Build production', fn: testProductionBuild }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            logError(`Erreur dans ${test.name}: ${error.message}`);
        }
        
        // Petite pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Résumé final
    log(`\n${colors.bold}📊 RÉSUMÉ DES TESTS${colors.reset}`, 'blue');
    log(`${colors.blue}==================${colors.reset}`);
    
    if (passedTests === totalTests) {
        logSuccess(`Tous les tests réussis (${passedTests}/${totalTests})`);
        log(`\n${colors.bold}🎉 VOTRE APPLICATION EST PRÊTE POUR LA PRODUCTION !${colors.reset}`, 'green');
        
        log(`\n${colors.bold}📋 PROCHAINES ÉTAPES :${colors.reset}`, 'blue');
        log(`1. Déployez le backend sur Railway`);
        log(`2. Déployez le frontend sur Vercel`);
        log(`3. Configurez les variables d'environnement`);
        log(`4. Testez l'application en production`);
        
    } else {
        logWarning(`${passedTests}/${totalTests} tests réussis`);
        log(`\n${colors.bold}⚠️ QUELQUES CORRECTIONS NÉCESSAIRES${colors.reset}`, 'yellow');
        log(`Vérifiez les erreurs ci-dessus avant le déploiement`);
    }

    log(`\n${colors.blue}Frontend: ${FRONTEND_URL}${colors.reset}`);
    log(`${colors.blue}Backend: ${API_BASE}${colors.reset}`);
}

// Exécuter les tests
runAllTests().catch(error => {
    logError(`Erreur générale: ${error.message}`);
    process.exit(1);
});