const firebaseConfig = {
  apiKey: "AIzaSyA3smcaTh9oWfJs0RP8qnviK1lwfUWDir8",
  authDomain: "shoppinglist2-eb98b.firebaseapp.com",
  databaseURL: "https://shoppinglist2-eb98b.firebaseio.com",
  projectId: "shoppinglist2-eb98b",
  storageBucket: "shoppinglist2-eb98b.appspot.com",
  messagingSenderId: "782907887913",
  appId: "1:782907887913:web:f606afcae9665f335fa738"
};

function getFirebase() {
  firebase.initializeApp(firebaseConfig);
  return firebase.firestore();
}

export function load(collectionId) {
  return new Promise((resolve, reject) => {
    db.collection(collectionId)
      .onSnapshot(function (querySnapshot) {
        let data = [];
        querySnapshot.forEach(function (doc) {
          data.push(doc.data());
        });
        resolve(data.length ? data : [{ "name": "section 1", "section": true }]);
      });
  });
};

export function save(collectionId, docId, value) {
  db.collection(collectionId).doc(docId).set(value)
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

export function remove(collectionId, docId) {
  db.collection(collectionId).doc(docId).delete();
}

const db = getFirebase();