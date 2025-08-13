import React from "react";
import CollaborationForm from "../components/Collaboration";

export default function CollaborationPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Formulaire de collaboration</h1>
      <p>
        Veuillez remplir le formulaire ci-dessous pour soumettre votre demande
        de collaboration. Nous vous répondrons dans les plus brefs délais.
      </p>
      
      {/* On affiche le formulaire */}
      <CollaborationForm />
    </div>
  );
}
