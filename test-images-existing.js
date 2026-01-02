// Test pour vérifier les images des signalements existants
import fetch from 'node-fetch';

const API_URL = 'https://ecopulse-backend-00i3.onrender.com';

async function testExistingImages() {
    try {
        console.log('🔍 Récupération des signalements publics...');
        
        const response = await fetch(`${API_URL}/api/waste/public`);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${data.data.length} signalements trouvés`);
            
            // Chercher des signalements avec images
            const reportsWithImages = data.data.filter(report => report.images !== null);
            console.log(`📸 ${reportsWithImages.length} signalements avec images`);
            
            if (reportsWithImages.length > 0) {
                const report = reportsWithImages[0];
                console.log('🖼️ Premier signalement avec image:', {
                    id: report._id,
                    description: report.description.substring(0, 50) + '...',
                    images: report.images
                });
                
                // Tester l'accès aux images
                if (report.images.thumbnail) {
                    const imageUrl = `${API_URL}${report.images.thumbnail.url}`;
                    console.log('🔗 URL de l\'image:', imageUrl);
                    
                    const imageResponse = await fetch(imageUrl);
                    console.log(`📊 Statut de l'image: ${imageResponse.status} ${imageResponse.statusText}`);
                    
                    if (imageResponse.ok) {
                        console.log('✅ Image accessible !');
                        console.log('📏 Taille:', imageResponse.headers.get('content-length'), 'bytes');
                        console.log('🎭 Type:', imageResponse.headers.get('content-type'));
                    } else {
                        console.log('❌ Image non accessible');
                    }
                }
            } else {
                console.log('ℹ️ Aucun signalement avec image trouvé');
                
                // Afficher quelques signalements sans image
                console.log('📋 Exemples de signalements sans image:');
                data.data.slice(0, 3).forEach((report, index) => {
                    console.log(`  ${index + 1}. ${report.description.substring(0, 50)}... (${report.wasteType})`);
                });
            }
        } else {
            console.log('❌ Erreur:', data);
        }
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

testExistingImages();