
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

// Config from .env (Manually pasted here for script execution since we can't easily load .env in pure node script without dotenv)
const firebaseConfig = {
    apiKey: "AIzaSyCdDLXbwxSl06fSSZEoI5s404SIQ0JlYEw",
    authDomain: "matricare-c9ece.firebaseapp.com",
    projectId: "matricare-c9ece",
    storageBucket: "matricare-c9ece.firebasestorage.app",
    messagingSenderId: "6494189528",
    appId: "1:6494189528:web:e326e3f06c97555db4e4ad",
    measurementId: "G-G5N0L4Y3PK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS_TO_WIPE = [
    "users",
    "asha_workers",
    "patients",
    "health_reports"
];

async function wipeDatabase() {
    console.log("⚠️ STARTING DATABASE WIPE...");

    for (const colName of COLLECTIONS_TO_WIPE) {
        console.log(`\nDeleting collection: ${colName}...`);
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(colRef);

            if (snapshot.empty) {
                console.log(`- Collection ${colName} is already empty.`);
                continue;
            }

            const deletePromises = snapshot.docs.map(document => {
                console.log(`  - Deleting doc: ${document.id}`);
                return deleteDoc(doc(db, colName, document.id));
            });

            await Promise.all(deletePromises);
            console.log(`✅ Cleared ${colName} (${snapshot.size} documents deleted)`);
        } catch (error) {
            console.error(`❌ Error clearing ${colName}:`, error.message);
        }
    }

    console.log("\n✨ DATABASE WIPE COMPLETE.");
    process.exit(0);
}

wipeDatabase();
