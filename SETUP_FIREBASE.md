# One-time Firebase setup for Math Masti Quest

The authentication and per-user cloud-sync code is already in this repository. A Firebase project must be connected once before the live sign-in screen can work.

## 1. Create a Firebase project

1. Go to the Firebase Console.
2. Create a project, for example **Math Masti Quest**.
3. Analytics is optional for this game.

## 2. Register the web app

1. From **Project overview**, choose **Add app -> Web**.
2. Give it a nickname such as **Math Masti Web**.
3. Firebase will show a web configuration object containing values such as:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `appId`
4. Copy those values into `firebase-config.js` in this repository.

The Firebase web configuration is sent to browsers by design. It is not a server password. User-data access is protected by Authentication and the Firestore rules in `firestore.rules`.

## 3. Turn on sign-in methods

In **Authentication -> Sign-in method**:

1. Enable **Email/Password**.
2. Enable **Google** and choose the project support email.

The app supports:
- email/password signup
- email/password sign-in
- password-reset emails
- Google sign-in
- persistent sign-in on the user's browser

## 4. Authorize the GitHub Pages domain

In **Authentication -> Settings -> Authorized domains**, add:

`projectdwister.github.io`

Keep the Firebase-provided domains as well. Add `localhost` if you want to test locally.

## 5. Create Cloud Firestore

1. Open **Firestore Database** in Firebase Console.
2. Create the database.
3. Choose the region appropriate for the project.
4. The repository already contains rules that allow a user to access only `/users/{their-own-uid}`.

## 6. Deploy the Firestore rules

With the Firebase CLI installed and logged in:

```bash
firebase deploy --project YOUR_PROJECT_ID --only firestore:rules
```

The deployment uses the repository's `firebase.json` and `firestore.rules`.

You can also paste the contents of `firestore.rules` into **Firestore -> Rules** in Firebase Console and publish them.

## 7. Commit the Firebase web config

After replacing the placeholders in `firebase-config.js`, commit and push that file to `main`.

GitHub Pages will redeploy automatically.

## What gets stored per account

Each Firebase user has one private document:

`users/{uid}`

It stores:
- account profile: display name, email, Child/Student or Parent/Adult role
- concept mastery
- question attempts and recent performance
- mistake/revision queue
- XP, coins, avatars and accessories
- dashboard history
- last completed test and answer review

Passwords are not stored in Firestore or in this repository.

## Existing device progress

On the first authenticated account used on an existing device, Math Masti can migrate the prior local progress into that account if the Firebase account does not already have cloud progress. After that, browser caches are separated by Firebase user ID.
