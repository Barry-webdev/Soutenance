const express = require('express');
const router = express.Router();
const { dbPool } = require('../config/db');

// 🔔 Enregistrement d'une notification
router.post('/notifications', async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const sql = `
      INSERT INTO notifications (userId, title, message, read, createdAt)
      VALUES (?, ?, ?, false, NOW())
    `;
    await dbPool.query(sql, [userId, title, message]);

    res.status(201).json({ message: 'Notification enregistrée avec succès.' });
  } catch (error) {
    console.error('❌ Erreur lors de l’insertion :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 📩 Récupération des notifications d'un utilisateur
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const sql = `
      SELECT id, userId, title, message, read, createdAt
      FROM notifications
      WHERE userId = ?
      ORDER BY createdAt DESC
    `;
    const [rows] = await dbPool.query(sql, [userId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ✅ Marquer une notification comme lue
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `UPDATE notifications SET read = true WHERE id = ?`;
    await dbPool.query(sql, [id]);

    res.status(200).json({ message: 'Notification marquée comme lue.' });
  } catch (error) {
    console.error('❌ Erreur marquage individuel :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ✅ Marquer toutes les notifications comme lues
router.put('/notifications/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    const sql = `UPDATE notifications SET read = true WHERE userId = ?`;
    await dbPool.query(sql, [userId]);

    res.status(200).json({ message: 'Toutes les notifications marquées comme lues.' });
  } catch (error) {
    console.error('❌ Erreur marquage global :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// 🔴 Compter les notifications non lues
router.get('/notifications/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;

    const sql = `SELECT COUNT(*) AS total FROM notifications WHERE userId = ? AND read = false`;
    const [rows] = await dbPool.query(sql, [userId]);

    res.status(200).json({ count: rows[0].total });
  } catch (error) {
    console.error('❌ Erreur lors du comptage des non-lues :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
