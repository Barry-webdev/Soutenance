// Test pour vérifier toutes les tailles d'images
import fetch from 'node-fetch';

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

async function testAllImageSizes() {
    try {
        console.log('🔍 Test de toutes les tailles d\'images...');
        
        const response = await fetch(`${API_URL}/api/waste/public`);
        const data = await response.json();
        
        if (response.ok) {
            const reportsWithImages = data.data.filter(report => report.images !== null);
            console.log(`📸 ${reportsWithImages.length} signalements avec images trouvés`);
            
            if (reportsWithImages.length > 0) {
                const report = reportsWithImages[0];
                console.log(`\n🖼️ Test du signalement: ${report._id}`);
                console.log(`📝 Description: ${report.description.substring(0, 50)}...`);
                
                const sizes = ['original', 'medium', 'thumbnail'];
                
                for (const size of sizes) {
                    if (report.images[size]) {
                        const imageUrl = `${API_URL}${report.images[size].url}`;
                        console.log(`\n📏 Test taille: ${size.toUpperCase()}`);
                        console.log(`🔗 URL: ${imageUrl}`);
                        
                        try {
                            const imageResponse = await fetch(imageUrl);
                            console.log(`📊 Statut: ${imageResponse.status} ${imageResponse.statusText}`);
                            
                            if (imageResponse.ok) {
                                const contentLength = imageResponse.headers.get('content-length');
                                const contentType = imageResponse.headers.get('content-type');
                                
                                console.log(`✅ ${size} accessible !`);
                                console.log(`📏 Taille fichier: ${contentLength} bytes`);
                                console.log(`🎭 Type MIME: ${contentType}`);
                                console.log(`📐 Dimensions: ${report.images[size].dimensions?.width || 'N/A'}x${report.images[size].dimensions?.height || 'N/A'}`);
                                
                                // Vérifier que la taille correspond
                                if (report.images[size].size && contentLength) {
                                    const dbSize = report.images[size].size;
                                    const actualSize = parseInt(contentLength);
                                    if (dbSize === actualSize) {
                                        console.log(`✅ Taille cohérente (DB: ${dbSize}, Fichier: ${actualSize})`);
                                    } else {
                                        console.log(`⚠️ Taille différente (DB: ${dbSize}, Fichier: ${actualSize})`);
                                    }
                                }
                            } else {
                                console.log(`❌ ${size} non accessible`);
                            }
                        } catch (error) {
                            console.log(`❌ Erreur pour ${size}:`, error.message);
                        }
                    } else {
                        console.log(`⚠️ Taille ${size} manquante dans les données`);
                    }
                }
                
                // Test avec plusieurs signalements
                console.log('\n🔄 Test sur 3 autres signalements...');
                for (let i = 1; i < Math.min(4, reportsWithImages.length); i++) {
                    const testReport = reportsWithImages[i];
                    console.log(`\n📋 Signalement ${i + 1}: ${testReport._id}`);
                    
                    for (const size of sizes) {
                        if (testReport.images[size]) {
                            const imageUrl = `${API_URL}${testReport.images[size].url}`;
                            try {
                                const imageResponse = await fetch(imageUrl, { method: 'HEAD' }); // HEAD pour juste vérifier l'existence
                                if (imageResponse.ok) {
                                    console.log(`✅ ${size}: OK`);
                                } else {
                                    console.log(`❌ ${size}: ${imageResponse.status}`);
                                }
                            } catch (error) {
                                console.log(`❌ ${size}: Erreur`);
                            }
                        }
                    }
                }
                
            } else {
                console.log('ℹ️ Aucun signalement avec image trouvé');
            }
        } else {
            console.log('❌ Erreur:', data);
        }
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

testAllImageSizes();