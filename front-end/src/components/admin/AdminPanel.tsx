// import React, { useState } from 'react';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
// import { useQuery } from "@tanstack/react-query";

// interface WasteReport {
//   id: string;
//   created_at: string;
//   description: string;
//   waste_type: string;
//   status: 'reported' | 'inProgress' | 'completed';
//   latitude: number;
//   longitude: number;
//   address: string;
//   image_url: string;
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   points: number;
//   createdAt: string;
// }

// const AdminPanel: React.FC = () => {
//   const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

//   const fetchReports = async (): Promise<WasteReport[]> => {
//     const response = await fetch("http://localhost:4000/api/waste_reports");
//     if (!response.ok) {
//       throw new Error('Erreur lors de la récupération des signalements');
//     }
//     return response.json();
//   };

//   const fetchUsers = async (): Promise<User[]> => {
//     const response = await fetch("http://localhost:4000/api/users");
//     if (!response.ok) {
//       throw new Error('Erreur lors de la récupération des utilisateurs');
//     }
//     return response.json();
//   };

//   const {
//     data: reports = [],
//     isLoading: isLoadingReports,
//     error: reportsError,
//   } = useQuery({ queryKey: ['waste_reports'], queryFn: fetchReports });

//   const {
//     data: users = [],
//     isLoading: isLoadingUsers,
//     error: usersError,
//   } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

//   const updateReportStatus = (reportId: string, newStatus: WasteReport['status']) => {
//     if (selectedReport && selectedReport.id === reportId) {
//       setSelectedReport({ ...selectedReport, status: newStatus });
//     }
//     // TODO: Appel API PUT/PATCH à implémenter
//   };

//   if (isLoadingReports || isLoadingUsers) return <div>Chargement...</div>;
//   if (reportsError || usersError) return <div>Erreur : {(reportsError || usersError as Error).message}</div>;

//   return (
//     <div className="card">
//       <h2 className="text-xl font-semibold mb-4">Panneau d'administration</h2>
//       <Tabs defaultValue="reports">
//         <TabsList className="flex mb-4">
//           <TabsTrigger value="reports" className="flex-1">Signalements</TabsTrigger>
//           <TabsTrigger value="users" className="flex-1">Utilisateurs</TabsTrigger>
//         </TabsList>

//         {/* TABLEAU DES SIGNALEMENTS */}
//         <TabsContent value="reports" className="p-1">
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white">
//               <thead>
//                 <tr className="border-b">
//                   <th className="py-3 px-4">Date</th>
//                   <th className="py-3 px-4">Description</th>
//                   <th className="py-3 px-4">Localisation</th>
//                   <th className="py-3 px-4">Type</th>
//                   <th className="py-3 px-4">Statut</th>
//                   <th className="py-3 px-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {reports.length === 0 ? (
//                   <tr><td colSpan={6}>Aucun signalement</td></tr>
//                 ) : (
//                   reports.map(report => (
//                     <tr key={report.id}>
//                       <td className="py-3 px-4">{new Date(report.created_at).toLocaleDateString()}</td>
//                       <td className="py-3 px-4">{report.description}</td>
//                       <td className="py-3 px-4">{report.address}</td>
//                       <td className="py-3 px-4">{report.waste_type}</td>
//                       <td className="py-3 px-4">{report.status}</td>
//                       <td className="py-3 px-4">
//                         <button onClick={() => setSelectedReport(report)} className="text-blue-600">Voir</button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* MODAL DÉTAILS SIGNALEMENT */}
//           {selectedReport && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto p-6">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-xl font-semibold">Détails du signalement</h3>
//                   <button onClick={() => setSelectedReport(null)}>X</button>
//                 </div>

//                 <p><strong>Description:</strong> {selectedReport.description}</p>
//                 <p><strong>Type:</strong> {selectedReport.waste_type}</p>
//                 <p><strong>Adresse:</strong> {selectedReport.address}</p>
//                 <p><strong>Coordonnées:</strong> {selectedReport.latitude}, {selectedReport.longitude}</p>
//                 <p><strong>Date:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
//                 <p><strong>Statut:</strong> {selectedReport.status}</p>

//                 <div className="mt-4">
//                   <button onClick={() => updateReportStatus(selectedReport.id, 'reported')} className="mr-2">Signalé</button>
//                   <button onClick={() => updateReportStatus(selectedReport.id, 'inProgress')} className="mr-2">En cours</button>
//                   <button onClick={() => updateReportStatus(selectedReport.id, 'completed')}>Résolu</button>
//                 </div>

