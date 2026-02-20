// services/securityMonitoringService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityMonitoringService {
    constructor() {
        this.attacks = [];
        this.blockedIPs = new Map(); // IP -> { count, lastBlock, reason }
        this.logFile = path.join(__dirname, '../logs/security.log');
        
        // Créer le dossier logs s'il n'existe pas
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }
    
    /**
     * Enregistrer une tentative d'attaque
     */
    logAttack(type, ip, details = {}) {
        const attack = {
            type,
            ip,
            timestamp: new Date().toISOString(),
            ...details
        };
        
        this.attacks.push(attack);
        
        // Garder seulement les 1000 dernières attaques en mémoire
        if (this.attacks.length > 1000) {
            this.attacks.shift();
        }
        
        // Écrire dans le fichier de log
        this.writeToLog(attack);
        
        // Mettre à jour les IPs bloquées
        this.updateBlockedIP(ip, type);
        
        console.warn(`🚨 ATTAQUE ${type}:`, {
            ip,
            timestamp: attack.timestamp,
            details
        });
    }
    
    /**
     * Écrire dans le fichier de log
     */
    writeToLog(attack) {
        const logEntry = `[${attack.timestamp}] ${attack.type} - IP: ${attack.ip} - ${JSON.stringify(attack)}\n`;
        
        fs.appendFile(this.logFile, logEntry, (err) => {
            if (err) {
                console.error('Erreur écriture log sécurité:', err);
            }
        });
    }
    
    /**
     * Mettre à jour les IPs bloquées
     */
    updateBlockedIP(ip, reason) {
        if (!this.blockedIPs.has(ip)) {
            this.blockedIPs.set(ip, {
                count: 1,
                lastBlock: new Date(),
                reason: reason,
                firstSeen: new Date()
            });
        } else {
            const blocked = this.blockedIPs.get(ip);
            blocked.count++;
            blocked.lastBlock = new Date();
            blocked.reason = reason;
        }
    }
    
    /**
     * Vérifier si une IP est bloquée
     */
    isIPBlocked(ip) {
        if (!this.blockedIPs.has(ip)) {
            return false;
        }
        
        const blocked = this.blockedIPs.get(ip);
        
        // Bloquer si plus de 10 tentatives
        if (blocked.count >= 10) {
            const hoursSinceLastBlock = (new Date() - blocked.lastBlock) / (1000 * 60 * 60);
            
            // Débloquer après 24h
            if (hoursSinceLastBlock > 24) {
                this.blockedIPs.delete(ip);
                return false;
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Obtenir les statistiques d'attaques
     */
    getStats() {
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const lastHour = new Date(now - 60 * 60 * 1000);
        
        const attacks24h = this.attacks.filter(a => new Date(a.timestamp) > last24h);
        const attacksLastHour = this.attacks.filter(a => new Date(a.timestamp) > lastHour);
        
        // Compter par type
        const byType = {};
        attacks24h.forEach(attack => {
            byType[attack.type] = (byType[attack.type] || 0) + 1;
        });
        
        // Top IPs attaquantes
        const ipCounts = {};
        attacks24h.forEach(attack => {
            ipCounts[attack.ip] = (ipCounts[attack.ip] || 0) + 1;
        });
        
        const topIPs = Object.entries(ipCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ip, count]) => ({ ip, count }));
        
        return {
            total24h: attacks24h.length,
            totalLastHour: attacksLastHour.length,
            byType,
            topIPs,
            blockedIPs: this.blockedIPs.size,
            timestamp: now.toISOString()
        };
    }
    
    /**
     * Obtenir les attaques récentes
     */
    getRecentAttacks(limit = 50) {
        return this.attacks.slice(-limit).reverse();
    }
    
    /**
     * Obtenir les IPs bloquées
     */
    getBlockedIPs() {
        return Array.from(this.blockedIPs.entries()).map(([ip, data]) => ({
            ip,
            ...data
        }));
    }
    
    /**
     * Débloquer une IP manuellement
     */
    unblockIP(ip) {
        if (this.blockedIPs.has(ip)) {
            this.blockedIPs.delete(ip);
            console.log(`✅ IP débloquée: ${ip}`);
            return true;
        }
        return false;
    }
    
    /**
     * Nettoyer les anciennes données
     */
    cleanup() {
        const now = new Date();
        
        // Supprimer les attaques de plus de 7 jours
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        this.attacks = this.attacks.filter(a => new Date(a.timestamp) > sevenDaysAgo);
        
        // Débloquer les IPs après 24h
        for (const [ip, data] of this.blockedIPs.entries()) {
            const hoursSinceLastBlock = (now - data.lastBlock) / (1000 * 60 * 60);
            if (hoursSinceLastBlock > 24) {
                this.blockedIPs.delete(ip);
            }
        }
        
        console.log('🧹 Nettoyage sécurité effectué');
    }
}

// Instance singleton
const securityMonitoring = new SecurityMonitoringService();

// Nettoyer toutes les heures
setInterval(() => {
    securityMonitoring.cleanup();
}, 60 * 60 * 1000);

export default securityMonitoring;
