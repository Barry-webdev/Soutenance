import { useState } from "react";

interface FormData {
  organization_name: string;
  contact_email: string;
  message: string;
}

export default function CollaborationForm() {
  const [formData, setFormData] = useState<FormData>({
    organization_name: "",
    contact_email: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      setStatus("success");
      setFeedback("✅ Merci ! Votre demande a bien été envoyée.");
      setFormData({ organization_name: "", contact_email: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback("❌ Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex w-screen mt-28 items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 space-y-5"
      >
        {/* Phrase d’intro */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">
            Travaillons ensemble
          </h2>
          <p className="text-gray-600">
            Remplissez ce formulaire pour proposer une collaboration.
          </p>
        </div>

        {/* Organisation */}
        <input
          name="organization_name"
          value={formData.organization_name}
          onChange={handleChange}
          placeholder="Nom de l’organisation *"
          required
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
        />

        {/* Email */}
        <input
          name="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={handleChange}
          placeholder="Email de contact *"
          required
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
        />

        {/* Message */}
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Message (facultatif)"
          rows={4}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
        />

        {/* Bouton */}
        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition ${
            status === "loading"
              ? "bg-green-200 cursor-not-allowed"
              : "bg-green-400 hover:bg-green-500"
          }`}
        >
          {status === "loading" ? "Envoi en cours..." : "Envoyer"}
        </button>

        {/* Feedback dynamique */}
        {feedback && (
          <p
            className={`text-center font-medium ${
              status === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {feedback}
          </p>
        )}
      </form>
    </div>
  );
}
