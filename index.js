const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Firebase Admin Setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trext-91b51-default-rtdb.firebaseio.com" // Apna URL yahan dalein
});

const db = admin.database();

// --- Routes ---

// 1. Home Page (Simple UI)
app.get('/', (req, res) => {
    res.send(`
        <h2>Key to URL Generator</h2>
        <form action="/generate" method="POST">
            <input type="text" name="userKey" placeholder="Enter your Secret Key" required>
            <button type="submit">Generate URL</button>
        </form>
    `);
});

// 2. Key Save aur URL Generate karna
app.post('/generate', async (req, res) => {
    const { userKey } = req.body;
    const uniqueId = Date.now().toString(36); // Fast unique ID generation

    try {
        await db.ref('keys/' + uniqueId).set({
            value: userKey,
            createdAt: Date.now()
        });

        const generatedUrl = `${req.protocol}://${req.get('host')}/get-key/${uniqueId}`;
        res.send(`<h3>Apna URL copy karein:</h3> <code style="background:#eee; padding:5px;">${generatedUrl}</code>`);
    } catch (error) {
        res.status(500).send("Error saving to Firebase");
    }
});

// 3. Key Fetch karna (API endpoint for other projects)
app.get('/get-key/:id', async (req, res) => {
    const keyId = req.params.id;
    
    try {
        const snapshot = await db.ref('keys/' + keyId).once('value');
        if (snapshot.exists()) {
            // Sirf key value return karega taaki kisi bhi project mein use ho sake
            res.send(snapshot.val().value);
        } else {
            res.status(404).send("Key not found");
        }
    } catch (error) {
        res.status(500).send("Database Error");
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
