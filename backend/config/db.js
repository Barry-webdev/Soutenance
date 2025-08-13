// ==========================
// 📦 Importations
// ==========================
const mysql = require('mysql2');
const mysql2 = require('mysql2/promise');
const bcrypt = require('bcrypt');

// ==========================
// 🔧 Connexion classique
// ==========================
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wastemanage'
});

db.connect(err => {
    if (err) {
        console.error('❌ Connexion à la base de données échouée :', err.stack);
        process.exit(1);
    }
    console.log('✅ Base de données connectée.');
});

// ==========================
// 🔧 Connexion via pool (mysql2/promise)
// ==========================
const dbPool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wastemanage'
});

// ==========================
// 🔍 Vérification de la table utilisateur
// ==========================
const checkTable = async () => {
    try {
        console.log("🔍 Vérification de l'existence de la table 'utilisateur'...");
        const [tableExists] = await db.promise().query('SHOW TABLES LIKE "utilisateur"');

        if (tableExists.length === 0) {
            console.error("❌ La table 'utilisateur' n'existe pas. Vérifie ta base de données !");
            return;
        }

        console.log("✅ La table 'utilisateur' existe.");
        await checkAdmin();
    } catch (error) {
        console.error("❌ Erreur lors de la vérification de la table :", error);
    }
};

// ==========================
// 🔍 Vérification et ajout de l’admin par défaut
// ==========================
const checkAdmin = async () => {
    try {
        const adminEmail = 'babdoulrazzai@gmail.com';
        const adminName = 'Admin';
        const adminPassword = 'kathioure';
        const adminRole = 'admin';

        console.log("🔍 Vérification de l'existence de l'administrateur...");
        const [rows] = await db.promise().query(
            'SELECT * FROM utilisateur WHERE email = ?', [adminEmail]
        );

        if (rows.length === 0) {
            console.log("⚡ Aucun administrateur trouvé, ajout en cours...");
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            await db.promise().query(
                'INSERT INTO utilisateur (nom, prenom, email, password, role) VALUES (?, ?, ?, ?, ?)',
                [adminName, 'WM-APP', adminEmail, hashedPassword, adminRole]
            );
            console.log('✅ Administrateur par défaut ajouté avec succès.');
        } else {
            console.log('✅ Administrateur déjà existant.');
        }
    } catch (error) {
        console.error("❌ Erreur lors du traitement :", error);
    }
};

// ==========================
// 🔍 Initialisation via pool (mysql2/promise)
// ==========================
const initializeAdmin = async () => {
    const adminEmail = 'babdoulrazzai@gmail.com';
    const adminName = 'Admin';
    const adminPassword = 'kathioure';
    const adminRole = 'admin';

    try {
        console.log("🔍 [POOL] Vérification de l'existence de l'administrateur...");
        const [result] = await dbPool.query('SELECT * FROM utilisateur WHERE email = ?', [adminEmail]);

        if (result.length === 0) {
            console.log("⚡ [POOL] Aucun administrateur trouvé, ajout en cours...");
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            await dbPool.query(
                'INSERT INTO utilisateur (nom, prenom, email, password, role, points, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [adminName, 'WM-APP', adminEmail, hashedPassword, adminRole, 0]
            );

            console.log('✅ [POOL] Administrateur par défaut ajouté avec succès.');
        } else {
            console.log('✅ [POOL] Administrateur déjà existant.');
        }
    } catch (err) {
        console.error('❌ [POOL] Erreur lors de la vérification de l’administrateur :', err);
    }
};

// ==========================
// 📤 Soumission du formulaire de collaboration
// ==========================
const submitCollaboration = (req, res) => {
    const { organisation, type, activite, message, email } = req.body;

    const sql = 'INSERT INTO collaboration_requests (organisation, type, activite, message, email) VALUES (?, ?, ?, ?, ?)';
    const values = [organisation, type, activite, message, email];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('❌ Erreur SQL :', err);
            return res.status(500).json({ error: 'Erreur SQL lors de l’enregistrement.' });
        }

        res.status(200).json({ success: true });
    });
};

// ==========================
// 🚀 Exécution et export
// ==========================
checkTable();

module.exports = {
    db,
    dbPool,
    initializeAdmin,
    submitCollaboration
};
