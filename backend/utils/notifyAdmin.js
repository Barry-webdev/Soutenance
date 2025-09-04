module.exports = function notifyAdmin({ organization_name, contact_email, message }) {
  console.log(`🔔 Nouvelle demande de collaboration :
  - Organisation : ${organization_name}
  - Email : ${contact_email}
  - Message : ${message}`);
  
  // Tu peux ajouter ici l’envoi d’email ou une alerte dans le dashboard admin
};
