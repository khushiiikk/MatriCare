import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { allContent } from "../data/allContent.js";
import fs from "fs";
import path from "path";

// Function to read .env file manually since we don't have dotenv
const getEnv = () => {
    try {
        let envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath) && fs.lstatSync(envPath).isDirectory()) {
            envPath = path.join(envPath, ".env");
        }
        if (!fs.existsSync(envPath)) {
            console.error("Could not find .env file at:", envPath);
            return {};
        }
        const envContent = fs.readFileSync(envPath, "utf8");
        const env = {};
        envContent.split("\n").forEach(line => {
            const [key, ...valueParts] = line.split("=");
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join("=").trim();
            }
        });
        return env;
    } catch (e) {
        console.error("Error reading .env file:", e);
        return {};
    }
};

const env = getEnv();

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log("Starting migration...");
    try {
        for (const [key, content] of Object.entries(allContent)) {
            console.log(`Migrating ${key}...`);
            await setDoc(doc(db, "content", key), content);
            console.log(`Successfully migrated ${key}!`);
        }
        console.log("All content migrated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
