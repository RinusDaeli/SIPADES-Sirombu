import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Aset,
  PermohonanVerifikasi,
  PengesahanLaporan,
  Desa,
  User,
  KecamatanProfile,
} from '../types';
import {
  INITIAL_DESA_LIST,
  INITIAL_USERS,
  INITIAL_KECAMATAN_PROFILE,
  INITIAL_ASETS,
  INITIAL_VERIFIKASI,
  INITIAL_PENGESAHAN,
} from '../data/initialData';

// Utility to remove undefined values because Firestore rejects undefined
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ==================== SUBSCRIPTIONS (REAL-TIME MULTI-DEVICE SYNC) ====================

export function subscribeAsets(callback: (asets: Aset[]) => void): () => void {
  try {
    const colRef = collection(db, 'asets');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Aset[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as Aset;
          if (data && data.id) {
            list.push(data);
          }
        });
        // Sort newest first
        list.sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
        callback(list);
      },
      (err) => {
        console.warn('[Firestore] subscribeAsets error:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Failed to subscribe asets:', e);
    return () => {};
  }
}

export function subscribeVerifikasi(callback: (list: PermohonanVerifikasi[]) => void): () => void {
  try {
    const colRef = collection(db, 'verifikasiList');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: PermohonanVerifikasi[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as PermohonanVerifikasi;
          if (data && data.id) {
            list.push(data);
          }
        });
        list.sort((a, b) => new Date(b?.tanggalPengajuan || 0).getTime() - new Date(a?.tanggalPengajuan || 0).getTime());
        callback(list);
      },
      (err) => {
        console.warn('[Firestore] subscribeVerifikasi error:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Failed to subscribe verifikasi:', e);
    return () => {};
  }
}

export function subscribePengesahan(callback: (list: PengesahanLaporan[]) => void): () => void {
  try {
    const colRef = collection(db, 'pengesahanList');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: PengesahanLaporan[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as PengesahanLaporan;
          if (data && data.id) {
            list.push(data);
          }
        });
        callback(list);
      },
      (err) => {
        console.warn('[Firestore] subscribePengesahan error:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Failed to subscribe pengesahan:', e);
    return () => {};
  }
}

export function subscribeDesas(callback: (desas: Desa[]) => void): () => void {
  try {
    const colRef = collection(db, 'desas');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Desa[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Desa;
            if (data && data.id) {
              list.push(data);
            }
          });
          list.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
          if (list.length > 0) {
            callback(list);
          }
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeDesas error:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Failed to subscribe desas:', e);
    return () => {};
  }
}

export function subscribeKecamatanProfile(callback: (profile: KecamatanProfile) => void): () => void {
  try {
    const docRef = doc(db, 'system', 'kecamatanProfile');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as KecamatanProfile;
          if (data && data.namaKecamatan) {
            callback(data);
          }
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeKecamatanProfile error:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Failed to subscribe kecamatan profile:', e);
    return () => {};
  }
}

export function subscribeUsers(callback: (users: User[]) => void): () => void {
  try {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as User;
            if (data && data.id) {
              list.push(data);
            }
          });
          if (list.length > 0) {
            callback(list);
          }
        }
      },
      (err) => {
        console.warn('[Firestore] subscribeUsers error:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Failed to subscribe users:', e);
    return () => {};
  }
}

// ==================== CLOUD MUTATION FUNCTIONS ====================

export async function saveAsetToCloud(aset: Aset): Promise<void> {
  try {
    const cleaned = cleanForFirestore(aset);
    const docRef = doc(db, 'asets', aset.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveAsetToCloud notice:', err);
  }
}

export async function deleteAsetFromCloud(asetId: string): Promise<void> {
  try {
    const docRef = doc(db, 'asets', asetId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] deleteAsetFromCloud notice:', err);
  }
}

export async function saveVerifikasiToCloud(verif: PermohonanVerifikasi): Promise<void> {
  try {
    const cleaned = cleanForFirestore(verif);
    const docRef = doc(db, 'verifikasiList', verif.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveVerifikasiToCloud notice:', err);
  }
}

export async function deleteVerifikasiFromCloud(verifId: string): Promise<void> {
  try {
    const docRef = doc(db, 'verifikasiList', verifId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] deleteVerifikasiFromCloud notice:', err);
  }
}

export async function savePengesahanToCloud(pengesahan: PengesahanLaporan): Promise<void> {
  try {
    const cleaned = cleanForFirestore(pengesahan);
    const docRef = doc(db, 'pengesahanList', pengesahan.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] savePengesahanToCloud notice:', err);
  }
}

export async function saveDesaToCloud(desa: Desa): Promise<void> {
  try {
    const cleaned = cleanForFirestore(desa);
    const docRef = doc(db, 'desas', desa.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveDesaToCloud notice:', err);
  }
}

export async function saveKecamatanProfileToCloud(profile: KecamatanProfile): Promise<void> {
  try {
    const cleaned = cleanForFirestore(profile);
    const docRef = doc(db, 'system', 'kecamatanProfile');
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveKecamatanProfileToCloud notice:', err);
  }
}

export async function saveUserToCloud(user: User): Promise<void> {
  try {
    const cleaned = cleanForFirestore(user);
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveUserToCloud notice:', err);
  }
}

export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] deleteUserFromCloud notice:', err);
  }
}

