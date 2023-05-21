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
     "action": { "default_popup": "index.html" }
   }
   ```

5. **Run the Development Build:** Execute `npm run dev` to start the development build of your project.

For more detailed guidance, you can refer back to the [original crxjs guide](https://crxjs.dev/vite-plugin/getting-started/react/create-project).

Stay tuned for the next post where we'll dive into setting up Firebase for our Chrome Extension!

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

The detailed explanation of the authentication flow involves diving into the code that makes this possible:

### Step 1: User Enters Email on the Login Page

The Login Page uses React's useState hook to handle the user's email and onSubmit to handle the form submission. It also uses the `sendSignInLinkToEmail` function from our `firebase.js` to send this email to Firebase for email link authentication.

    ```jsx
    // LoginPage.js
    import { useState } from 'react';
    import { sendSignInLinkToEmail } from './firebase.js';

    function LoginPage() {
      const [email, setEmail] = useState('');

      const handleSubmit = async (event) => {
        event.preventDefault();
        const actionCodeSettings = {
          // URL you want to redirect back to.
          url: 'https://YOUR_EXTENSION_URL',
          handleCodeInApp: true
        };
        await sendSignInLinkToEmail(email, actionCodeSettings);
      };

      return (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
          <button type="submit">Sign in with Email</button>
        </form>
      );
    }

    export default LoginPage;
    ```

### Step 2: Firebase Sends an Email Link to the User

Our Firebase configuration and initialization happen in `firebase.js`, where we also export the `sendSignInLinkToEmail` function. This function, when called, instructs Firebase to send an email link to the user.

    ```javascript
    // firebase.js
    import firebase from 'firebase/app';
    import 'firebase/auth';

    const config = {
      // Your Firebase configuration
    };

    firebase.initializeApp(config);

    export const sendSignInLinkToEmail = (email, actionCodeSettings) => {
      return firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
    };

    export const auth = firebase.auth
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
    // UserProvider.js
    import { createContext, useState, useEffect } from 'react';
    import { auth } from './firebase.js';

    export const UserContext = createContext();

    const UserProvider = ({ children }) => {
      const [user, setUser] = useState(null);

      useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          setUser(user);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      }, []);

      return (
        <UserContext.Provider value={user}>
          {children}
        </UserContext.Provider>
      );
    };

    export default UserProvider;
    ```

With that, you should have a comprehensive understanding of the email link authentication process in a Firebase-integrated Chrome extension.

---

## To sum up, we've explored the integration of Firebase with a Chrome extension for secure email link authentication. We dove into the project setup, examined the authentication flow, and demystified the supporting code. Watch out for our next posts that will delve into topics like enhancing user experiences with ReactJS, managing user permissions, and leveraging Firebase for secure data storage. Until then, happy coding!

---

Did you find this guide useful? Share your thoughts in the comments section below. If you believe this post could benefit others, feel free to share it on social media.

## The complete source code for this project is available on my [GitHub repository](https://github.com/younessssssss/firebase-chrome-ext-auth). Don't hesitate to clone, explore, and use it for your projects. If you found it beneficial, star the repo to show your support!
