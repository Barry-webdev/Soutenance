import User from '../models/userModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Connexion utilisateur avec JWT
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user || !(await user.comparePassword(password))) {
            // Audit pour tentative de connexion échouée
            await logManualAudit(
                'USER_LOGIN_FAILED',
                { _id: 'anonymous', email, role: 'unknown' },
                `Tentative de connexion échouée pour l'email: ${email}`,
                { attemptEmail: email, reason: 'Email ou mot de passe incorrect' }
            );
            
            return res.status(401).json({ 
                success: false,
                error: 'Email ou mot de passe incorrect' 
            });
        }

        if (!user.isActive) {
            // Audit pour compte désactivé
            await logManualAudit(
                'USER_LOGIN_DISABLED',
                user,
                `Tentative de connexion avec compte désactivé: ${email}`,
                { reason: 'Compte désactivé' }
            );
            
            return res.status(403).json({ 
                success: false,
                error: 'Votre compte est désactivé' 
            });
        }

        const token = user.generateAuthToken();

        // Audit pour connexion réussie
        await logManualAudit(
            'USER_LOGIN',
            user,
            `Connexion réussie de l'utilisateur: ${user.name}`,
            { loginMethod: 'email' }
        );

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    points: user.points
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        
        // Audit pour erreur serveur lors de la connexion
        await logManualAudit(
            'SYSTEM_ERROR',
            { _id: 'system', email: 'system', role: 'system' },
            `Erreur serveur lors de la connexion: ${error.message}`,
            { error: error.message, endpoint: '/auth/login' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur lors de la connexion' 
        });
    }
};

/**
 * Inscription utilisateur
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role = 'citizen' } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            // Audit pour tentative d'inscription avec email existant
            await logManualAudit(
                'USER_REGISTER_DUPLICATE',
                { _id: 'anonymous', email, role: 'unknown' },
                `Tentative d'inscription avec email existant: ${email}`,
                { attemptEmail: email }
            );
            
            return res.status(409).json({ 
                success: false,
                error: 'Un utilisateur avec cet email existe déjà' 
            });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role
        });

        const token = newUser.generateAuthToken();

        // Envoyer l'email de bienvenue (non bloquant)
        try {
            const NotificationService = (await import('../services/notification.js')).default;
            await NotificationService.sendWelcomeNotification(newUser);
        } catch (notifError) {
            console.log('⚠️ Erreur notification bienvenue (non bloquante):', notifError.message);
        }

        // Audit pour inscription réussie
        await logManualAudit(
            'USER_REGISTER',
            newUser,
            `Nouvel utilisateur inscrit: ${name} (${email})`,
            { role: newUser.role, registrationMethod: 'email' }
        );

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    points: newUser.points
                }
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            
            // Audit pour données d'inscription invalides
            await logManualAudit(
                'USER_REGISTER_INVALID',
                { _id: 'anonymous', email: req.body.email, role: 'unknown' },
                `Tentative d'inscription avec données invalides`,
                { errors, attemptEmail: req.body.email }
            );
            
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        
        console.error('❌ Erreur inscription:', error);
        
        // Audit pour erreur serveur lors de l'inscription
        await logManualAudit(
            'SYSTEM_ERROR',
            { _id: 'system', email: 'system', role: 'system' },
            `Erreur serveur lors de l'inscription: ${error.message}`,
            { error: error.message, endpoint: '/auth/register' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur lors de l\'inscription' 
        });
    }
};

/**
 * Récupérer le profil utilisateur connecté
 */
export const getProfile = async (req, res) => {
    try {
        // Audit pour consultation du profil
        await logManualAudit(
            'USER_PROFILE_VIEW',
            req.user,
            `Consultation du profil utilisateur`,
            { profileId: req.user._id }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    points: req.user.points,
                    isActive: req.user.isActive
                }
            }
        });
    } catch (error) {
        console.error('❌ Erreur récupération profil:', error);
        
        // Audit pour erreur récupération profil
        await logManualAudit(
            'SYSTEM_ERROR',
            req.user,
            `Erreur lors de la récupération du profil: ${error.message}`,
            { error: error.message, endpoint: '/auth/profile' }
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};