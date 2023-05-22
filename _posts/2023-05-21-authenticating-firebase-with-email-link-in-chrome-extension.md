---
layout: post
title: "Authenticating Firebase with an Email Link in a Chrome Extension"
date: 2023-05-21
categories: Chrome Extension Firebase Authentication
---

# Authenticating Firebase with an Email Link in a Chrome Extension

In this post, we'll be exploring the process of setting up a Chrome extension project and integrating Firebase for email link authentication.

## Setting up the Chrome Extension Project

We begin by setting up our Chrome extension project using crxjs and Vite.

1. **Create a Project:** Initialize a new project using Vite 2 by running `npm init vite@^2.9.4`.

2. **Install CRXJS Vite Plugin:** Install the CRXJS Vite plugin with `npm i @crxjs/vite-plugin@latest -D`.

3. **Update the Vite Config:** Update your `vite.config.js` file to include the crxjs plugin and the manifest file. The `vite.config.js` should look like this:

```javascript
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import { crx } from "@crxjs/vite-plugin";
   import manifest from "./manifest.json";

   export default defineConfig({
     plugins: [react(), crx({ manifest })],
   });
```

4. **Create the Manifest File:** Add a `manifest.json` file next to your `vite.config.js` file with the necessary Chrome Extension's properties. Here's a simple `manifest.json` structure:

```json
   {
     "manifest_version": 3,
     "name": "CRXJS React Vite Example",
     "version": "1.0.0",
     "action": { "default_popup": "index.html" },

     "background": {
       "service_worker": "src/background.js",
       "type": "module"
     },
     "permissions": ["tabs", "storage"]
   }
```

5. **Run the Development Build:** Execute `npm run dev` to start the development build of your project.

For more detailed guidance, you can refer back to the [original crxjs guide](https://crxjs.dev/vite-plugin/getting-started/react/create-project).

## Authentication Flow

Here's a simplified view of the email link authentication flow for a Firebase-enabled Chrome extension:

1. User enters email on the Login Page.
2. Firebase sends an email link to the user.
3. User clicks the email link and is redirected back to the Chrome extension.
4. The Chrome extension confirms authentication and grants the user access.

The following flow diagram represents this process:

![Auth Flow Diagram](/assets/images/auth_flow.png)

Now let's break down these steps in detail in the next section.

## Detailed Authentication Flow

### Step 1: User Enters Email on the Login Page

```jsx
    import { useState } from 'react';
    import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
    import styles from '../styles/LoginPage.module.css';

      function LoginPage() {
      const [email, setEmail] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [isSuccess, setIsSuccess] = useState(false);

      const handleEmailChange = (event) => {
      setEmail(event.target.value);
      setIsSuccess(false);
      };

      const handleSubmit = async (event) => {
      event.preventDefault();
      setIsLoading(true);

    try {
      // Configure the action code settings
      const actionCodeSettings = {
        url: 'http://localhost:3000/',
        handleCodeInApp: true,
      };

      // Send the sign-in email link
      await sendSignInLinkToEmail(getAuth(), email, actionCodeSettings);


      // Save the email for sign-in completion in the service worker
      chrome.runtime.sendMessage({ type: 'SET_EMAIL_FOR_SIGN_IN', email });


      setIsLoading(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error sending sign-in email link:', error);
      setIsLoading(false);
    }

      };

      return (

      <div className={styles.container}>
      {!isSuccess && (
      <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label}>
      Email:
      <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={styles.input}
                  />
      </label>
      <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.button}
                >
      {isLoading ? 'Loading...' : 'Login'}
      </button>
      </form>
      )}
      {isSuccess && (
      <p className={styles.successMessage}>
      Login email successfully sent! Please check your email.
      </p>
      )}
      </div>
      );
      }

      export default LoginPage;
```

### Step 2: Firebase Sends an Email Link to the User


```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const apiKey = import.meta.env.VITE_APP_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_APP_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_APP_FIREBASE_APP_ID;
const measurementId = import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
export { auth };
export default firebase;

```

### Step 3: User Clicks the Email Link and Is Redirected Back to the Chrome Extension

The `background.js` script captures the email link when the user is redirected back to the extension. It sends a message with the URL to the content script, notifying it of the URL change.

```javascript
    // background.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SET_EMAIL_FOR_SIGN_IN") {
      chrome.storage.local.set({ emailForSignIn: message.email });
      chrome.storage.local.set({ tabext: sender.tab });
      console.log("SET_EMAIL_FOR_SIGN_IN", message.email);
    }

    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
    const emailLink = changeInfo.url;
    const urlOrigin = new URL(emailLink).origin;
    const extensionOrigin = "http://localhost"; // Replace with your extension's origin

      console.log("urlOrigin", urlOrigin);

      if (urlOrigin === extensionOrigin) {
        // Get email from local storage
        chrome.storage.local.get("emailForSignIn", (data) => {
          const email = data.emailForSignIn;
          // Send a message to the content script with emailLink and email
          chrome.storage.local.get("tabext", (data1) => {
            chrome.tabs.sendMessage(data1.tabext.id, {
              type: "emailLink",
              emailLink,
              email,
            });
          });
        });
      }
    }
    });
```

### Step 4: Chrome Extension Confirms Authentication and Grants the User Access

The `UserProvider` component receives the email link and uses it to authenticate the user with Firebase. If authenticated successfully, the user's data is stored in the `UserContext`.

```jsx
// UserProvider.jsx
import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailLink } from "firebase/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // add if the state of auth are checked

  useEffect(() => {
    let unsubscribeAuth = null;

    unsubscribeAuth = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        setUser({
          uid: userAuth.uid,
          email: userAuth.email,
        });
      } else {
        setUser(null);
      }
    });

    // Listen for messages from the service worker
    const handleMessage = async (request) => {
      if (request.type === "emailLink") {
        console.log("emailLink from background.js");
        await signInWithEmailLink(auth, request.email, request.emailLink);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }

      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

```

With that, you should have a comprehensive understanding of the email link authentication process in a Firebase-integrated Chrome extension.

---

## To sum up, we've explored the integration of Firebase with a Chrome extension for secure email link authentication. We dove into the project setup, examined the authentication flow, and demystified the supporting code. Watch out for our next posts that will delve into topics like enhancing user experiences with ReactJS, managing user permissions, and leveraging Firebase for secure data storage. Until then, happy coding!

---

Did you find this guide useful? Share your thoughts in the comments section below. If you believe this post could benefit others, feel free to share it on social media.

## The complete source code for this project is available on my [GitHub repository](https://github.com/younessssssss/firebase-chrome-ext-auth). Don't hesitate to clone, explore, and use it for your projects. If you found it beneficial, star the repo to show your support!
