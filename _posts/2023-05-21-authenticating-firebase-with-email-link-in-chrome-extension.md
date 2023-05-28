---
layout: post
title: "Chrome Extension Guide: Firebase Authentication with Email Links"
date: 2023-05-21
categories: Chrome Extension Firebase Authentication
---

{% include author_bio.html %}
# Introduction to Firebase Authentication in Chrome Extensions

In this post, we'll be exploring the process of setting up a Chrome extension project and integrating Firebase for email link authentication.

## Table of Contents
- [Introduction](#introduction-to-firebase-authentication-in-chrome-extensions)
- [Setting up the Chrome Extension Project](#setting-up-the-chrome-extension-project)
- [Overview of the Authentication Flow](#authentication-flow)
- [Detailed Authentication Flow](#detailed-authentication-flow)
  - [Step 1: User Enters Email](#step-1-user-enters-email)
  - [Step 2: Firebase Sends an Email Link](#step-2-firebase-sends-an-email-link)
  - [Step 3: User Clicks the Email Link](#step-3-user-clicks-the-email-link)
  - [Step 4: Extension Confirms Authentication](#step-4-extension-confirms-authentication)
- [Conclusion](#conclusion)

## Setting up the Chrome Extension Project

Let's begin by setting up our Chrome extension project using crxjs and Vite. Follow the steps below:

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

## Detailed Authentication Flow

Let's break down these steps in detail.

### Step 1: User Enters Email
This React component, LoginPage, collects the user's email and sends a Firebase authentication link. The handleSubmit function sends the email link when the form is submitted. If the email link is successfully sent, a success message is displayed. If an error occurs, it's logged to the console.

Here's the code snippet for the LoginPage component:
```jsx
import { useState } from 'react';
import { getAuth, sendSignInLinkToEmail } from "firebase/auth";
import styles from '../styles/LoginPage.module.css';

function LoginPage() {
  // ... component state and event handlers here ...

  return (
    <div className={styles.container}>
      {!isSuccess && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* form elements here */}
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
Check the complete version on [GitHub repository](https://github.com/younessssssss/firebase-chrome-ext-auth) for more details.

### Step 2: Firebase Sends an Email Link

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  // ...other firebase configuration values...
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
export { auth };
export default firebase;


```
Check the complete version on [GitHub repository](https://github.com/younessssssss/firebase-chrome-ext-auth) for more details.

### Step 3: User Clicks the Email Link

The `background.js` script captures the email link when the user is redirected back to the extension. It sends a message with the URL to the content script, notifying it of the URL change.

```javascript
// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle "SET_EMAIL_FOR_SIGN_IN" message here...
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Check if URL is from the extension and handle authentication link...
  }
});

```
Check the complete version on [GitHub repository](https://github.com/younessssssss/firebase-chrome-ext-auth) for more details.

### Step 4: Extension Confirms Authentication

The `UserProvider` component receives the email link and uses it to authenticate the user with Firebase. If authenticated successfully, the user's data is stored in the `UserContext`.

```jsx
// UserProvider.jsx
import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailLink } from "firebase/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Handle authentication state changes and messages from background.js...
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};


```
Check the complete version on [GitHub repository](https://github.com/younessssssss/firebase-chrome-ext-auth) for more details.

## Conclusion

We appreciate your feedback! If this post added value to your work, we encourage you to share it with your network on social media. For those interested in contributing to or collaborating on this project, please visit the project's [GitHub repository](https://github.com/younessssssss/firebase-chrome-ext-auth) and consider making a pull request.

For inquiries or potential collaborations, don't hesitate to reach out.