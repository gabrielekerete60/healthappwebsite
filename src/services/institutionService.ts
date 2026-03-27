import { db, auth } from '@/lib/firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, addDoc, serverTimestamp, arrayUnion, arrayRemove, orderBy 
} from 'firebase/firestore';
import { Institution } from '@/types/institution';
import { PublicExpert } from '@/types/expert';

const INSTITUTIONS_COLLECTION = 'institutions';
const STAFF_INVITES_COLLECTION = 'staff_invites';

export const institutionService = {
  /**
   * Registers or updates an institutional node.
   */
  setupInstitution: async (uid: string, data: Partial<Institution>) => {
    const instRef = doc(db, INSTITUTIONS_COLLECTION, uid);
    await setDoc(instRef, {
      ...data,
      id: uid,
      verified: false,
      verificationStatus: 'pending',
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Link user profile to institution
    await updateDoc(doc(db, 'users', uid), {
      role: 'hospital',
      institutionId: uid,
      onboardingComplete: true
    });
  },

  /**
   * Sends an invitation to an expert to join the institutional node.
   */
  inviteExpert: async (institutionId: string, institutionName: string, expertEmail: string) => {
    await addDoc(collection(db, STAFF_INVITES_COLLECTION), {
      institutionId,
      institutionName,
      expertEmail: expertEmail.toLowerCase().trim(),
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  /**
   * Fetches linked experts for an institution.
   */
  getLinkedExperts: async (institutionId: string): Promise<PublicExpert[]> => {
    const q = query(
      collection(db, 'experts'),
      where('institutionId', '==', institutionId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublicExpert));
  },

  /**
   * Removes an expert from the institution.
   */
  unlinkExpert: async (expertId: string) => {
    const expertRef = doc(db, 'experts', expertId);
    await updateDoc(expertRef, {
      institutionId: null,
      institutionName: null
    });
  },

  /**
   * Updates institutional departments.
   */
  updateDepartments: async (institutionId: string, departments: any[]) => {
    const instRef = doc(db, INSTITUTIONS_COLLECTION, institutionId);
    await updateDoc(instRef, {
      departments,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Updates institutional promotion and featured status.
   */
  updatePromotion: async (institutionId: string, promotionConfig: any, featured: boolean) => {
    const instRef = doc(db, INSTITUTIONS_COLLECTION, institutionId);
    await updateDoc(instRef, {
      promotionConfig,
      featured,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Fetches all appointments for experts belonging to this institution.
   */
  getInstitutionalAppointments: async (institutionId: string): Promise<any[]> => {
    // 1. Get all experts in this institution
    const expertsQ = query(collection(db, 'experts'), where('institutionId', '==', institutionId));
    const expertsSnap = await getDocs(expertsQ);
    const expertIds = expertsSnap.docs.map(doc => doc.id);

    if (expertIds.length === 0) return [];

    // 2. Get all appointments for these experts
    // Firestore 'in' queries are limited to 10 items, but for this MVP it works
    const appointmentsQ = query(
      collection(db, 'appointments'), 
      where('expertId', 'in', expertIds.slice(0, 10)),
      orderBy('date', 'desc')
    );
    const appointmentsSnap = await getDocs(appointmentsQ);
    return appointmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export async function getInstitutionById(id: string): Promise<Institution | undefined> {
  try {
    const docRef = doc(db, INSTITUTIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Institution;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching institution:", error);
    return undefined;
  }
}

export async function getInstitutions(): Promise<Institution[]> {
  try {
    const snapshot = await getDocs(collection(db, INSTITUTIONS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Institution));
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return [];
  }
}
