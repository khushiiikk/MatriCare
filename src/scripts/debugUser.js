import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from "fs";
import path from "path";

const getEnv = () => {
    try {
        let envPath = path.resolve(process.cwd(), ".env");
        const envContent = fs.readFileSync(envPath, "utf8");
        const env = {};
        envContent.split("\n").forEach(line => {
            const [key, ...valueParts] = line.split("=");
            if (key && valueParts.length > 0) env[key.trim()] = valueParts.join("=").trim();
        });
        return env;
    } catch (e) { return {}; }
};

const env = getEnv();
const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findUser(mobile) {
    const collections = ["patients", "asha_workers", "users"];
    const fields = ["mobile", "phone", "phoneNumber", "userMobile"];
    const normalized = mobile.replace(/\D/g, '').slice(-10);
    const variants = [mobile, normalized, `+91${normalized}`, `91${normalized}`];

    console.log(`Searching for variants: ${variants.join(", ")}`);

    for (const collName of collections) {
        console.log(`Checking collection: ${collName}...`);
        for (const field of fields) {
            try {
                const q = query(collection(db, collName), where(field, "in", variants));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    console.log(`✅ FOUND in ${collName} [field: ${field}]`);
                    snap.docs.forEach(doc => console.log(JSON.stringify({ id: doc.id, ...doc.data() }, null, 2)));
                }
            } catch (e) {
                console.warn(`Error checking ${collName}.${field}: ${e.message}`);
            }
        }
    }
}

findUser("8448360420").then(() => process.exit(0));
