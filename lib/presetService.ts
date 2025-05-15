import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  Timestamp,
} from "firebase/firestore";
import { ScreenshotPreset, BulkScreenshotPreset } from "./types";

const PRESETS_COLLECTION = "screenshotPresets";
const BULK_PRESETS_COLLECTION = "bulkScreenshotPresets";

// Convert Firestore Timestamp to a serializable format
const convertTimestamps = (data: any) => {
  if (!data) return data;

  Object.keys(data).forEach((key) => {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toMillis();
    } else if (typeof data[key] === "object" && data[key] !== null) {
      data[key] = convertTimestamps(data[key]);
    }
  });

  return data;
};

// Format preset from Firestore
const formatPreset = (doc: DocumentData): ScreenshotPreset => {
  const data = doc.data();
  return {
    id: doc.id,
    ...convertTimestamps(data),
  };
};

// Format bulk preset from Firestore
const formatBulkPreset = (doc: DocumentData): BulkScreenshotPreset => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || "",
    items: data.items || [],
    viewportWidth: data.viewportWidth || 1280,
    viewportHeight: data.viewportHeight || 800,
    createdAt: data.createdAt ? convertTimestamps(data.createdAt) : null,
    updatedAt: data.updatedAt ? convertTimestamps(data.updatedAt) : null,
  };
};

// Get all presets
export const getAllPresets = async (): Promise<ScreenshotPreset[]> => {
  try {
    const q = query(
      collection(db, PRESETS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(formatPreset);
  } catch (error) {
    console.error("Error getting presets:", error);
    throw error;
  }
};

// Get presets by category
export const getPresetsByCategory = async (
  category: string
): Promise<ScreenshotPreset[]> => {
  try {
    const q = query(
      collection(db, PRESETS_COLLECTION),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(formatPreset);
  } catch (error) {
    console.error("Error getting presets by category:", error);
    throw error;
  }
};

// Get a single preset by ID
export const getPresetById = async (
  id: string
): Promise<ScreenshotPreset | null> => {
  try {
    const docRef = doc(db, PRESETS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertTimestamps(docSnap.data()),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting preset:", error);
    throw error;
  }
};

// Create a new preset
export const createPreset = async (
  preset: Omit<ScreenshotPreset, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PRESETS_COLLECTION), {
      ...preset,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating preset:", error);
    throw error;
  }
};

// Update an existing preset
export const updatePreset = async (
  id: string,
  preset: Partial<ScreenshotPreset>
): Promise<void> => {
  try {
    const presetRef = doc(db, PRESETS_COLLECTION, id);
    await updateDoc(presetRef, {
      ...preset,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating preset:", error);
    throw error;
  }
};

// Delete a preset
export const deletePreset = async (id: string): Promise<void> => {
  try {
    const presetRef = doc(db, PRESETS_COLLECTION, id);
    await deleteDoc(presetRef);
  } catch (error) {
    console.error("Error deleting preset:", error);
    throw error;
  }
};

// Create a new bulk screenshot preset
export async function createBulkPreset(
  preset: BulkScreenshotPreset
): Promise<string> {
  const presetData = {
    ...preset,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(db, BULK_PRESETS_COLLECTION),
    presetData
  );
  return docRef.id;
}

// Update an existing bulk screenshot preset
export async function updateBulkPreset(
  preset: BulkScreenshotPreset
): Promise<void> {
  if (!preset.id) {
    throw new Error("Preset ID is required for updates");
  }

  const presetData = {
    ...preset,
    updatedAt: serverTimestamp(),
  };

  // Remove id from the data to be updated
  delete presetData.id;

  const presetRef = doc(db, BULK_PRESETS_COLLECTION, preset.id);
  await updateDoc(presetRef, presetData);
}

// Get all bulk screenshot presets
export async function getAllBulkPresets(): Promise<BulkScreenshotPreset[]> {
  const q = query(
    collection(db, BULK_PRESETS_COLLECTION),
    orderBy("updatedAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(formatBulkPreset);
}

// Get a specific bulk screenshot preset by ID
export async function getBulkPresetById(
  id: string
): Promise<BulkScreenshotPreset | null> {
  const presetRef = doc(db, BULK_PRESETS_COLLECTION, id);
  const presetSnap = await getDoc(presetRef);

  if (presetSnap.exists()) {
    return formatBulkPreset(presetSnap);
  } else {
    return null;
  }
}

// Delete a bulk screenshot preset
export async function deleteBulkPreset(id: string): Promise<void> {
  const presetRef = doc(db, BULK_PRESETS_COLLECTION, id);
  await deleteDoc(presetRef);
}
