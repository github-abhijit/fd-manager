import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCeQc8lJic6jP9jVeHPBCO3FkTHdWyXfjk",
  authDomain: "fd-manager-31183.firebaseapp.com",
  projectId: "fd-manager-31183",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function cleanAccount(email, password) {
  try {
    console.log(`Logging in as ${email}...`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`Logged in as ${user.uid}`);

    const banksSnapshot = await getDocs(query(collection(db, 'banks'), where('userId', '==', user.uid)));
    const fdsSnapshot = await getDocs(query(collection(db, 'fixedDeposits'), where('userId', '==', user.uid)));

    let count = 0;
    for (const d of banksSnapshot.docs) {
      await deleteDoc(doc(db, 'banks', d.id));
      count++;
    }
    for (const d of fdsSnapshot.docs) {
      await deleteDoc(doc(db, 'fixedDeposits', d.id));
      count++;
    }
    console.log(`Deleted ${count} documents for ${email}`);
  } catch (error) {
    console.error(`Failed to clean ${email}:`, error.message);
  }
}

async function main() {
  await cleanAccount('testuser@arc.com', 'testuser1');
  //await cleanAccount('raosaheb.c4@gmail.com', 'RSC@1956'); // Trying default test password
  process.exit(0);
}

main();
