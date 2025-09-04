// routes/collaboration.js
const express = require('express');
const router = express.Router();
const db = require('../server'); // Assure-toi que db est bien exporté

// 🔹 POST /api/collaborations : Enregistrer une demande
router.post('/', async (req, res) => {
  const { organization_name, contact_email, message } = req.body;

  if (!organization_name || !contact_email) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  try {
    await db.query(
      'INSERT INTO collaborations (organization_name, contact_email, message, created_at) VALUES (?, ?, ?, NOW())',
      [organization_name.trim(), contact_email.trim(), message || '']
    );

    res.status(201).json({ message: 'Demande enregistrée avec succès.' });
  } catch (error) {
    console.error('❌ Erreur collaboration :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 🔹 GET /api/collaborations : Liste des demandes (pour admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, organization_name, contact_email, message, created_at FROM collaborations ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erreur récupération collaborations :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
