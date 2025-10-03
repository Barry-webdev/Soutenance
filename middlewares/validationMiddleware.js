/**
 * Validation de l'email
 */
const isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

/**
 * Validation des données de connexion
 */
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    const errors = [];
    
    if (!email) errors.push('L\'email est obligatoire');
    if (!password) errors.push('Le mot de passe est obligatoire');
    
    if (email && !isValidEmail(email)) {
        errors.push('Format d\'email invalide');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Données invalides', 
            details: errors 
        });
    }

    next();
};

/**
 * Validation des données d'inscription
 */
export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    
    const errors = [];
    
    if (!name) errors.push('Le nom est obligatoire');
    if (!email) errors.push('L\'email est obligatoire');
    if (!password) errors.push('Le mot de passe est obligatoire');
    
    if (email && !isValidEmail(email)) {
        errors.push('Format d\'email invalide');
    }
    
    if (password && password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Données invalides', 
            details: errors 
        });
    }

    next();
};

/**
 * Validation des signalements de déchets
 */
export const validateWasteReport = (req, res, next) => {
    const { description, wasteType, location } = req.body;
    
    const errors = [];
    
    if (!description) errors.push('La description est obligatoire');
    if (!wasteType) errors.push('Le type de déchet est obligatoire');
    if (!location) errors.push('La localisation est obligatoire');
    
    if (location && (!location.lat || !location.lng)) {
        errors.push('La localisation doit contenir latitude et longitude');
    }
    
    if (description && description.length > 500) {
        errors.push('La description ne peut pas dépasser 500 caractères');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Données invalides', 
            details: errors 
        });
    }

    next();
};

/**
 * Validation des demandes de collaboration
 */
export const validateCollaborationRequest = (req, res, next) => {
    const { organizationName, contactPerson, email, phone, type } = req.body;
    
    const errors = [];
    
    if (!organizationName) errors.push('Le nom de l\'organisation est obligatoire');
    if (!contactPerson) errors.push('La personne de contact est obligatoire');
    if (!email) errors.push('L\'email est obligatoire');
    if (!phone) errors.push('Le téléphone est obligatoire');
    if (!type) errors.push('Le type est obligatoire');
    
    if (email && !isValidEmail(email)) {
        errors.push('Format d\'email invalide');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Données invalides', 
            details: errors 
        });
    }

    next();
};