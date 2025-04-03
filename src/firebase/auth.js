import { auth } from "./firebase";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from "firebase/auth";
import { getAuth, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth'

export const doCreateUserWithEmailAndPassword = async (email, password, firstName, lastName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(userCredential.user, {
    displayName: `${firstName} ${lastName}`
  });
  
  return userCredential;
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignOut = () => {
  return auth.signOut();
};

export const sendPasswordResetEmail = (email) => {
  return firebaseSendPasswordResetEmail(getAuth(), email)
}
