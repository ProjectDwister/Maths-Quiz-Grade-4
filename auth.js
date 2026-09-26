(() => {
  const VERSION = '12.19.0';
  const ready = api => {
    window.MathAuth = api;
    window.dispatchEvent(new CustomEvent('mathauthready', { detail: api }));
  };

  const config = window.MATH_MASTI_FIREBASE_CONFIG || {};
  const missing = !config.apiKey || !config.projectId || !config.appId ||
    Object.values(config).some(v => String(v || '').includes('REPLACE_WITH_'));

  if (missing) {
    ready({
      configured: false,
      error: 'Firebase has not been configured yet.'
    });
    return;
  }

  (async () => {
    const [
      appMod,
      authMod,
      storeMod
    ] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/' + VERSION + '/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/' + VERSION + '/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/' + VERSION + '/firebase-firestore.js')
    ]);

    const app = appMod.initializeApp(config);
    const auth = authMod.getAuth(app);
    const db = storeMod.getFirestore(app);
    const googleProvider = new authMod.GoogleAuthProvider();

    await authMod.setPersistence(auth, authMod.browserLocalPersistence);

    const userRef = uid => storeMod.doc(db, 'users', uid);

    async function ensureUserDocument(user, requestedRole) {
      const ref = userRef(user.uid);
      const snap = await storeMod.getDoc(ref);
      const existing = snap.exists() ? snap.data() : {};
      const profile = existing.profile || {};
      const role = profile.role || requestedRole || 'child';

      await storeMod.setDoc(ref, {
        profile: {
          displayName: user.displayName || profile.displayName || '',
          email: user.email || profile.email || '',
          role
        },
        lastLoginAt: storeMod.serverTimestamp(),
        ...(snap.exists() ? {} : { createdAt: storeMod.serverTimestamp() })
      }, { merge: true });

      return role;
    }

    async function signUp({ name, email, password, role }) {
      const credential = await authMod.createUserWithEmailAndPassword(auth, email, password);
      if (name) await authMod.updateProfile(credential.user, { displayName: name.trim() });
      await ensureUserDocument(credential.user, role || 'child');
      try {
        await authMod.sendEmailVerification(credential.user);
      } catch (_) {}
      return credential.user;
    }

    async function signIn(email, password) {
      const credential = await authMod.signInWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(credential.user);
      return credential.user;
    }

    async function signInWithGoogle(role) {
      try {
        const credential = await authMod.signInWithPopup(auth, googleProvider);
        await ensureUserDocument(credential.user, role || 'child');
        return credential.user;
      } catch (err) {
        if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request')) {
          sessionStorage.setItem('mathMastiPendingRole', role || 'child');
          await authMod.signInWithRedirect(auth, googleProvider);
          return null;
        }
        throw err;
      }
    }

    async function finishRedirectIfAny() {
      try {
        const result = await authMod.getRedirectResult(auth);
        if (result && result.user) {
          const role = sessionStorage.getItem('mathMastiPendingRole') || 'child';
          sessionStorage.removeItem('mathMastiPendingRole');
          await ensureUserDocument(result.user, role);
        }
      } catch (_) {}
    }

    async function resetPassword(email) {
      if (!email) throw new Error('Enter your email address first.');
      await authMod.sendPasswordResetEmail(auth, email);
    }

    async function signOutUser() {
      await authMod.signOut(auth);
    }

    function observe(callback) {
      return authMod.onAuthStateChanged(auth, callback);
    }

    function currentUser() {
      return auth.currentUser;
    }

    async function loadUserRecord() {
      const user = auth.currentUser;
      if (!user) return null;
      const snap = await storeMod.getDoc(userRef(user.uid));
      return snap.exists() ? snap.data() : null;
    }

    async function loadProgress() {
      const record = await loadUserRecord();
      return record && record.progress ? record.progress : null;
    }

    async function saveProgress(progress) {
      const user = auth.currentUser;
      if (!user) return;
      await storeMod.setDoc(userRef(user.uid), {
        progress,
        profile: {
          displayName: user.displayName || '',
          email: user.email || ''
        },
        updatedAt: storeMod.serverTimestamp()
      }, { merge: true });
    }

    async function getProfile() {
      const record = await loadUserRecord();
      return record && record.profile ? record.profile : null;
    }

    await finishRedirectIfAny();

    ready({
      configured: true,
      observe,
      signUp,
      signIn,
      signInWithGoogle,
      signOut: signOutUser,
      resetPassword,
      loadUserRecord,
      loadProgress,
      saveProgress,
      getProfile,
      getCurrentUser: currentUser
    });
  })().catch(err => {
    console.error('Firebase initialization failed', err);
    ready({
      configured: false,
      error: err && err.message ? err.message : 'Firebase initialization failed.'
    });
  });
})();