const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Connexion MySQL via mysql2/promise

router.post('/submit', async (req, res) => {
  const { organisation, type, activite, message, email } = req.body;

  // ✅ Validation simple
  if (!organisation || !type || !activite || !message || !email) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  console.log('📥 Données reçues :', req.body);

  try {
    // ✅ Requête SQL sans date_soumission (MySQL la gère automatiquement)
    await db.execute(
      'INSERT INTO collaboration_requests (organisation, type, activite, message, email) VALUES (?, ?, ?, ?, ?)',
      [organisation, type, activite, message, email]
    );

    res.status(201).json({ message: 'Demande enregistrée avec succès.' });
  } catch (err) {
    console.error('❌ Erreur SQL :', err.message);
    res.status(500).json({ error: 'Erreur serveur. Veuillez réessayer plus tard.' });
  }
});

module.exports = router;
