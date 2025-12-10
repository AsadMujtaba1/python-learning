/**
 * DELETE USER DATA SCRIPT
 * 
 * This script deletes all data for a specific user email from Firebase
 * Run with: node scripts/deleteUserData.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// For now, this shows what needs to be deleted

async function deleteUserData(email) {
  console.log(`Deleting data for: ${email}`);
  
  try {
    // 1. Find user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    
    console.log(`Found user with UID: ${uid}`);
    
    // 2. Delete Firestore user profile document
    await admin.firestore().collection('users').doc(uid).delete();
    console.log('✓ Deleted user profile from Firestore');
    
    // 3. Delete any user-specific collections (add more as needed)
    const collections = ['bills', 'photos', 'tariffs', 'usage-history'];
    
    for (const collection of collections) {
      const snapshot = await admin.firestore()
        .collection(collection)
        .where('userId', '==', uid)
        .get();
      
      if (!snapshot.empty) {
        const batch = admin.firestore().batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`✓ Deleted ${snapshot.size} documents from ${collection}`);
      }
    }
    
    // 4. Delete Firebase Auth user
    await admin.auth().deleteUser(uid);
    console.log('✓ Deleted user from Firebase Authentication');
    
    console.log('\n✅ All data deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
  }
}

// Usage
const EMAIL_TO_DELETE = 'asad123go@gmail.com';
deleteUserData(EMAIL_TO_DELETE);
