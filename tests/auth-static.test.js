const assert=require('assert');
const fs=require('fs');

const auth=fs.readFileSync('auth.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const config=fs.readFileSync('firebase-config.js','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');

new Function(auth);
new Function(app);

[
  'signInWithEmailAndPassword','createUserWithEmailAndPassword','signInWithPopup',
  'signInWithRedirect','sendPasswordResetEmail','browserLocalPersistence',
  "doc(db, 'users', uid)",'loadProgress','saveProgress','onAuthStateChanged'
].forEach(token=>assert.ok(auth.includes(token),'Missing authentication capability: '+token));

[
  'authView','signInEmail','signInPassword','signUpName','signUpEmail','signUpPassword',
  'signUpRole','googleSignInBtn','forgotPasswordBtn','signOutBtn','syncChip','userChip'
].forEach(id=>assert.ok(html.includes('id="'+id+'"'),'Missing auth UI target #'+id));

assert.ok(html.includes('guest-mode-btn'),'Guest fallback missing');
assert.ok(app.includes("STORAGE_BASE+':'+user.uid"),'Local cache is not scoped by user ID');
assert.ok(app.includes('MathAuth.saveProgress'),'Cloud progress save missing');
assert.ok(app.includes('MathAuth.loadProgress'),'Cloud progress load missing');
assert.ok(app.includes('startGuestMode'),'Guest mode missing');
assert.ok(app.includes('legacyDeviceProgress'),'Existing-device migration missing');

assert.ok(config.includes('MATH_MASTI_FIREBASE_CONFIG'),'Firebase config template missing');
assert.ok(rules.includes('request.auth.uid == userId'),'Firestore rules do not isolate user records');

console.log('Authentication and per-user sync static checks passed.');
