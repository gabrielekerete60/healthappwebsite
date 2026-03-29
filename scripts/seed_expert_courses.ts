const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration for local emulator or production
function getServiceAccount() {
    const envPath = path.join(process.cwd(), 'web-platform', '.env.local');
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

const COURSES = [
  {
    id: 'course-herbal-first-aid',
    title: 'Mastering Herbal First Aid',
    description: 'Learn how to use common herbs for immediate first aid and minor injuries.',
    category: 'Herbal',
    icon: 'Leaf',
    authorId: EXPERT_UID,
    authorName: 'Expert User',
    status: 'published',
    totalModules: 3,
    modules: [
      {
        id: 'm1',
        title: 'Intro to Herbal First Aid',
        lessons: [
          { 
            id: 'l1', 
            title: 'Why Herbal First Aid?', 
            duration: '5m', 
            type: 'article',
            content: `
# Why Herbal First Aid?

Herbal first aid is the practice of using plants and natural substances to provide immediate care for minor injuries and ailments. While modern medicine is essential for serious trauma, nature provides powerful tools for everyday mishaps.

## Key Benefits
1. **Accessibility**: Many first aid herbs grow in your backyard or are easily found in kitchens.
2. **Gentleness**: Natural remedies often have fewer side effects for minor skin irritations.
3. **Synergy**: Plants contain complex compounds that work together to support healing.

In this course, we will explore how to safely integrate herbal wisdom into your home care kit.
            `
          },
          { 
            id: 'l2', 
            title: 'Safety Guidelines', 
            duration: '10m', 
            type: 'article',
            content: `
# Safety First: Herbal Guidelines

Before applying any herbal remedy, safety must be your top priority.

## Essential Safety Rules
- **Identification**: Never use a plant unless you are 100% sure of its identity.
- **Patch Test**: Apply a small amount to the inner wrist to check for allergic reactions.
- **Cleanliness**: Ensure all tools and containers are sterilized.
- **Know Your Limits**: Herbal first aid is for *minor* issues. Always seek professional medical help for deep wounds, heavy bleeding, or severe burns.

## When to Call a Doctor
- If the injury shows signs of infection (pus, spreading redness, fever).
- If the pain is severe or worsening.
- If the injury does not show improvement within 24-48 hours.
            `
          }
        ]
      },
      {
        id: 'm2',
        title: 'Treating Cuts and Scrapes',
        lessons: [
          { 
            id: 'l3', 
            title: 'Calendula for Healing', 
            duration: '8m', 
            type: 'article',
            content: `
# Calendula: The Skin's Best Friend

Calendula (Calendula officinalis) is one of the most effective herbs for skin healing.

## Properties
- **Antiseptic**: Helps prevent minor infections.
- **Anti-inflammatory**: Reduces swelling and redness.
- **Vulnerary**: Promotes cell regeneration and wound closing.

## Application
For minor scrapes, use a Calendula-infused oil or salve. Apply a thin layer over the cleaned area twice daily. It is particularly effective for keeping the skin supple as it heals, preventing cracking and scarring.
            `
          },
          { 
            id: 'l4', 
            title: 'Making a Poultice', 
            duration: '12m', 
            type: 'article',
            content: `
# How to Make an Herbal Poultice

A poultice is a soft, moist mass of herbs applied to the body to relieve soreness or inflammation.

## Step-by-Step Guide
1. **Choose Your Herb**: Plaintain or Comfrey are excellent for drawing out impurities or soothing stings.
2. **Prepare the Herb**: Crush fresh leaves or mix dried powdered herbs with a little warm water to form a paste.
3. **Apply**: Spread the paste directly on the skin or wrap it in a clean piece of cheesecloth/muslin first.
4. **Secure**: Use a bandage to hold the poultice in place for 20-60 minutes.

*Note: Do not apply comfrey to deep wounds as it heals the surface too quickly, potentially trapping infection underneath.*
            `
          }
        ]
      },
      {
        id: 'm3',
        title: 'Burn Care',
        lessons: [
          { 
            id: 'l5', 
            title: 'Aloe Vera Properties', 
            duration: '7m', 
            type: 'article',
            content: `
# Aloe Vera for Minor Burns

The gel found inside Aloe Vera leaves is legendary for its cooling and healing effects on minor (first-degree) burns.

## Immediate Action
1. Run cool water over the burn for at least 10 minutes.
2. Slice a fresh Aloe leaf and scoop out the clear gel.
3. Gently apply the gel to the affected area.

## Why it works
Aloe Vera contains acemannan and other polysaccharides that support skin repair and provide a protective barrier against moisture loss.
            `
          },
          { 
            id: 'l6', 
            title: 'Lavender Oil for Burns', 
            duration: '6m', 
            type: 'article',
            content: `
# Lavender Essential Oil

Lavender (Lavandula angustifolia) is one of the few essential oils that can occasionally be used neat (undiluted) on minor burns, though dilution is still generally recommended.

## Benefits
- Rapidly reduces the stinging sensation.
- Helps prevent blistering.
- Calms the nervous system after the shock of an injury.

## How to use
Add 2-3 drops of lavender oil to a teaspoon of aloe vera gel or a carrier oil and apply gently.
            `
          }
        ]
      }
    ]
  },
  {
    id: 'course-hypertension-mgmt',
    title: 'Hypertension Management Protocol',
    description: 'A clinical guide to managing hypertension through lifestyle and evidence-based medicine.',
    category: 'Medical',
    icon: 'Activity',
    authorId: EXPERT_UID,
    authorName: 'Expert User',
    status: 'published',
    totalModules: 3,
    modules: [
      {
        id: 'm1',
        title: 'Understanding Blood Pressure',
        lessons: [
          { 
            id: 'l1', 
            title: 'What is Hypertension?', 
            duration: '10m', 
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/tYbJ-yR3vN8',
            content: `
# Understanding Hypertension

*Please watch the video above for a complete medical breakdown, or read the summary below.*

Hypertension, commonly known as high blood pressure, is a condition where the force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease.

## The Numbers
- **Normal**: Below 120/80 mmHg.
- **Elevated**: 120-129 / <80 mmHg.
- **Stage 1**: 130-139 / 80-89 mmHg.
- **Stage 2**: 140+ / 90+ mmHg.

It is often called the "silent killer" because it typically has no symptoms until serious damage has been done.
            `
          },
          { 
            id: 'l2', 
            title: 'Risk Factors', 
            duration: '15m', 
            type: 'article',
            content: `
# Risk Factors for High Blood Pressure

Several factors can increase your risk of developing hypertension.

## Modifiable Factors (Things you can change)
- **Diet**: High salt intake and low potassium.
- **Physical Activity**: Lack of regular exercise.
- **Weight**: Being overweight or obese.
- **Alcohol/Tobacco**: Excessive use.

## Non-modifiable Factors
- **Age**: Risk increases as you get older.
- **Family History**: Genetics play a significant role.
- **Race**: More common in certain ethnic groups.
            `
          }
        ]
      },
      {
        id: 'm2',
        title: 'Dietary Approaches',
        lessons: [
          { 
            id: 'l3', 
            title: 'The DASH Diet', 
            duration: '20m', 
            type: 'article',
            content: `
# The DASH Diet Explained

DASH stands for **Dietary Approaches to Stop Hypertension**. It is a flexible and balanced eating plan that helps create a heart-healthy eating style for life.

## Core Principles
- Eating vegetables, fruits, and whole grains.
- Including fat-free or low-fat dairy products, fish, poultry, beans, nuts, and vegetable oils.
- Limiting foods that are high in saturated fat, such as fatty meats, full-fat dairy products, and tropical oils such as coconut, palm kernel, and palm oils.
- Limiting sugar-sweetened beverages and sweets.
            `
          },
          { 
            id: 'l4', 
            title: 'Sodium and Potassium', 
            duration: '12m', 
            type: 'article',
            content: `
# The Salt-Potassium Balance

Managing sodium (salt) and potassium intake is crucial for blood pressure control.

## Reduce Sodium
Most people eat too much sodium. Aim for less than 2,300 mg per day, ideally closer to 1,500 mg. Avoid processed foods and read labels carefully.

## Increase Potassium
Potassium helps your body balance the amount of sodium in your cells. Foods rich in potassium include bananas, spinach, beans, and potatoes. 

*Caution: If you have kidney disease, consult your doctor before increasing potassium.*
            `
          }
        ]
      },
      {
        id: 'm3',
        title: 'Medication Adherence',
        lessons: [
          { 
            id: 'l5', 
            title: 'Common Medications', 
            duration: '15m', 
            type: 'article',
            content: `
# Types of Hypertension Medication

If lifestyle changes aren't enough, your doctor may prescribe medication.

## Common Classes
- **Diuretics**: Help your kidneys remove sodium and water from the body.
- **ACE Inhibitors**: Help relax blood vessels by blocking the formation of a natural chemical that narrows blood vessels.
- **Beta Blockers**: Reduce the workload on your heart and open your blood vessels.
- **Calcium Channel Blockers**: Help relax the muscles of your blood vessels.
            `
          },
          { 
            id: 'l6', 
            title: 'Importance of Adherence', 
            duration: '10m', 
            type: 'article',
            content: `
# Staying Consistent with Treatment

Adherence means taking your medication exactly as prescribed by your healthcare provider.

## Tips for Success
- **Routine**: Take your pills at the same time every day (e.g., after brushing teeth).
- **Pill Organizer**: Use a weekly box to keep track.
- **Alarms**: Set phone reminders.
- **Don't Stop**: Never stop taking your medication without consulting your doctor, even if you feel fine. High blood pressure usually has no symptoms!
            `
          }
        ]
      }
    ]
  },
  {
    id: 'course-stress-reduction',
    title: 'Holistic Stress Reduction',
    description: 'Techniques for reducing stress using both psychological and natural methods.',
    category: 'Lifestyle',
    icon: 'Wind',
    authorId: EXPERT_UID,
    authorName: 'Expert User',
    status: 'published',
    totalModules: 3,
    modules: [
      {
        id: 'm1',
        title: 'Breathwork and Mindfulness',
        lessons: [
          { 
            id: 'l1', 
            title: 'Box Breathing Technique', 
            duration: '10m', 
            type: 'article',
            content: `
# Master the Box Breath

Box breathing, also known as four-square breathing, is a powerful technique used by athletes and Navy SEALs to calm the nervous system.

## How to Do It
1. **Inhale**: Breathe in through your nose for 4 seconds.
2. **Hold**: Hold your breath for 4 seconds.
3. **Exhale**: Breathe out through your mouth for 4 seconds.
4. **Hold**: Hold empty for 4 seconds.

Repeat this cycle 4 times. You will notice an immediate drop in your heart rate and a sense of mental clarity.
            `
          },
          { 
            id: 'l2', 
            title: 'Mindfulness in Daily Life', 
            duration: '15m', 
            type: 'article',
            content: `
# Practicing Mindfulness

Mindfulness is the act of being fully present in the moment without judgment.

## Simple Exercises
- **Mindful Eating**: Focus entirely on the taste, texture, and smell of your food for the first three bites.
- **Sensory Grounding**: Identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.
- **Walking Meditation**: Notice the sensation of your feet hitting the ground as you walk.
            `
          }
        ]
      },
      {
        id: 'm2',
        title: 'Adaptogenic Herbs',
        lessons: [
          { 
            id: 'l3', 
            title: 'Ashwagandha for Stress', 
            duration: '12m', 
            type: 'article',
            content: `
# Ashwagandha: The Stress Reliever

Ashwagandha is an adaptogen, meaning it helps the body "adapt" to stress by balancing cortisol levels.

## Scientific Backing
Studies have shown that Ashwagandha can significantly reduce symptoms of anxiety and improve overall well-being.

## Usage
It is typically taken as a powder mixed into warm milk (or water) or in capsule form. Always consult with a health professional to determine the right dosage for your body.
            `
          },
          { 
            id: 'l4', 
            title: 'Holy Basil (Tulsi) Benefits', 
            duration: '10m', 
            type: 'article',
            content: `
# The "Incomparable One": Holy Basil

Tulsi is a revered herb in Ayurvedic medicine for its ability to clear the mind and support emotional resilience.

## Benefits
- Reduces mental fog.
- Supports the immune system during stressful periods.
- Has a calming, slightly spicy aroma.

## How to enjoy
Tulsi is most commonly consumed as a tea. Steep the leaves for 5-10 minutes and enjoy the calming steam as you drink.
            `
          }
        ]
      },
      {
        id: 'm3',
        title: 'Sleep Hygiene',
        lessons: [
          { 
            id: 'l5', 
            title: 'Creating a Sleep Routine', 
            duration: '15m', 
            type: 'article',
            content: `
# Better Sleep, Less Stress

Sleep and stress are deeply connected. Poor sleep increases stress, and high stress prevents sleep.

## Hygiene Checklist
- **Consistency**: Go to bed and wake up at the same time, even on weekends.
- **Environment**: Keep your room cool, dark, and quiet.
- **Screen Time**: Turn off blue-light emitting devices at least 1 hour before bed.
- **Wind-down**: Spend 30 minutes doing a relaxing activity like reading or a warm bath.
            `
          },
          { 
            id: 'l6', 
            title: 'The Role of Magnesium', 
            duration: '8m', 
            type: 'article',
            content: `
# Magnesium: The Relaxation Mineral

Magnesium plays a vital role in over 300 biochemical reactions in the body, including those that regulate sleep and the stress response.

## Food Sources
- Pumpkin seeds
- Spinach
- Almonds
- Dark Chocolate (70%+)

## Why it helps
Magnesium supports the production of GABA, a neurotransmitter that encourages relaxation and sleep.
            `
          }
        ]
      }
    ]
  }
];

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
    } catch (err) {
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
    });
    console.log("Expert user profile created in Firestore.");

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
    });
    console.log("Expert directory entry created.");

    // 4. Remove placeholder courses and seed real ones
    const learningPathsRef = db.collection('learningPaths');
    const existingPaths = await learningPathsRef.get();
    console.log(`Clearing ${existingPaths.size} existing learning paths...`);
    for (const doc of existingPaths.docs) {
        await doc.ref.delete();
    }

    for (const course of COURSES) {
        await learningPathsRef.doc(course.id).set({
            ...course,
            enrolledCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    console.log(`${COURSES.length} real courses with CONTENT seeded.`);

    // 5. Create demo enrollments and progress
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
    console.log("--- Seeding Complete. ---");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seeding Failed:", err);
    process.exit(1);
});
