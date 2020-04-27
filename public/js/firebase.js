const firebaseConfig = {
  apiKey: "AIzaSyA3smcaTh9oWfJs0RP8qnviK1lwfUWDir8",
  authDomain: "shoppinglist2-eb98b.firebaseapp.com",
  databaseURL: "https://shoppinglist2-eb98b.firebaseio.com",
  projectId: "shoppinglist2-eb98b",
  storageBucket: "shoppinglist2-eb98b.appspot.com",
  messagingSenderId: "782907887913",
  appId: "1:782907887913:web:f606afcae9665f335fa738"
};

const collectionId = 'lists';

function getFirebase() {
  firebase.initializeApp(firebaseConfig);
  return firebase.firestore();
}

export function load(docId, items) {
  return new Promise((resolve, reject) => {
    let docRef = db.collection(collectionId).doc(docId);
    docRef.onSnapshot(function (doc) {
      if (doc.exists) {
        const value = doc.data().value || '[{"name":"section 1","section":true}]';
        items.splice(0, items.length);
        value.forEach(v => items.push(v));
        resolve();
      } else {
        reject('No such document!')
        console.error('No such document!');
      }
    });
  });
};

export function save(docId, value) {
  db.collection(collectionId).doc(docId).set({ value })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

const db = getFirebase();