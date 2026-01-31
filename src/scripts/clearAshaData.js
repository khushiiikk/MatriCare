// Script to clear patient and ASHA worker data from Firestore
// Run this with: node src/scripts/clearAshaData.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDNLC8sfTle8vNLlQXSCuCMF_3Iy8TXQnY",
    authDomain: "maternalhealth-a2e3e.firebaseapp.com",
    projectId: "maternalhealth-a2e3e",
    storageBucket: "maternalhealth-a2e3e.firebasestorage.app",
    messagingSenderId: "1074535925033",
    appId: "1:1074535925033:web:d3e1c8b5e8f9c8b5e8f9c8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
    console.log(`\n🗑️  Clearing ${collectionName} collection...`);
    const snapshot = await getDocs(collection(db, collectionName));

    let count = 0;
    for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        count++;
        console.log(`   Deleted: ${docSnapshot.id}`);
    }

    console.log(`✅ Cleared ${count} documents from ${collectionName}`);
}

async function main() {
    console.log('🚀 Starting data cleanup...\n');

    try {
        await clearCollection('patients');
        await clearCollection('asha_workers');

        console.log('\n✨ Data cleanup completed successfully!');
        console.log('Note: User authentication data (users collection) was preserved.');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }

    process.exit(0);
}

main();
