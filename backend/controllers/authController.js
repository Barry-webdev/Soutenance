import User from '../models/userModel.js';
import { logManualAudit } from '../middlewares/auditMiddleware.js';

/**
 * Connexion utilisateur avec JWT - Version optimisée
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Recherche optimisée avec sélection des champs nécessaires seulement
        const user = await User.findOne({ email }).select('+password');
        
        if (!user || !(await user.comparePassword(password))) {
            // Audit asynchrone pour ne pas bloquer la réponse
            setImmediate(async () => {
                try {
                    await logManualAudit(
                        'USER_LOGIN_FAILED',
                        { _id: 'anonymous', email, role: 'unknown' },
                        `Tentative de connexion échouée pour l'email: ${email}`,
                        { attemptEmail: email, reason: 'Email ou mot de passe incorrect' }
                    );
                } catch (auditError) {
                    console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
                }
            });
            
            return res.status(401).json({ 
                success: false,
                error: 'Email ou mot de passe incorrect' 
            });
        }

        if (!user.isActive) {
            // Audit asynchrone
            setImmediate(async () => {
                try {
                    await logManualAudit(
                        'USER_LOGIN_DISABLED',
                        user,
                        `Tentative de connexion avec compte désactivé: ${email}`,
                        { reason: 'Compte désactivé' }
                    );
                } catch (auditError) {
                    console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
                }
            });
            
            return res.status(403).json({ 
                success: false,
                error: 'Votre compte est désactivé' 
            });
        }

        const token = user.generateAuthToken();

        // Réponse immédiate
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

        // Audit asynchrone après la réponse
        setImmediate(async () => {
            try {
                await logManualAudit(
                    'USER_LOGIN',
                    user,
                    `Connexion réussie de l'utilisateur: ${user.name}`,
                    { loginMethod: 'email' }
                );
            } catch (auditError) {
                console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
            }
        });

    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        
        // Audit asynchrone pour erreur
        setImmediate(async () => {
            try {
                await logManualAudit(
                    'SYSTEM_ERROR',
                    { _id: 'system', email: 'system', role: 'system' },
                    `Erreur serveur lors de la connexion: ${error.message}`,
                    { error: error.message, endpoint: '/auth/login' }
                );
            } catch (auditError) {
                console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
            }
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur lors de la connexion' 
        });
    }
};

/**
 * Inscription utilisateur - Version optimisée
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role = 'citizen' } = req.body;

        // Vérification d'existence optimisée
        const userExists = await User.findOne({ email }).select('_id');
        if (userExists) {
            // Audit asynchrone
            setImmediate(async () => {
                try {
                    await logManualAudit(
                        'USER_REGISTER_DUPLICATE',
                        { _id: 'anonymous', email, role: 'unknown' },
                        `Tentative d'inscription avec email existant: ${email}`,
                        { attemptEmail: email }
                    );
                } catch (auditError) {
                    console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
                }
            });
            
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

        // Réponse immédiate
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

        // Tâches asynchrones après la réponse
        setImmediate(async () => {
            try {
                // Notification de bienvenue
                const NotificationService = (await import('../services/notification.js')).default;
                await NotificationService.sendWelcomeNotification(newUser);
            } catch (notifError) {
                console.log('⚠️ Erreur notification bienvenue (non bloquante):', notifError.message);
            }

            try {
                // Audit
                await logManualAudit(
                    'USER_REGISTER',
                    newUser,
                    `Nouvel utilisateur inscrit: ${name} (${email})`,
                    { role: newUser.role, registrationMethod: 'email' }
                );
            } catch (auditError) {
                console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            
            // Audit asynchrone
            setImmediate(async () => {
                try {
                    await logManualAudit(
                        'USER_REGISTER_INVALID',
                        { _id: 'anonymous', email: req.body.email, role: 'unknown' },
                        `Tentative d'inscription avec données invalides`,
                        { errors, attemptEmail: req.body.email }
                    );
                } catch (auditError) {
                    console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
                }
            });
            
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        
        console.error('❌ Erreur inscription:', error);
        
        // Audit asynchrone pour erreur
        setImmediate(async () => {
            try {
                await logManualAudit(
                    'SYSTEM_ERROR',
                    { _id: 'system', email: 'system', role: 'system' },
                    `Erreur serveur lors de l'inscription: ${error.message}`,
                    { error: error.message, endpoint: '/auth/register' }
                );
            } catch (auditError) {
                console.warn('⚠️ Erreur audit non bloquante:', auditError.message);
            }
        });
        
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