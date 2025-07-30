import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';

// Define the workout program
const WORKOUT_PROGRAM = [
  { name: "Barbell Curl", sets: "3-4", reps: "10-12" },
  { name: "Dumbbell Squat", sets: "3-4", reps: "10-12" },
  { name: "Dumbbell Hammer Curls", sets: "3-4", reps: "10-12" },
  { name: "Barbell Row", sets: "3-4", reps: "10-12" },
  { name: "Barbell Rack Pulls", sets: "3-4", reps: "10-12" },
];

// Helper function to convert Firestore timestamp to readable date/time
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  return date.toLocaleString();
};

// Main App Component
function App() {
  // State variables for Firebase, user, workout data, and UI feedback
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [currentWeights, setCurrentWeights] = useState(() => {
    // Initialize currentWeights with empty strings for each exercise
    const initialWeights = {};
    WORKOUT_PROGRAM.forEach(exercise => {
      initialWeights[exercise.name] = '';
    });
    return initialWeights;
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Effect for Firebase initialization and authentication
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Retrieve Firebase config and app ID from global variables
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

        // Initialize Firebase app
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);

        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
          if (user) {
            // User is signed in
            setUserId(user.uid);
          } else {
            // User is signed out, attempt to sign in with custom token or anonymously
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            try {
              if (initialAuthToken) {
                await signInWithCustomToken(firebaseAuth, initialAuthToken);
              } else {
                await signInAnonymously(firebaseAuth);
              }
              setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID()); // Ensure userId is set
            } catch (error) {
              console.error("Firebase authentication failed:", error);
              setMessage("Authentication failed. Please try again.");
              setUserId(crypto.randomUUID()); // Fallback to a random ID if auth fails
            }
          }
          setIsAuthReady(true); // Mark authentication as ready
          setLoading(false);
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();

      } catch (error) {
        console.error("Error initializing Firebase:", error);
        setMessage("Failed to initialize the app. Check console for details.");
        setLoading(false);
      }
    };

    initializeFirebase();
  }, []); // Run only once on component mount

  // Effect for fetching workout logs in real-time
  useEffect(() => {
    if (db && userId && isAuthReady) {
      const userWorkoutsRef = collection(db, `artifacts/${__app_id}/users/${userId}/workouts`);
      // Order by timestamp in descending order to show most recent first
      const q = query(userWorkoutsRef, orderBy("timestamp", "desc"));

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWorkoutLogs(logs);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching workout logs:", error);
        setMessage("Failed to load workout history.");
        setLoading(false);
      });

      // Cleanup listener on component unmount or if db/userId changes
      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady]); // Re-run if db, userId, or auth readiness changes

  // Handle weight input changes
  const handleWeightChange = (exerciseName, value) => {
    setCurrentWeights(prevWeights => ({
      ...prevWeights,
      [exerciseName]: value
    }));
  };

  // Log the current workout
  const logWorkout = async () => {
    if (!db || !userId) {
      setMessage("App not fully initialized. Please wait.");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const workoutData = {
        exercises: currentWeights,
        timestamp: serverTimestamp(), // Firestore server timestamp
      };

      // Add document to the 'workouts' subcollection for the current user
      await addDoc(collection(db, `artifacts/${__app_id}/users/${userId}/workouts`), workoutData);
      setMessage("Workout logged successfully!");
      // Clear current weights after logging
      setCurrentWeights(() => {
        const clearedWeights = {};
        WORKOUT_PROGRAM.forEach(exercise => {
          clearedWeights[exercise.name] = '';
        });
        return clearedWeights;
      });
    } catch (error) {
      console.error("Error logging workout:", error);
      setMessage("Failed to log workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a workout log
  const deleteWorkout = async (logId) => {
    if (!db || !userId) {
      setMessage("App not fully initialized. Please wait.");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Delete document from the 'workouts' subcollection
      await deleteDoc(doc(db, `artifacts/${__app_id}/users/${userId}/workouts`, logId));
      setMessage("Workout deleted successfully!");
    } catch (error) {
      console.error("Error deleting workout:", error);
      setMessage("Failed to delete workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading && !isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading app...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-inter">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-700 mb-6">
          Workout Tracker
        </h1>

        {/* Display User ID for multi-user context */}
        {userId && (
          <p className="text-sm text-gray-600 text-center mb-4">
            Your User ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{userId}</span>
          </p>
        )}

        {/* Message display area */}
        {message && (
          <div className={`p-3 mb-4 rounded-md text-center ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Current Workout Logging Section */}
        <section className="mb-8 border-b pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Log Today's Workout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKOUT_PROGRAM.map(exercise => (
              <div key={exercise.name} className="flex flex-col">
                <label htmlFor={exercise.name} className="text-lg font-medium text-gray-700 mb-1">
                  {exercise.name} <span className="text-sm text-gray-500">({exercise.sets} Sets, {exercise.reps} Reps)</span>
                </label>
                <input
                  type="number"
                  id={exercise.name}
                  value={currentWeights[exercise.name]}
                  onChange={(e) => handleWeightChange(exercise.name, e.target.value)}
                  placeholder="Enter weight (kg/lbs)"
                  className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  min="0"
                />
              </div>
            ))}
          </div>
          <button
            onClick={logWorkout}
            disabled={loading}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging...' : 'Log Workout'}
          </button>
        </section>

        {/* Workout History Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Workout History</h2>
          {workoutLogs.length === 0 ? (
            <p className="text-gray-600 text-center">No workouts logged yet. Log your first workout above!</p>
          ) : (
            <div className="space-y-4">
              {workoutLogs.map(log => (
                <div key={log.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-md font-semibold text-gray-800">
                      Date: {formatTimestamp(log.timestamp)}
                    </p>
                    <button
                      onClick={() => deleteWorkout(log.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition duration-200"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-gray-700">
                    {Object.entries(log.exercises).map(([exerciseName, weight]) => (
                      <p key={exerciseName} className="text-sm">
                        <span className="font-medium">{exerciseName}:</span> {weight} kg/lbs
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
