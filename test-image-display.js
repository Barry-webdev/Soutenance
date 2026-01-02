// Test pour vérifier l'affichage des images récentes
import fetch from 'node-fetch';

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

async function testRecentImages() {
    try {
        console.log('🔍 Test des images récentes...');
        
        const response = await fetch(`${API_URL}/api/waste/public`);
        const data = await response.json();
        
        if (response.ok) {
            // Prendre les 5 signalements les plus récents avec images
            const recentReports = data.data
                .filter(report => report.images !== null)
                .slice(0, 5);
            
            console.log(`📸 ${recentReports.length} signalements récents avec images trouvés`);
            
            for (let i = 0; i < recentReports.length; i++) {
                const report = recentReports[i];
                console.log(`\n📋 Signalement ${i + 1}: ${report._id}`);
                console.log(`📅 Créé: ${new Date(report.createdAt).toLocaleString()}`);
                console.log(`📝 Description: ${report.description.substring(0, 50)}...`);
                
                if (report.images) {
                    const sizes = ['thumbnail', 'medium', 'original'];
                    
                    for (const size of sizes) {
                        if (report.images[size]) {
                            const imageUrl = `${API_URL}${report.images[size].url}`;
                            console.log(`\n🖼️ Test ${size.toUpperCase()}:`);
                            console.log(`🔗 URL: ${imageUrl}`);
                            
                            try {
                                const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
                                if (imageResponse.ok) {
                                    console.log(`✅ ${size}: Accessible (${imageResponse.status})`);
                                } else {
                                    console.log(`❌ ${size}: Non accessible (${imageResponse.status})`);
                                }
                            } catch (error) {
                                console.log(`❌ ${size}: Erreur - ${error.message}`);
                            }
                        } else {
                            console.log(`⚠️ ${size}: Manquant`);
                        }
                    }
                } else {
                    console.log('⚠️ Pas d\'images dans ce signalement');
                }
            }
        } else {
            console.log('❌ Erreur API:', data);
        }
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

testRecentImages();