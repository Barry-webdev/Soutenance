import { 
    Document, 
    Packer, 
    Paragraph, 
    TextRun,
    Table,
    TableCell,
    TableRow,
    HeadingLevel,
    AlignmentType,
    WidthType,
    BorderStyle
} from 'docx';

class WordExportService {
    
    /**
     * Exporter les signalements de déchets
     */
    static async exportWasteReports(reports, filters = {}) {
        try {
            console.log('📝 Génération document Word pour signalements...');
            
            const title = "Rapport des Signalements de Déchets";
            const children = [
                this.createTitleSection(title),
                this.createFiltersSection(filters),
                this.createWasteReportsTable(reports),
                this.createWasteSummarySection(reports)
            ];

            // Filtrer les éléments vides
            const filteredChildren = children.filter(child => child !== null);

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: filteredChildren
                }]
            });

            const buffer = await Packer.toBuffer(doc);
            console.log(`✅ Document généré - Taille: ${buffer.length} bytes`);
            
            return buffer;
        } catch (error) {
            console.error('❌ Erreur export signalements:', error);
            throw error;
        }
    }

    /**
     * Exporter les demandes de collaboration
     */
    static async exportCollaborations(collaborations, filters = {}) {
        try {
            console.log('📝 Génération document Word pour collaborations...');
            
            const title = "Rapport des Demandes de Collaboration";
            const children = [
                this.createTitleSection(title),
                this.createFiltersSection(filters),
                this.createCollaborationsTable(collaborations),
                this.createCollaborationsSummary(collaborations)
            ];

            // Filtrer les éléments vides
            const filteredChildren = children.filter(child => child !== null);

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: filteredChildren
                }]
            });

            const buffer = await Packer.toBuffer(doc);
            console.log(`✅ Document collaborations généré - Taille: ${buffer.length} bytes`);
            
            return buffer;
        } catch (error) {
            console.error('❌ Erreur export collaborations:', error);
            throw error;
        }
    }

    /**
     * Exporter les statistiques
     */
    static async exportStatistics(statsData) {
        try {
            console.log('📝 Génération document Word pour statistiques...');
            
            const title = "Rapport Statistique - Waste Management";
            const children = [
                this.createTitleSection(title),
                ...this.createStatisticsSection(statsData)
            ];

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: children
                }]
            });

            const buffer = await Packer.toBuffer(doc);
            console.log(`✅ Document statistiques généré - Taille: ${buffer.length} bytes`);
            
            return buffer;
        } catch (error) {
            console.error('❌ Erreur export statistiques:', error);
            throw error;
        }
    }

    /**
     * Créer une section de titre
     */
    static createTitleSection(title) {
        return new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        });
    }

    /**
     * Créer une section de filtres
     */
    static createFiltersSection(filters) {
        const filterEntries = Object.entries(filters);
        if (filterEntries.length === 0) {
            return null;
        }

        const filterText = filterEntries.map(([key, value]) => 
            `${this.formatFilterKey(key)}: ${value}`
        ).join(', ');

        return new Paragraph({
            children: [
                new TextRun({
                    text: "Filtres appliqués: ",
                    bold: true
                }),
                new TextRun({
                    text: filterText
                })
            ],
            spacing: { after: 200 }
        });
    }

    /**
     * Créer le tableau des signalements
     */
    static createWasteReportsTable(reports) {
        if (!reports || reports.length === 0) {
            return new Paragraph({
                text: "Aucun signalement trouvé pour les critères sélectionnés.",
                alignment: AlignmentType.CENTER
            });
        }

        const headerRow = new TableRow({
            children: [
                this.createHeaderCell("Description"),
                this.createHeaderCell("Type"),
                this.createHeaderCell("Statut"),
                this.createHeaderCell("Date"),
                this.createHeaderCell("Utilisateur")
            ]
        });

        const dataRows = reports.map(report => 
            new TableRow({
                children: [
                    this.createDataCell(report.description || 'N/A'),
                    this.createDataCell(this.formatWasteType(report.wasteType)),
                    this.createDataCell(this.formatStatus(report.status)),
                    this.createDataCell(new Date(report.createdAt).toLocaleDateString('fr-FR')),
                    this.createDataCell(report.userId?.name || 'N/A')
                ]
            })
        );

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
            margins: { top: 100, bottom: 100 }
        });
    }

    /**
     * Créer le tableau des collaborations
     */
    static createCollaborationsTable(collaborations) {
        if (!collaborations || collaborations.length === 0) {
            return new Paragraph({
                text: "Aucune demande de collaboration trouvée.",
                alignment: AlignmentType.CENTER
            });
        }

        const headerRow = new TableRow({
            children: [
                this.createHeaderCell("Organisation"),
                this.createHeaderCell("Type"),
                this.createHeaderCell("Contact"),
                this.createHeaderCell("Email"),
                this.createHeaderCell("Statut"),
                this.createHeaderCell("Date Soumission")
            ]
        });

        const dataRows = collaborations.map(collab => 
            new TableRow({
                children: [
                    this.createDataCell(collab.organizationName),
                    this.createDataCell(collab.type),
                    this.createDataCell(collab.contactPerson),
                    this.createDataCell(collab.email),
                    this.createDataCell(this.formatStatus(collab.status)),
                    this.createDataCell(new Date(collab.createdAt).toLocaleDateString('fr-FR'))
                ]
            })
        );

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows]
        });
    }

    /**
     * Créer la section de résumé pour les signalements
     */
    static createWasteSummarySection(reports) {
        if (!reports || reports.length === 0) {
            return new Paragraph({
                text: "Résumé: Aucun signalement à afficher.",
                alignment: AlignmentType.CENTER
            });
        }

        const total = reports.length;
        const byStatus = reports.reduce((acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
        }, {});

        const byType = reports.reduce((acc, report) => {
            acc[report.wasteType] = (acc[report.wasteType] || 0) + 1;
            return acc;
        }, {});

        return new Paragraph({
            children: [
                new TextRun({ text: "Résumé: ", bold: true }),
                new TextRun({ text: `Total: ${total} signalements`, break: 1 }),
                new TextRun({ text: `Statuts: ${JSON.stringify(byStatus)}`, break: 1 }),
                new TextRun({ text: `Types: ${JSON.stringify(byType)}`, break: 1 })
            ],
            spacing: { before: 200 }
        });
    }

    /**
     * Créer la section de résumé pour les collaborations
     */
    static createCollaborationsSummary(collaborations) {
        if (!collaborations || collaborations.length === 0) {
            return new Paragraph({
                text: "Résumé: Aucune collaboration à afficher.",
                alignment: AlignmentType.CENTER
            });
        }

        const total = collaborations.length;
        const byStatus = collaborations.reduce((acc, collab) => {
            acc[collab.status] = (acc[collab.status] || 0) + 1;
            return acc;
        }, {});

        const byType = collaborations.reduce((acc, collab) => {
            acc[collab.type] = (acc[collab.type] || 0) + 1;
            return acc;
        }, {});

        return new Paragraph({
            children: [
                new TextRun({ text: "Résumé Collaborations: ", bold: true }),
                new TextRun({ text: `Total: ${total} demandes`, break: 1 }),
                new TextRun({ text: `Statuts: ${JSON.stringify(byStatus)}`, break: 1 }),
                new TextRun({ text: `Types: ${JSON.stringify(byType)}`, break: 1 })
            ],
            spacing: { before: 200 }
        });
    }

    /**
     * Créer la section des statistiques
     */
    static createStatisticsSection(stats) {
        const sections = [];

        // Statistiques utilisateurs
        sections.push(new Paragraph({
            text: "Statistiques Utilisateurs",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 }
        }));

        sections.push(new Paragraph({
            text: `• Total Utilisateurs: ${stats.users?.total || 0}`
        }));

        sections.push(new Paragraph({
            text: `• Citoyens: ${stats.users?.citizens || 0}`
        }));

        sections.push(new Paragraph({
            text: `• Administrateurs: ${stats.users?.admins || 0}`
        }));

        sections.push(new Paragraph({
            text: `• Partenaires: ${stats.users?.partners || 0}`,
            spacing: { after: 200 }
        }));

        // Statistiques signalements
        sections.push(new Paragraph({
            text: "Statistiques Signalements",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 }
        }));

        sections.push(new Paragraph({
            text: `• Total Signalements: ${stats.wasteReports?.total || 0}`
        }));

        sections.push(new Paragraph({
            text: `• En attente: ${stats.wasteReports?.pending || 0}`
        }));

        sections.push(new Paragraph({
            text: `• Collectés: ${stats.wasteReports?.collected || 0}`,
            spacing: { after: 200 }
        }));

        // Statistiques collaborations
        sections.push(new Paragraph({
            text: "Statistiques Collaborations",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 }
        }));

        sections.push(new Paragraph({
            text: `• Total Collaborations: ${stats.collaborations?.total || 0}`
        }));

        sections.push(new Paragraph({
            text: `• En attente: ${stats.collaborations?.pending || 0}`
        }));

        sections.push(new Paragraph({
            text: `• Approuvées: ${stats.collaborations?.approved || 0}`
        }));

        return sections;
    }

    /**
     * Créer une cellule d'en-tête
     */
    static createHeaderCell(text) {
        return new TableCell({
            children: [new Paragraph({ 
                text, 
                alignment: AlignmentType.CENTER 
            })],
            shading: { fill: "E0E0E0" }
        });
    }

    /**
     * Créer une cellule de données
     */
    static createDataCell(text) {
        return new TableCell({
            children: [new Paragraph({ text: text || 'N/A' })]
        });
    }

    /**
     * Formater les types de déchets
     */
    static formatWasteType(type) {
        const types = {
            'plastique': 'Plastique',
            'verre': 'Verre',
            'métal': 'Métal',
            'organique': 'Organique',
            'papier': 'Papier',
            'dangereux': 'Dangereux',
            'autre': 'Autre'
        };
        return types[type] || type;
    }

    /**
     * Formater les statuts
     */
    static formatStatus(status) {
        const statusMap = {
            'pending': 'En attente',
            'collected': 'Collecté',
            'not_collected': 'Non collecté',
            'approved': 'Approuvé',
            'rejected': 'Rejeté'
        };
        return statusMap[status] || status;
    }

    /**
     * Formater les clés de filtre
     */
    static formatFilterKey(key) {
        const keyMap = {
            'startDate': 'Date début',
            'endDate': 'Date fin',
            'status': 'Statut',
            'wasteType': 'Type déchet',
            'type': 'Type collaboration'
        };
        return keyMap[key] || key;
    }
}

export { WordExportService };
