import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata, updateMetadata } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js';
const firebaseConfig = {
    apiKey: "AIzaSyCoxhTf3yZr__OXSykIbrLC8KGlkWxiBf4",
    authDomain: "test-8dd1b.firebaseapp.com",
    projectId: "test-8dd1b",
    storageBucket: "test-8dd1b.appspot.com",
    messagingSenderId: "824111734360",
    appId: "1:824111734360:web:db791379920908fe82f42d",
    measurementId: "G-0M7WTF0V36"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore, Auth and Storage
export const db = getFirestore(app);
export let authInstance = getAuth(app);
export const storage = getStorage(app);


export let userData = {};
const usersColl = collection(db, 'Users');
const messegesColl = collection(db, 'Messages');

export async function goOffline() {

    enableIndexedDbPersistence(db)
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.error('The current browser does not support offline persistence.');
            }
        });
}


console.log(authInstance);
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}


export function waitForAuth() {



    return new Promise((resolve, reject) => {
        const unsubscribe = authInstance.onAuthStateChanged(async (user) => {

            try {

                await updateuserdata()
            } catch (error) {
                unsubscribe()
                reject(error)
            }



            unsubscribe();
            resolve(user); // Resolve with user object (or null if not signed in)
            console.log(authInstance);


        }, (error) => {
            unsubscribe();
            reject(error); // Reject the promise if there's an error
        });
    });

}

async function updateuserdata() {
    try {

        const q = query(usersColl, where('email', '==', authInstance.currentUser.email));
        const querySnap = await getDocs(q);

        const docsSnap = querySnap.docs[0];

        let currentData = docsSnap.data();
        userData = currentData;
        userData.ref = docsSnap.ref;

        console.log(userData);

    } catch (error) {
        if (!navigator.onLine) {
            throw new Error("No connection");

        } else {
            throw new Error(error);


        }
    }


}

// Auth Functions

export function signIn(email, pass) {
    return signInWithEmailAndPassword(authInstance, email, pass);
}

export async function signUp(username, email, password) {
    const q = query(usersColl, where('username', '==', username));
    const querySnap = await getDocs(q);
    try {
        if (querySnap.empty) {
            const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
            console.log("User created:", userCredential.user);

            const docRef = await addDoc(collection(db, 'Users'), {
                username: username,
                email: email,
                contacts: [],
                profilePic: { url: null, path: null }
            });

            return userCredential;

        } else {
            throw new Error("Invalid username");


        }

    } catch (error) {
        throw error;
    }
}

export async function forgotPass(email) {
    return sendPasswordResetEmail(authInstance, email)
}


export async function addNewContact(email) {
    const targetUserQuery = query(usersColl, where('email', '==', email));
    const targetUserSnap = await getDocs(targetUserQuery);

    if (!targetUserSnap.empty) {
        if (userData) {

            const targetUserDocSnap = targetUserSnap.docs[0];
            const targetUserDocRef = targetUserDocSnap.ref;

            // Update the target user's contacts
            let targetUserData = targetUserDocSnap.data();
            const updatedTargetUserContacts = [...(targetUserData.contacts || []), { username: userData.username, email: userData.email, profilePicurl: userData.profilePic.url }];

            const updatedCurrentUserContacts = [...(userData.contacts || []), { username: targetUserData.username, email: targetUserData.email, profilePicurl: targetUserData.profilePic.url }];

            if (!targetUserData.contacts.includes(userData.email) && !userData.contacts.includes(email)) {
                // Update target user
                await updateDoc(targetUserDocRef, {
                    contacts: updatedTargetUserContacts
                });

                // Update current user
                await updateDoc(userData.ref, {
                    contacts: updatedCurrentUserContacts
                });

                await updateuserdata()
                console.log("Successfully updated both contacts lists.");

                // make a chat room

                const chatdocref = await addDoc(messegesColl, {

                    type: 'personal',
                    members: `${email},${userData.email}`,

                    messages: []
                })
            } else {
                throw new Error("Users already in contact");
            }

        } else {
            throw new Error("Current user not found");
        }
    } else {

        if ('connection' in navigator) {
            if (!navigator.onLine) {
                throw new Error("No connection. Check your internet.");
            } else {
                throw new Error("User doesn't exist");
            }
        } else {
            throw new Error("User doesn't exist");
        }
    }
}


export async function getContacts() {
    try {

        if (userData && userData.contacts) {
            return userData.contacts;
        } else {
            throw new Error("Cannot get contacts");
        }
    } catch (error) {
        console.log(error);

    }

}


export async function updateProfilepic(file) {

    try {

        if (userData.profilePic.path != null) {
            let path = userData.profilePic.path;
            const preref = ref(storage, path);
            await deleteObject(preref);
            console.log('deleted previous pic');

        }

        console.log(userData.username);

        const storageRef = ref(storage, `Profile pics/${userData.username}`);
        console.log(storageRef);


        const snapshot = await uploadBytes(storageRef, file);
        console.log('File uploaded successfully!', snapshot);

        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at:', downloadURL);

        await updateDoc(userData.ref, {
            profilePic: {
                url: downloadURL,
                path: snapshot.ref.fullPath
            }
        })


        console.log("done");

        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// chat room functions

export async function getChat(email) {
    const possvals = [`${userData.email},${email}`, `${email},${userData.email}`];
    console.log(possvals);

    const q = query(messegesColl, where('members', 'in', possvals))
    const querySnap = await getDocs(q)

    if (!querySnap.empty) {

        console.log(querySnap);
        return querySnap
    } else {
        console.log('cant get chat');

    }

}

export async function sendMessage(message, ref) {
    message.timestamp = new Date().getTime()


    await updateDoc(ref, {
        messages: arrayUnion(message)
    })
    console.log('message sent');

}

export async function getuser(email) {

    const q = query(usersColl, where('email', '==', email))
    const querySnap = await getDocs(q)

    console.log(querySnap);

    const docdata = querySnap.docs[0].data()
    console.log(docdata);

    return docdata


}

export async function addListener(ref, func) {
    let firsttime = true
    onSnapshot(ref, (e) => {
        if (!firsttime) {

            const data = e.data().messages
            console.log(data);
            if (data[data.length - 1]) {

                func(data[data.length - 1].text, data[data.length - 1].timestamp, data[data.length - 1].sender)
            }

        } else {
            firsttime = false
        }

    })
}