import User from '../models/userModel.js';

/**
 * Connexion utilisateur avec JWT
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ 
                success: false,
                error: 'Email ou mot de passe incorrect' 
            });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                success: false,
                error: 'Votre compte est désactivé' 
            });
        }

        const token = user.generateAuthToken();

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
            return res.status(400).json({ 
                success: false,
                error: 'Données invalides', 
                details: errors 
            });
        }
        console.error('❌ Erreur inscription:', error);
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
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};