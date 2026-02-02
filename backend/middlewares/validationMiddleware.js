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
    const audioFile = req.files?.audio?.[0];
    
    const errors = [];
    
    // Description OU audio requis (pas les deux obligatoires)
    const hasDescription = description && description.trim().length > 0;
    const hasAudio = audioFile && audioFile.size > 0;
    
    // 🔍 DEBUG TEMPORAIRE
    console.log('🔍 DEBUG VALIDATION:');
    console.log('- description:', JSON.stringify(description));
    console.log('- hasDescription:', hasDescription);
    console.log('- audioFile:', audioFile ? 'présent' : 'absent');
    console.log('- hasAudio:', hasAudio);
    console.log('- Validation OU:', hasDescription || hasAudio);
    
    if (!hasDescription && !hasAudio) {
        errors.push('Une description écrite ou un enregistrement vocal est requis');
    }
    
    if (!wasteType) errors.push('Le type de déchet est obligatoire');
    if (!location) errors.push('La localisation est obligatoire');
    
    // Valider la localisation
    if (location) {
        let parsedLocation;
        try {
            // Si location est une chaîne, essayer de la parser
            parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
        } catch (e) {
            errors.push('Format de localisation invalide');
        }
        
        if (parsedLocation && (!parsedLocation.lat || !parsedLocation.lng)) {
            errors.push('La localisation doit contenir latitude et longitude');
        }
        
        // Valider les coordonnées
        if (parsedLocation) {
            const lat = parseFloat(parsedLocation.lat);
            const lng = parseFloat(parsedLocation.lng);
            
            if (isNaN(lat) || lat < -90 || lat > 90) {
                errors.push('Latitude invalide (doit être entre -90 et 90)');
            }
            
            if (isNaN(lng) || lng < -180 || lng > 180) {
                errors.push('Longitude invalide (doit être entre -180 et 180)');
            }
            
            // Mettre à jour req.body avec la localisation parsée
            req.body.location = { lat, lng };
        }
    }
    
    if (description && description.length > 500) {
        errors.push('La description ne peut pas dépasser 500 caractères');
    }
    
    // Valider le type de déchet
    const validWasteTypes = ['plastique', 'verre', 'métal', 'organique', 'papier', 'dangereux', 'autre'];
    if (wasteType && !validWasteTypes.includes(wasteType)) {
        errors.push(`Type de déchet invalide. Types acceptés: ${validWasteTypes.join(', ')}`);
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