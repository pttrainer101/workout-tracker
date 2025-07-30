import React, { useState } from "react";

export default function App() {
  // Simple state to hold workouts
  const [workouts, setWorkouts] = useState(["Push-ups", "Squats", "Plank"]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🏋️ Workout Tracker</h1>
      <p>Your app is running successfully on Render!</p>

      <h2>Today's Workouts</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {workouts.map((workout, index) => (
          <li key={index} style={{ fontSize: "20px", margin: "8px 0" }}>
            ✅ {workout}
          </li>
        ))}
      </ul>
    </div>
  );
}