//                 <div className="mt-4">
//                   <img src={selectedReport.image_url} alt="Signalement" className="w-full h-64 object-cover rounded" />
//                 </div>
//               </div>
//             </div>
//           )}
//         </TabsContent>

//         {/* TABLEAU DES UTILISATEURS */}
//         <TabsContent value="users" className="p-1">
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white">
//               <thead>
//                 <tr className="border-b">
//                   <th className="py-3 px-4">ID</th>
//                   <th className="py-3 px-4">Nom</th>
//                   <th className="py-3 px-4">Email</th>
//                   <th className="py-3 px-4">Rôle</th>
//                   <th className="py-3 px-4">Points</th>
//                   <th className="py-3 px-4">Inscription</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.length === 0 ? (
//                   <tr><td colSpan={6}>Aucun utilisateur</td></tr>
//                 ) : (
//                   users.map(user => (
//                     <tr key={user.id}>
//                       <td className="py-3 px-4">{user.id}</td>
//                       <td className="py-3 px-4">{user.name}</td>
//                       <td className="py-3 px-4">{user.email}</td>
//                       <td className="py-3 px-4">{user.role}</td>
//                       <td className="py-3 px-4">{user.points}</td>
//                       <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default AdminPanel;


import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { useQuery } from "@tanstack/react-query";

// Interfaces
interface WasteReport {
  id: string;
  created_at: string;
  description: string;
  waste_type: string;
  status: 'reported' | 'inProgress' | 'completed';
  latitude: number;
  longitude: number;
  address: string;
  image_url: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  createdAt: string;
}

// Composant principal
const AdminPanel: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);

  // Fetch Signalements
  const fetchReports = async (): Promise<WasteReport[]> => {
    const response = await fetch("http://localhost:4000/api/waste_reports");
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des signalements');
    }
    return response.json();
  };

  // Fetch Utilisateurs
  const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch("http://localhost:4000/api/users");
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
    return response.json();
  };

  // useQuery
  const {
    data: reports = [],
    isLoading: isLoadingReports,
    error: reportsError,
  } = useQuery({ queryKey: ['waste_reports'], queryFn: fetchReports });

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  // Fonction de mise à jour du statut
  const updateReportStatus = async (reportId: string, newStatus: WasteReport['status']) => {
    try {
      const response = await fetch(`http://localhost:4000/api/waste_reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");

      const updated = await response.json();
      setSelectedReport(updated);
    } catch (error) {
      console.error(error);
      alert("Échec de la mise à jour du statut !");
    }
  };

  // Affichage conditionnel
  if (isLoadingReports || isLoadingUsers) return <div>Chargement...</div>;
  if (reportsError || usersError) return <div>Erreur : {(reportsError || usersError as Error).message}</div>;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Panneau d'administration</h2>
      <Tabs defaultValue="reports">
        <TabsList className="flex mb-4">
          <TabsTrigger value="reports" className="flex-1">Signalements</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Signalements */}
        <TabsContent value="reports" className="p-1">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Localisation</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={6}>Aucun signalement</td></tr>
                ) : (
                  reports.map(report => (
                    <tr key={report.id}>
                      <td className="py-3 px-4">{new Date(report.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{report.description}</td>
                      <td className="py-3 px-4">{report.address}</td>
                      <td className="py-3 px-4">{report.waste_type}</td>
                      <td className="py-3 px-4">{report.status}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setSelectedReport(report)} className="text-blue-600">Voir</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modale */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Détails du signalement</h3>
                  <button onClick={() => setSelectedReport(null)}>X</button>
                </div>

                <p><strong>Description:</strong> {selectedReport.description}</p>
                <p><strong>Type:</strong> {selectedReport.waste_type}</p>
                <p><strong>Adresse:</strong> {selectedReport.address}</p>
                <p><strong>Coordonnées:</strong> {selectedReport.latitude}, {selectedReport.longitude}</p>
                <p><strong>Date:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
                <p><strong>Statut:</strong> {selectedReport.status}</p>

                <div className="mt-4">
                  <button onClick={() => updateReportStatus(selectedReport.id, 'reported')} className="mr-2">Signalé</button>
                  <button onClick={() => updateReportStatus(selectedReport.id, 'inProgress')} className="mr-2">En cours</button>
                  <button onClick={() => updateReportStatus(selectedReport.id, 'completed')}>Résolu</button>
                </div>

                <div className="mt-4">
                  <img src={selectedReport.image_url} alt="Signalement" className="w-full h-64 object-cover rounded" />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Utilisateurs */}
        <TabsContent value="users" className="p-1">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6}>Aucun utilisateur</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="py-3 px-4">{user.id}</td>
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.role}</td>
                      <td className="py-3 px-4">{user.points}</td>
                      <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
