// services/wordExportService.js
import { 
    Document, 
    Paragraph, 
    Table, 
    TableCell, 
    TableRow, 
    HeadingLevel,
    TextRun,
    AlignmentType,
    WidthType,
    BorderStyle,
    Packer
} from 'docx';
import pkg from 'file-saver';
const { saveAs } = pkg;

export class WordExportService {
    
    /**
     * Exporter les signalements de déchets
     */
    static async exportWasteReports(reports, filters = {}) {
        try {
            const title = "Rapport des Signalements de Déchets";
            const sections = [
                this.createTitleSection(title),
                this.createFiltersSection(filters),
                this.createWasteReportsTable(reports),
                this.createSummarySection(reports)
            ];

            const doc = new Document({
                sections: [{ children: sections }]
            });

            return await this.generateDocumentBuffer(doc);
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
            const title = "Rapport des Demandes de Collaboration";
            const sections = [
                this.createTitleSection(title),
                this.createFiltersSection(filters),
                this.createCollaborationsTable(collaborations),
                this.createCollaborationsSummary(collaborations)
            ];

            const doc = new Document({
                sections: [{ children: sections }]
            });

            return await this.generateDocumentBuffer(doc);
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
            const title = "Rapport Statistique - Waste Management";
            const sections = [
                this.createTitleSection(title),
                this.createStatisticsSection(statsData),
                this.createChartsSummary(statsData)
            ];

            const doc = new Document({
                sections: [{ children: sections }]
            });

            return await this.generateDocumentBuffer(doc);
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
            spacing: { after: 400 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "2E86AB" } }
        });
    }

    /**
     * Créer une section de filtres
     */
    static createFiltersSection(filters) {
        const filterEntries = Object.entries(filters);
        if (filterEntries.length === 0) return new Paragraph({ text: "" });

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
        const headerRow = new TableRow({
            children: [
                this.createHeaderCell("ID"),
                this.createHeaderCell("Description"),
                this.createHeaderCell("Type"),
                this.createHeaderCell("Statut"),
                this.createHeaderCell("Localisation"),
                this.createHeaderCell("Date"),
                this.createHeaderCell("Utilisateur")
            ]
        });

        const dataRows = reports.map(report => 
            new TableRow({
                children: [
                    this.createDataCell(report._id.toString().substring(0, 8)),
                    this.createDataCell(report.description),
                    this.createDataCell(this.formatWasteType(report.wasteType)),
                    this.createDataCell(this.formatStatus(report.status)),
                    this.createDataCell(`${report.location.lat}, ${report.location.lng}`),
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
     * Créer la section des statistiques
     */
    static createStatisticsSection(stats) {
        const sections = [];

        // Statistiques utilisateurs
        sections.push(new Paragraph({
            text: "Statistiques Utilisateurs",
            heading: HeadingLevel.HEADING_2
        }));

        sections.push(new Paragraph({
            children: [
                new TextRun({ text: `Total Utilisateurs: ${stats.users.total}`, bold: true }),
                new TextRun({ text: ` | Citoyens: ${stats.users.citizens}`, break: 1 }),
                new TextRun({ text: ` | Administrateurs: ${stats.users.admins}`, break: 1 }),
                new TextRun({ text: ` | Partenaires: ${stats.users.partners}`, break: 1 })
            ]
        }));

        // Statistiques signalements
        sections.push(new Paragraph({
            text: "Statistiques Signalements",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200 }
        }));

        sections.push(new Paragraph({
            children: [
                new TextRun({ text: `Total Signalements: ${stats.wasteReports.total}`, bold: true }),
                new TextRun({ text: ` | En attente: ${stats.wasteReports.pending}`, break: 1 }),
                new TextRun({ text: ` | Collectés: ${stats.wasteReports.collected}`, break: 1 }),
                new TextRun({ text: ` | Non collectés: ${stats.wasteReports.not_collected || 0}`, break: 1 })
            ]
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
            shading: { fill: "2E86AB" },
            margins: { top: 100, bottom: 100, left: 100, right: 100 }
        });
    }

    /**
     * Créer une cellule de données
     */
    static createDataCell(text) {
        return new TableCell({
            children: [new Paragraph({ text })]
        });
    }

    /**
     * Générer le buffer du document
     */
    static async generateDocumentBuffer(doc) {
        return await Packer.toBuffer(doc);
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