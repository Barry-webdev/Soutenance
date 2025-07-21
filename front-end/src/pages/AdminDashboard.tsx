import React from "react";
import AdminPanel from '../components/admin/AdminPanel';

const AdminDashboard: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Tableau de bord d'administration</h1>
                <p className="text-gray-600 mb-4">
                    Gérez les utilisateurs, visualisez et traitez les signalements de déchets.
                </p>
            </div>

            <AdminPanel />
        </div>
    );
};

export default AdminDashboard;
