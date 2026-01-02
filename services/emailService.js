import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        // Configuration du transporteur email
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // true pour 465, false pour autres ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Vérifier la configuration
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Service email configuré avec succès');
        } catch (error) {
            console.log('⚠️ Configuration email non disponible:', error.message);
            console.log('💡 Configurez SMTP_HOST, SMTP_USER, SMTP_PASS dans .env pour activer les emails');
        }
    }

    /**
     * Envoyer un email générique
     */
    async sendEmail({ to, subject, html, text }) {
        try {
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.log('⚠️ Configuration SMTP manquante, email non envoyé');
                return { success: false, message: 'Configuration SMTP manquante' };
            }

            const mailOptions = {
                from: `"EcoApp Pita" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email envoyé:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Notifier les admins d'un nouveau signalement
     */
    async notifyAdminsNewReport(report, user) {
        const subject = `🚨 Nouveau signalement de déchet - ${report.wasteType}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🌱 EcoApp Pita</h1>
                    <p style="margin: 5px 0 0 0;">Nouveau signalement de déchet</p>
                </div>
                
                <div style="padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #374151;">Détails du signalement</h2>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <p><strong>Type de déchet:</strong> ${report.wasteType}</p>
                        <p><strong>Description:</strong> ${report.description}</p>
                        <p><strong>Signalé par:</strong> ${user.name} (${user.email})</p>
                        <p><strong>Date:</strong> ${new Date(report.createdAt).toLocaleString('fr-FR')}</p>
                        <p><strong>Localisation:</strong> ${report.location.lat}, ${report.location.lng}</p>
                        <p><strong>Statut:</strong> <span style="background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 4px;">${report.status}</span></p>
                    </div>
                    
                    ${report.images && report.images.original ? `
                        <div style="margin: 15px 0;">
                            <p><strong>Image:</strong></p>
                            <img src="${process.env.FRONTEND_URL || 'http://localhost:4000'}${report.images.medium.url}" 
                                 alt="Photo du déchet" 
                                 style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #ddd;">
                        </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" 
                           style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Voir dans l'interface admin
                        </a>
                    </div>
                </div>
                
                <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>EcoApp Pita - Système de gestion des déchets</p>
                    <p>Cet email a été envoyé automatiquement</p>
                </div>
            </div>
        `;

        const text = `
            Nouveau signalement de déchet
            
            Type: ${report.wasteType}
            Description: ${report.description}
            Signalé par: ${user.name} (${user.email})
            Date: ${new Date(report.createdAt).toLocaleString('fr-FR')}
            Localisation: ${report.location.lat}, ${report.location.lng}
            Statut: ${report.status}
            
            Consultez l'interface admin pour plus de détails.
        `;

        // Récupérer les emails des admins
        const adminEmails = await this.getAdminEmails();
        
        if (adminEmails.length === 0) {
            console.log('⚠️ Aucun admin trouvé pour les notifications email');
            return;
        }

        // Envoyer à tous les admins
        for (const email of adminEmails) {
            await this.sendEmail({
                to: email,
                subject,
                html,
                text
            });
        }
    }

    /**
     * Notifier un utilisateur du changement de statut de son signalement
     */
    async notifyUserStatusChange(report, user, oldStatus, newStatus) {
        const statusLabels = {
            'pending': 'En attente',
            'collected': 'Collecté',
            'not_collected': 'Non collecté'
        };

        const statusColors = {
            'pending': '#F59E0B',
            'collected': '#10B981',
            'not_collected': '#EF4444'
        };

        const subject = `📋 Mise à jour de votre signalement - ${statusLabels[newStatus]}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🌱 EcoApp Pita</h1>
                    <p style="margin: 5px 0 0 0;">Mise à jour de votre signalement</p>
                </div>
                
                <div style="padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #374151;">Bonjour ${user.name},</h2>
                    
                    <p>Le statut de votre signalement a été mis à jour :</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p><strong>Description:</strong> ${report.description}</p>
                        <p><strong>Type:</strong> ${report.wasteType}</p>
                        <p><strong>Date du signalement:</strong> ${new Date(report.createdAt).toLocaleString('fr-FR')}</p>
                        
                        <div style="margin: 15px 0;">
                            <p><strong>Statut:</strong></p>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="background: #F3F4F6; color: #6B7280; padding: 4px 12px; border-radius: 4px; text-decoration: line-through;">
                                    ${statusLabels[oldStatus]}
                                </span>
                                <span>→</span>
                                <span style="background: ${statusColors[newStatus]}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
                                    ${statusLabels[newStatus]}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    ${newStatus === 'collected' ? `
                        <div style="background: #D1FAE5; border: 1px solid #10B981; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p style="color: #065F46; margin: 0;">
                                🎉 <strong>Merci pour votre contribution !</strong><br>
                                Votre signalement a été traité avec succès. Vous contribuez à rendre Pita plus propre !
                            </p>
                        </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-reports" 
                           style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Voir mes signalements
                        </a>
                    </div>
                </div>
                
                <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>EcoApp Pita - Système de gestion des déchets</p>
                    <p>Cet email a été envoyé automatiquement</p>
                </div>
            </div>
        `;

        const text = `
            Mise à jour de votre signalement
            
            Bonjour ${user.name},
            
            Le statut de votre signalement a été mis à jour :
            
            Description: ${report.description}
            Type: ${report.wasteType}
            Ancien statut: ${statusLabels[oldStatus]}
            Nouveau statut: ${statusLabels[newStatus]}
            
            ${newStatus === 'collected' ? 'Merci pour votre contribution ! Votre signalement a été traité avec succès.' : ''}
            
            Consultez vos signalements sur l'application.
        `;

        return await this.sendEmail({
            to: user.email,
            subject,
            html,
            text
        });
    }

    /**
     * Email de bienvenue pour les nouveaux utilisateurs
     */
    async sendWelcomeEmail(user) {
        const subject = `🌱 Bienvenue sur EcoApp Pita !`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">🌱 EcoApp Pita</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Bienvenue dans la communauté !</p>
                </div>
                
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #374151;">Bonjour ${user.name} ! 👋</h2>
                    
                    <p>Merci de rejoindre EcoApp Pita, l'application qui aide à maintenir notre ville propre et verte !</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #10B981; margin-top: 0;">🚀 Comment commencer :</h3>
                        <ul style="color: #374151; line-height: 1.6;">
                            <li><strong>Signalez des déchets</strong> - Prenez une photo et localisez les déchets</li>
                            <li><strong>Gagnez des points</strong> - Chaque signalement vous rapporte 10 points</li>
                            <li><strong>Suivez vos contributions</strong> - Consultez l'évolution de vos signalements</li>
                            <li><strong>Participez à la communauté</strong> - Aidez à rendre Pita plus propre</li>
                        </ul>
                    </div>
                    
                    <div style="background: #EBF8FF; border: 1px solid #3B82F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #1E40AF; margin: 0;">
                            💡 <strong>Astuce :</strong> Activez la géolocalisation pour signaler plus facilement les déchets autour de vous !
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/report" 
                           style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Faire mon premier signalement
                        </a>
                    </div>
                </div>
                
                <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px;">
                        Ensemble, rendons Pita plus propre ! 🌍<br>
                        L'équipe EcoApp Pita
                    </p>
                </div>
            </div>
        `;

        const text = `
            Bienvenue sur EcoApp Pita !
            
            Bonjour ${user.name} !
            
            Merci de rejoindre EcoApp Pita, l'application qui aide à maintenir notre ville propre et verte !
            
            Comment commencer :
            - Signalez des déchets en prenant une photo et en les localisant
            - Gagnez des points (10 points par signalement)
            - Suivez l'évolution de vos contributions
            - Participez à rendre Pita plus propre
            
            Astuce : Activez la géolocalisation pour signaler plus facilement !
            
            Commencez dès maintenant sur l'application.
            
            L'équipe EcoApp Pita
        `;

        return await this.sendEmail({
            to: user.email,
            subject,
            html,
            text
        });
    }

    /**
     * Récupérer les emails des administrateurs
     */
    async getAdminEmails() {
        try {
            // Import dynamique pour éviter les dépendances circulaires
            const { default: User } = await import('../models/userModel.js');
            
            const admins = await User.find({ role: 'admin' }).select('email');
            return admins.map(admin => admin.email);
        } catch (error) {
            console.error('❌ Erreur récupération emails admins:', error);
            return [];
        }
    }

    /**
     * Rapport hebdomadaire pour les admins
     */
    async sendWeeklyReport() {
        try {
            // Import dynamique
            const { default: WasteReport } = await import('../models/wasteReportModel.js');
            const { default: User } = await import('../models/userModel.js');

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Statistiques de la semaine
            const [
                newReports,
                collectedReports,
                newUsers,
                totalReports,
                totalUsers
            ] = await Promise.all([
                WasteReport.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
                WasteReport.countDocuments({ 
                    status: 'collected',
                    updatedAt: { $gte: oneWeekAgo }
                }),
                User.countDocuments({ 
                    createdAt: { $gte: oneWeekAgo },
                    role: 'citizen'
                }),
                WasteReport.countDocuments(),
                User.countDocuments({ role: 'citizen' })
            ]);

            const subject = `📊 Rapport hebdomadaire EcoApp Pita - ${new Date().toLocaleDateString('fr-FR')}`;
            
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">📊 Rapport Hebdomadaire</h1>
                        <p style="margin: 5px 0 0 0;">EcoApp Pita - ${new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                    
                    <div style="padding: 20px; background: #f9f9f9;">
                        <h2 style="color: #374151;">Activité de la semaine</h2>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <h3 style="color: #10B981; margin: 0; font-size: 24px;">${newReports}</h3>
                                <p style="margin: 5px 0 0 0; color: #6B7280;">Nouveaux signalements</p>
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <h3 style="color: #3B82F6; margin: 0; font-size: 24px;">${collectedReports}</h3>
                                <p style="margin: 5px 0 0 0; color: #6B7280;">Déchets collectés</p>
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <h3 style="color: #8B5CF6; margin: 0; font-size: 24px;">${newUsers}</h3>
                                <p style="margin: 5px 0 0 0; color: #6B7280;">Nouveaux utilisateurs</p>
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                                <h3 style="color: #F59E0B; margin: 0; font-size: 24px;">${Math.round((collectedReports / Math.max(newReports, 1)) * 100)}%</h3>
                                <p style="margin: 5px 0 0 0; color: #6B7280;">Taux de traitement</p>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #374151; margin-top: 0;">📈 Totaux généraux</h3>
                            <p><strong>Total signalements:</strong> ${totalReports}</p>
                            <p><strong>Total utilisateurs:</strong> ${totalUsers}</p>
                            <p><strong>Taux de collecte global:</strong> ${Math.round((collectedReports / Math.max(totalReports, 1)) * 100)}%</p>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" 
                               style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Voir le tableau de bord complet
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
                        <p>EcoApp Pita - Rapport automatique hebdomadaire</p>
                    </div>
                </div>
            `;

            const adminEmails = await this.getAdminEmails();
            
            for (const email of adminEmails) {
                await this.sendEmail({
                    to: email,
                    subject,
                    html,
                    text: `Rapport hebdomadaire EcoApp Pita\n\nNouveaux signalements: ${newReports}\nDéchets collectés: ${collectedReports}\nNouveaux utilisateurs: ${newUsers}\nTaux de traitement: ${Math.round((collectedReports / Math.max(newReports, 1)) * 100)}%`
                });
            }

            console.log('✅ Rapport hebdomadaire envoyé aux admins');
        } catch (error) {
            console.error('❌ Erreur envoi rapport hebdomadaire:', error);
        }
    }
}

export default new EmailService();