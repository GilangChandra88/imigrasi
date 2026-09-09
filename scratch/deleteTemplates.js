const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json'); // I need to know where the service account is, or just use default

// Wait, I might not have serviceAccountKey.json here.
// Is there a better way? 
