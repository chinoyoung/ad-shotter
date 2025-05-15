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
  doc,
  deleteDoc,
  getDoc,
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
  screenshotUrl: string,
  screenshotResult?: any
): Promise<string> {
  // Extract relevant details from the screenshot result
  const details: Record<string, any> = {
    url,
    selector,
    screenshotUrl,
  };

  // Add additional details if provided
  if (screenshotResult) {
    details.width = screenshotResult.width;
    details.height = screenshotResult.height;
    details.cloudinaryId = screenshotResult.cloudinaryId;
    details.images = screenshotResult.images;
  }

  return createActivity({
    userId: user.uid,
    userEmail: user.email || "unknown@example.com",
    userName: user.displayName,
    userPhotoURL: user.photoURL,
    action: "took a screenshot",
    targetType: "screenshot",
    targetId: screenshotUrl,
    targetName: new URL(url).hostname,
    details,
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
    // Try using the composite index first (requires the index to be created)
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
    } catch (indexError) {
      console.warn(
        "Index not ready yet, falling back to basic query:",
        indexError
      );

      // Fallback to a simpler query if the index isn't ready
      // This will get all activities and filter them in memory
      const q = query(
        collection(db, "activities"),
        orderBy("timestamp", "desc"),
        limit(count * 5) // Get more items since we'll filter some out
      );

      const querySnapshot = await getDocs(q);
      const allActivities = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ActivityItem)
      );

      // Filter for screenshots only and limit to requested count
      return allActivities
        .filter((activity) => activity.targetType === "screenshot")
        .slice(0, count);
    }
  } catch (error) {
    console.error("Error getting screenshot activities:", error);
    return [];
  }
}

/**
 * Deletes a screenshot activity from Firestore
 * Note: This does NOT handle Cloudinary deletion - use the API endpoint for that
 */
export async function deleteScreenshotActivity(
  id: string,
  user?: User
): Promise<boolean> {
  try {
    // Get the activity first to check if it has a Cloudinary ID
    const activityRef = doc(db, "activities", id);
    const activitySnap = await getDoc(activityRef);

    if (!activitySnap.exists()) {
      console.warn(`Activity with ID ${id} not found`);
      return false;
    }

    // Check if the user is authorized to delete this activity
    if (user) {
      const activityData = activitySnap.data();
      if (activityData.userId !== user.uid) {
        console.warn(
          `User ${user.uid} not authorized to delete activity ${id}`
        );
        return false;
      }
    }

    // Cloudinary deletion must be handled in API routes or server components
    // Not deleting from Cloudinary here - must be done from server code

    // Delete the activity document from Firestore
    await deleteDoc(activityRef);
    return true;
  } catch (error) {
    console.error("Error deleting screenshot activity:", error);
    return false;
  }
}
