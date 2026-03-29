import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Configuration for local emulator or production
function getServiceAccount() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Only use emulators if specifically requested or if no service account is found
        if (process.env.USE_EMULATORS === 'true') {
            const firestoreHost = envContent.match(/FIRESTORE_EMULATOR_HOST="?([^"\n]+)"?/)?.[1];
            const authHost = envContent.match(/FIREBASE_AUTH_EMULATOR_HOST="?([^"\n]+)"?/)?.[1];
            
            if (firestoreHost) {
                process.env.FIRESTORE_EMULATOR_HOST = firestoreHost;
                console.log("Using Firestore Emulator:", firestoreHost);
            }
            if (authHost) {
                process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;
                console.log("Using Auth Emulator:", authHost);
            }
        }

        // Try to get service account from env
        const saMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_JSON='?({[^'\n]+})'?/);
        if (saMatch) {
            try {
                return JSON.parse(saMatch[1]);
            } catch (e) {
                console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON from .env.local");
            }
        }
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        } catch (e) {}
    }
    
    return null;
}

const serviceAccount = getServiceAccount();

if (!admin.apps.length) {
    if (serviceAccount) {
        console.log("Initializing Firebase Admin with Service Account for Project:", serviceAccount.project_id);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
    } else {
        console.log("Initializing Firebase Admin with Default Project ID (health-app-dedf4)");
        admin.initializeApp({
            projectId: "health-app-dedf4" 
        });
    }
}

const db = admin.firestore();
const auth = admin.auth();

const EXPERT_EMAIL = 'expert2@gmail.com';
const EXPERT_UID = 'expert2-uid-seeder-123';
const DUMMY_USER_UID = 'dummy-user-uid-456';

// COURSES array is empty to remove placeholder courses
const COURSES: any[] = [];

async function seed() {
    console.log("--- Initializing Expert & REAL CONTENT Courses Seeding Protocol ---");

    // 1. Create Expert in Auth
    try {
        await auth.createUser({
            uid: EXPERT_UID,
            email: EXPERT_EMAIL,
            password: 'password123',
            displayName: 'Expert User',
            emailVerified: true
        });
        console.log(`Expert user ${EXPERT_EMAIL} created in Auth.`);
    } catch (err: any) {
        if (err.code === 'auth/uid-already-exists' || err.code === 'auth/email-already-exists') {
            console.log("Expert user already exists in Auth.");
        } else {
            console.error("Error creating expert in Auth:", err);
        }
    }

    // 2. Create Expert Profile in Firestore (users collection)
    const userRef = db.collection('users').doc(EXPERT_UID);
    await userRef.set({
        uid: EXPERT_UID,
        email: EXPERT_EMAIL,
        firstName: 'Expert',
        lastName: 'User',
        fullName: 'Expert User',
        username: 'expert_user_verified',
        role: 'doctor',
        verificationStatus: 'verified',
        onboardingComplete: true,
        profileComplete: true,
        points: 5000,
        tier: 'premium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        specialty: 'Internal Medicine',
        bio: 'Dedicated health professional specializing in clinical and holistic wellness.',
        yearsOfExperience: '15',
        institutionName: 'Global Health Institute'
    }, { merge: true });
    console.log("Expert user profile created/updated in Firestore.");

    // 3. Create Expert entry in experts collection (for directory)
    const expertRef = db.collection('experts').doc(EXPERT_UID);
    await expertRef.set({
        id: EXPERT_UID,
        uid: EXPERT_UID,
        name: 'Expert User',
        email: EXPERT_EMAIL,
        type: 'doctor',
        specialty: 'Internal Medicine',
        verificationStatus: 'verified',
        location: 'Lagos, Nigeria',
        rating: 5.0,
        lat: 6.5244,
        lng: 3.3792,
        geohash: 's75c',
        bio: 'Dedicated health professional specializing in clinical and holistic wellness.',
        expertise: ['Herbal Medicine', 'Chronic Pain', 'Hypertension'],
        availability: 'Mon-Fri, 9AM-5PM',
        languages: ['English', 'Yoruba'],
        updatedAt: new Date().toISOString(),
        stats: {
            profileViews: 1240,
            searchAppearances: 850,
            totalBookings: 45,
            aiValidationScore: 98,
            engagementRate: 92
        }
    }, { merge: true });
    console.log("Expert directory entry created/updated.");

    // 4. Remove placeholder courses
    const learningPathsRef = db.collection('learningPaths');
    const existingPaths = await learningPathsRef.get();
    console.log(`Clearing ${existingPaths.size} existing learning paths to prepare for real sync...`);
    for (const doc of existingPaths.docs) {
        await doc.ref.delete();
    }

    // Clear all enrollments
    const enrollmentsRef = db.collection('enrollments');
    const existingEnrolls = await enrollmentsRef.get();
    console.log(`Clearing ${existingEnrolls.size} existing enrollment records...`);
    for (const doc of existingEnrolls.docs) {
        await doc.ref.delete();
    }

    if (COURSES.length > 0) {
        for (const course of COURSES) {
            await learningPathsRef.doc(course.id).set({
                ...course,
                enrolledCount: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log(`${COURSES.length} courses seeded.`);
    } else {
        console.log("Learning paths cleared. Ready for real data sync.");
    }

    // 5. Create demo enrollments and progress (Only if courses exist)
    if (COURSES.length > 0) {
        const enrollmentsRef = db.collection('enrollments');
        
        const enrollmentId = `${DUMMY_USER_UID}_course-herbal-first-aid`;
        await enrollmentsRef.doc(enrollmentId).set({
            userId: DUMMY_USER_UID,
            courseId: 'course-herbal-first-aid',
            progress: 50,
            completedLessons: ['m1:l1', 'm1:l2', 'm2:l3'],
            enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        await learningPathsRef.doc('course-herbal-first-aid').update({
            enrolledCount: 1
        });

        const userProgressRef = db.collection('users').doc(DUMMY_USER_UID).collection('learning_progress').doc('course-herbal-first-aid');
        await userProgressRef.set({
            completedLessons: ['m1:l1', 'm1:l2', 'm2:l3'],
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("Demo enrollment and progress seeded.");
    }

    console.log("--- Seeding/Clearing Complete. ---");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seeding Failed:", err);
    process.exit(1);
});
