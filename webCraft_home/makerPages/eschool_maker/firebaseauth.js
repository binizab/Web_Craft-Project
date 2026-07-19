import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup,
updateProfile,
onAuthStateChanged,
deleteUser,
signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyA6lvXt1RVDbUYF1jL0yWj6OtU4Dd9-1ms",
    authDomain: "eb-academy-7f198.firebaseapp.com",
    projectId: "eb-academy-7f198",
    storageBucket: "eb-academy-7f198.firebasestorage.app",
    messagingSenderId: "1056181453023",
    appId: "1:1056181453023:web:d500d01f832c00d3fee96a",
    measurementId: "G-7S2NZG6QP9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// EMAIL SIGN UP
window.signUpWithEmail = async (email,password,name)=>{
try{
const res = await createUserWithEmailAndPassword(auth,email,password);
await updateProfile(res.user,{displayName:name});
handleAuthSuccess(res.user.email,name);
}catch(e){handleAuthError(e.message);}
};

// EMAIL SIGN IN
window.signInWithEmail = async (email,password)=>{
try{
const res = await signInWithEmailAndPassword(auth,email,password);
handleAuthSuccess(res.user.email,res.user.displayName);
}catch(e){handleAuthError(e.message);}
};

// GOOGLE SIGN IN
window.signInWithGoogle = async ()=>{
try{
const res = await signInWithPopup(auth,provider);
handleAuthSuccess(res.user.email,res.user.displayName);
}catch(e){handleAuthError(e.message);}
};

// 🔥 DELETE ACCOUNT FROM GOOGLE/FIREBASE CONSOLE
window.deleteAccount = async ()=>{
try{
const user = auth.currentUser;
if(!user) return;

await deleteUser(user);   // ⬅️ removes from Firebase Authentication
await signOut(auth);

alert("Account deleted successfully.");
location.reload();

}catch(e){
if(e.code==="auth/requires-recent-login"){
alert("Please sign in again before deleting your account.");
}else{
handleAuthError(e.message);
}
}
};

// AUTO LOGIN
onAuthStateChanged(auth,user=>{
if(user){
handleAuthSuccess(user.email,user.displayName);
}
});


