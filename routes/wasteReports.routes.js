const express = require('express');
const router = express.Router();

// ✅ Connexions
const { dbPool } = require('../config/db');

// ==============================
// 🗑️ Enregistrement des signalements
// ==============================

// ➕ Route complète avec userId
router.post('/waste_reports', async (req, res) => {
  try {
    const {
      userId,
      description,
      wasteType,
      status = 'en_attente',
      address,
      latitude,
      longitude,
      imageUrl
    } = req.body;

    const sql = `
      INSERT INTO waste_reports 
      (userId, description, wasteType, status, address, latitude, longitude, imageUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      userId,
      description,
      wasteType,
      status,
      address,
      latitude,
      longitude,
      imageUrl
    ];

    await dbPool.query(sql, values);
    res.status(201).json({ message: 'Signalement enregistré avec succès.' });
  } catch (err) {
    console.error('❌ Erreur lors de l’enregistrement du signalement :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ➕ Route simplifiée sans userId
router.post('/waste_report', async (req, res) => {
  try {
    const {
      description,
      wasteType,
      status = 'en_attente',
      address,
      latitude,
      longitude,
      imageUrl
    } = req.body;

    const sql = `
      INSERT INTO waste_reports 
      (description, wasteType, status, address, latitude, longitude, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      description,
      wasteType,
      status,
      address,
      latitude,
      longitude,
      imageUrl
    ];

    await dbPool.query(sql, values);
    res.status(200).json({ message: 'Signalement enregistré avec succès !' });
  } catch (err) {
    console.error('❌ Erreur lors de l’enregistrement :', err);
    res.status(500).json({ error: 'Erreur serveur lors de l’enregistrement.' });
  }
});

// ✅ PATCH : mise à jour du statut
router.patch("/waste_reports/:id/status", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await dbPool.query("UPDATE waste_reports SET status = ? WHERE id = ?", [status, id]);
    const [rows] = await dbPool.query("SELECT * FROM waste_reports WHERE id = ?", [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔍 Récupération des signalements
router.get('/waste_reports', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        userId,
        description,
        wasteType AS waste_type,
        status,
        address,
        latitude,
        longitude,
        imageUrl AS image_url,
        createdAt AS created_at
      FROM waste_reports
      ORDER BY createdAt DESC
    `;
    const [rows] = await dbPool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des signalements :", err.message);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération.' });
  }
});

module.exports = router;
