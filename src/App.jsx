import React, { useState } from "react";

export default function App() {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [weights, setWeights] = useState({
    barbellCurl: "",
    dumbbellSquat: "",
    hammerCurl: "",
    barbellRow: "",
    rackPulls: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWeights({ ...weights, [name]: value });
  };

  const logWorkout = () => {
    const newWorkout = {
      ...weights,
      date: new Date().toLocaleDateString(),
    };
    setWorkoutHistory([...workoutHistory, newWorkout]);

    // Clear inputs after logging
    setWeights({
      barbellCurl: "",
      dumbbellSquat: "",
      hammerCurl: "",
      barbellRow: "",
      rackPulls: "",
    });
  };

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: "500px",
      margin: "40px auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      backgroundColor: "#f9f9f9"
    }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>🏋️ Workout Tracker</h1>
      <p style={{ textAlign: "center", fontWeight: "bold" }}>
        Your User ID: <span style={{ color: "blue" }}>08524258889845543657</span>
      </p>

      <h2 style={{ marginTop: "20px" }}>Log Today's Workout</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>Barbell Curl (3-4 Sets, 10-12 Reps)</label>
        <input
          type="text"
          name="barbellCurl"
          placeholder="Enter weight (kg/lbs)"
          value={weights.barbellCurl}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Dumbbell Squat (3-4 Sets, 10-12 Reps)</label>
        <input
          type="text"
          name="dumbbellSquat"
          placeholder="Enter weight (kg/lbs)"
          value={weights.dumbbellSquat}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Dumbbell Hammer Curls (3-4 Sets, 10-12 Reps)</label>
        <input
          type="text"
          name="hammerCurl"
          placeholder="Enter weight (kg/lbs)"
          value={weights.hammerCurl}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Barbell Row (3-4 Sets, 10-12 Reps)</label>
        <input
          type="text"
          name="barbellRow"
          placeholder="Enter weight (kg/lbs)"
          value={weights.barbellRow}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Barbell Rack Pulls (3-4 Sets, 10-12 Reps)</label>
        <input
          type="text"
          name="rackPulls"
          placeholder="Enter weight (kg/lbs)"
          value={weights.rackPulls}
          onChange={handleInputChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <button
        onClick={logWorkout}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          backgroundColor: "green",
          color: "white",
          fontWeight: "bold",
          border: "none",
          borderRadius: "5px"
        }}
      >
        Log Workout
      </button>

      <h2 style={{ marginTop: "30px" }}>Workout History</h2>
      {workoutHistory.length === 0 ? (
        <p style={{ color: "gray" }}>No workouts logged yet. Log your first workout above.</p>
      ) : (
        <ul>
          {workoutHistory.map((workout, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <strong>{workout.date}</strong>: Barbell Curl - {workout.barbellCurl}, Dumbbell Squat - {workout.dumbbellSquat}, Hammer Curls - {workout.hammerCurl}, Barbell Row - {workout.barbellRow}, Rack Pulls - {workout.rackPulls}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
