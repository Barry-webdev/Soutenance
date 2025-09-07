const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ✅ Chemin correct


// ✅ Récupérer les notifications d’un utilisateur
router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // 🔍 Vérifier si l'utilisateur existe
    const [user] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // 📩 Récupérer les notifications
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Erreur notifications :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
