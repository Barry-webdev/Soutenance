// ==============================
// 📦 Imports & Initialisation
// ==============================
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// ==============================
// 🔌 Connexion à la base de données
// ==============================
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'wastemanage'
});
module.exports = db;

// ==============================
// ⚙️ Middlewares globaux
// ==============================
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.json({ limit: '20mb' }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ==============================
// 👨‍💻 Création de l’admin par défaut
// ==============================
const initializeAdmin = async () => {
  const adminEmail = 'babdoulrazzai@gmail.com';
  const adminName = 'Admin';
  const adminPassword = 'kathioure';
  const adminRole = 'admin';

  try {
    const [result] = await db.query('SELECT * FROM utilisateur WHERE email = ?', [adminEmail]);
    if (result.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.query(
        'INSERT INTO utilisateur (nom, prenom, email, password, role, points, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [adminName, 'WM-APP', adminEmail, hashedPassword, adminRole, 0]
      );
      console.log('✅ Administrateur par défaut ajouté avec succès.');
    } else {
      console.log('✅ Administrateur déjà existant.');
    }
  } catch (err) {
    console.error('❌ Erreur lors de la vérification de l’administrateur :', err);
  }
};
initializeAdmin();

// ==============================
// 🔐 Authentification & Session
// ==============================

// ✅ Inscription
app.post('/api/register', async (req, res) => {
  const { email, password, nom, prenom } = req.body;
  if (!email || !password || !nom || !prenom) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const [existingUsers] = await db.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO utilisateur (nom, prenom, email, password, role, points, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [nom, prenom, email, hashedPassword, 'citizen', 0]
    );

    res.status(201).json({ message: 'Compte créé avec succès !', redirect: '/login' });
  } catch (error) {
    console.error('❌ Erreur lors de l’inscription :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ Connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis !' });
  }

  try {
    const [users] = await db.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.cookie('userId', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 3600000
    });

    res.status(200).json({
      message: user.role === 'admin' ? 'Bienvenue Admin' : 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        points: user.points
      },
      redirect: user.role === 'admin' ? '/admin' : '/report'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});



// ✅ Déconnexion
app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.status(200).json({ message: 'Déconnexion réussie.' });
});

// ✅ Vérification de session
app.get('/user-session', async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) return res.status(401).json({ user: null });

  try {
    const [users] = await db.query(
      'SELECT id, nom, prenom, email, role, points FROM utilisateur WHERE id = ?',
      [userId]
    );
    if (users.length === 0) return res.status(401).json({ user: null });

    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error("❌ Erreur session utilisateur :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ==============================
// 🔔 Notifications
// ==============================
app.get('/api/notifications/:id', async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Erreur notifications :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

//Notifs
const notificationsRoutes = require('./routes/notifications.routes');
app.use('/notifications', notificationsRoutes);

// ==============================
// 👤 Liste des utilisateurs
// ==============================
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, nom AS name, email, role, points, created_at AS createdAt FROM utilisateur ORDER BY created_at DESC'
    );
    res.status(200).json(users);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ==============================
// 📊 Statistiques pour tableau de bord
// ==============================
app.get('/api/statistics', async (req, res) => {
  try {
    const [[total]] = await db.query(`
      SELECT COUNT(*) AS totalReports FROM waste_reports
    `);

    const [[resolved]] = await db.query(`
      SELECT COUNT(*) AS completed FROM waste_reports WHERE status = 'completed'
    `);

    const [[pending]] = await db.query(`
      SELECT COUNT(*) AS pending FROM waste_reports WHERE status != 'completed'
    `);

    const [wasteTypeStats] = await db.query(`
      SELECT wasteType AS name, COUNT(*) AS count 
      FROM waste_reports 
      GROUP BY wasteType
    `);

    const [neighborhoodStats] = await db.query(`
      SELECT address AS name, COUNT(*) AS reports 
      FROM waste_reports 
      GROUP BY address
    `);

    const criticalAreas = 0;

    res.json({
      totalReports: total.totalReports,
      completed: resolved.completed,
      pending: pending.pending,
      wasteTypeData: wasteTypeStats,
      reportsByNeighborhood: neighborhoodStats,
      criticalAreas
    });

  } catch (error) {
    console.error("❌ Erreur stats :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const [[signalements]] = await db.query('SELECT COUNT(*) AS count FROM waste_reports');
    const [[resolus]] = await db.query("SELECT COUNT(*) AS count FROM waste_reports WHERE status = 'completed'");
    const [[utilisateurs]] = await db.query('SELECT COUNT(*) AS count FROM utilisateur');
    const [[quartiers]] = await db.query('SELECT COUNT(DISTINCT address) AS count FROM waste_reports');

    res.json({
      signalements: signalements.count,
      resolus: resolus.count,
      utilisateurs: utilisateurs.count,
      quartiers: quartiers.count
    });
  } catch (error) {
    console.error('❌ Erreur stats accueil :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});





// ==============================
// 🗑️ Signalements de déchets
// ==============================
const wasteReportsRoutes = require('./routes/wasteReports.routes');
app.use('/api', wasteReportsRoutes);

// ==============================
// 🚀 Démarrage du serveur
// ==============================
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
});