// ==================== INITIAL BOOTSTRAP / SEEDING ====================

export async function bootstrapFirestoreIfEmpty(): Promise<void> {
  try {
    const desasSnap = await getDocs(collection(db, 'desas'));
    if (desasSnap.empty) {
      console.log('[Firestore] Bootstrapping initial database to Google Cloud Firestore...');
      const batch = writeBatch(db);

      // Seed Desas
      for (const desa of INITIAL_DESA_LIST) {
        const ref = doc(db, 'desas', desa.id);
        batch.set(ref, cleanForFirestore(desa));
      }

      // Seed Users
      for (const user of INITIAL_USERS) {
        const ref = doc(db, 'users', user.id);
        batch.set(ref, cleanForFirestore(user));
      }

      // Seed Kecamatan Profile
      const kecRef = doc(db, 'system', 'kecamatanProfile');
      batch.set(kecRef, cleanForFirestore(INITIAL_KECAMATAN_PROFILE));

      // Seed initial verifikasi if any
      for (const v of INITIAL_VERIFIKASI) {
        const ref = doc(db, 'verifikasiList', v.id);
        batch.set(ref, cleanForFirestore(v));
      }

      // Seed initial pengesahan if any
      for (const p of INITIAL_PENGESAHAN) {
        const ref = doc(db, 'pengesahanList', p.id);
        batch.set(ref, cleanForFirestore(p));
      }

      // Seed initial asets if any
      for (const a of INITIAL_ASETS) {
        const ref = doc(db, 'asets', a.id);
        batch.set(ref, cleanForFirestore(a));
      }

      await batch.commit();
      console.log('[Firestore] Seeding complete! All 25 desas & admin credentials are live in Cloud Firestore.');
    }
  } catch (error) {
    console.warn('[Firestore] Bootstrap check note:', error);
  }
}

/**
 * Force push and synchronize all current app state into Google Cloud Firestore database.
 */
export async function pushAllToFirestore(payload: {
  desas?: Desa[];
  users?: User[];
  asets?: Aset[];
  verifikasiList?: PermohonanVerifikasi[];
  pengesahanList?: PengesahanLaporan[];
  kecamatanProfile?: KecamatanProfile;
}): Promise<{ success: boolean; count: number; message: string }> {
  try {
    let writeCount = 0;

    // Push Ases in chunks if necessary
    if (Array.isArray(payload.asets) && payload.asets.length > 0) {
      for (const aset of payload.asets) {
        if (aset && aset.id) {
          const docRef = doc(db, 'asets', aset.id);
          await setDoc(docRef, cleanForFirestore(aset), { merge: true });
          writeCount++;
        }
      }
    }

    // Push Desas
    if (Array.isArray(payload.desas) && payload.desas.length > 0) {
      for (const d of payload.desas) {
        if (d && d.id) {
          const docRef = doc(db, 'desas', d.id);
          await setDoc(docRef, cleanForFirestore(d), { merge: true });
          writeCount++;
        }
      }
    }

    // Push Users
    if (Array.isArray(payload.users) && payload.users.length > 0) {
      for (const u of payload.users) {
        if (u && u.id) {
          const docRef = doc(db, 'users', u.id);
          await setDoc(docRef, cleanForFirestore(u), { merge: true });
          writeCount++;
        }
      }
    }

    // Push Kecamatan Profile
    if (payload.kecamatanProfile) {
      const kecRef = doc(db, 'system', 'kecamatanProfile');
      await setDoc(kecRef, cleanForFirestore(payload.kecamatanProfile), { merge: true });
      writeCount++;
    }

    // Push Verifikasi
    if (Array.isArray(payload.verifikasiList) && payload.verifikasiList.length > 0) {
      for (const v of payload.verifikasiList) {
        if (v && v.id) {
          const vRef = doc(db, 'verifikasiList', v.id);
          await setDoc(vRef, cleanForFirestore(v), { merge: true });
          writeCount++;
        }
      }
    }

    // Push Pengesahan
    if (Array.isArray(payload.pengesahanList) && payload.pengesahanList.length > 0) {
      for (const p of payload.pengesahanList) {
        if (p && p.id) {
          const pRef = doc(db, 'pengesahanList', p.id);
          await setDoc(pRef, cleanForFirestore(p), { merge: true });
          writeCount++;
        }
      }
    }

    return {
      success: true,
      count: writeCount,
      message: `Berhasil menghubungkan dan menyinkronkan ${writeCount} dokumen ke Cloud Firestore!`,
    };
  } catch (error: any) {
    console.error('[Firestore] Push error:', error);
    return {
      success: false,
      count: 0,
      message: `Gagal menyinkronkan ke Firestore: ${error?.message || 'Koneksi error'}`,
    };
  }
}
