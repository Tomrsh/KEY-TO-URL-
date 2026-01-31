const express = require('express');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, child } = require('firebase/database');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Firebase Configuration (Console se copy karein)
const firebaseConfig = {
  apiKey: "AIzaSyAb7V8Xxg5rUYi8UKChEd3rR5dglJ6bLhU",
  authDomain: "t2-storage-4e5ca.firebaseapp.com",
  databaseURL: "https://t2-storage-4e5ca-default-rtdb.firebaseio.com",
  projectId: "t2-storage-4e5ca",
  storageBucket: "t2-storage-4e5ca.firebasestorage.app",
  messagingSenderId: "667143720466",
  appId: "1:667143720466:web:c8bfe23f3935d3c7e052cb",
  measurementId: "G-K2KPMMC5C6"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// --- Routes ---

// A. Simple UI for Generating URL
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h2>⚡ Light-Speed Key Generator</h2>
            <form action="/generate" method="POST">
                <input type="text" name="userKey" placeholder="Enter Secret Key" style="padding:10px; width:250px;" required>
                <button type="submit" style="padding:10px; cursor:pointer;">Generate</button>
            </form>
        </div>
    `);
});

// B. Save Key to Firebase
app.post('/generate', async (req, res) => {
    const { userKey } = req.body;
    const uniqueId = Math.random().toString(36).substring(2, 8); // Fast Short ID

    try {
        await set(ref(db, 'keys/' + uniqueId), {
            val: userKey
        });
        const fullUrl = `${req.protocol}://${req.get('host')}/get/${uniqueId}`;
        res.send(`<h3>Success! Use this URL as your Key:</h3> <code>${fullUrl}</code>`);
    } catch (error) {
        res.status(500).send("Firebase Error: " + error.message);
    }
});

// C. Fast Fetch Route (For other projects)
app.get('/get/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const snapshot = await get(child(ref(db), `keys/${id}`));
        if (snapshot.exists()) {
            // Sirf raw key bhejega taaki code me as-it-is use ho sake
            res.send(snapshot.val().val);
        } else {
            res.status(404).send("Invalid URL");
        }
    } catch (error) {
        res.status(500).send("Error fetching data");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
