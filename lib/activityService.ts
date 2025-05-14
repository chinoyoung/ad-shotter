import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { User } from "firebase/auth";

export interface ActivityItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  userPhotoURL: string | null;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  details?: Record<string, any>;
  timestamp: any; // Firebase Timestamp
}

export interface ActivityCreate {
  userId: string;
  userEmail: string;
  userName: string | null;
  userPhotoURL: string | null;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  details?: Record<string, any>;
}

/**
 * Creates a new activity record in Firestore
 */
export async function createActivity(
  activity: ActivityCreate
): Promise<string> {
  try {
    const activityRef = await addDoc(collection(db, "activities"), {
      ...activity,
      timestamp: serverTimestamp(),
    });

    return activityRef.id;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

/**
 * Creates a screenshot activity
 */
export async function recordScreenshotActivity(
  user: User,
  url: string,
  selector: string,
  screenshotUrl: string
): Promise<string> {
  return createActivity({
    userId: user.uid,
    userEmail: user.email || "unknown@example.com",
    userName: user.displayName,
    userPhotoURL: user.photoURL,
    action: "took a screenshot",
    targetType: "screenshot",
    targetId: screenshotUrl,
    targetName: new URL(url).hostname,
    details: {
      url,
      selector,
      screenshotUrl,
    },
  });
}

/**
 * Gets recent activities
 */
export async function getRecentActivities(
  count: number = 5
): Promise<ActivityItem[]> {
  try {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(count)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ActivityItem)
    );
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return [];
  }
}

/**
 * Gets recent activities for a specific user
 */
export async function getUserActivities(
  userId: string,
  count: number = 5
): Promise<ActivityItem[]> {
  try {
    const q = query(
      collection(db, "activities"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(count)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ActivityItem)
    );
  } catch (error) {
    console.error("Error getting user activities:", error);
    return [];
  }
}

/**
 * Gets recent screenshot activities
 */
export async function getScreenshotActivities(
  count: number = 20
): Promise<ActivityItem[]> {
  try {
    const q = query(
      collection(db, "activities"),
      where("targetType", "==", "screenshot"),
      orderBy("timestamp", "desc"),
      limit(count)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ActivityItem)
    );
  } catch (error) {
    console.error("Error getting screenshot activities:", error);
    return [];
  }
}
