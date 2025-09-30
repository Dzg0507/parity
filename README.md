# Parity - A Communication Toolkit

Parity is a mobile application designed to enhance personal and interpersonal communication. It provides tools to articulate thoughts privately and prepare for difficult conversations, fostering clarity and mutual understanding. The app features two core modes: "Uplift" for sharing positive messages and "Unpack" for guided conversational prep.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Security & Privacy](#security--privacy)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Security & Privacy](#security--privacy)

## Features

### Core Application & User Management
- Secure user account creation with email/password and Social Logins (Google, Apple).
- Comprehensive user profile and settings management.
- Onboarding tutorials to guide new users.

### Uplift Mode (Free)
- A searchable library of pre-written positive messages.
- Browse messages by categories like "Gratitude" and "Encouragement".
- Share messages easily via native device sharing functionality.

### Unpack Mode: Solo Prep (Premium)
- Initiate private journaling sessions to prepare for conversations.
- Select from predefined relationship types and topics to receive expert-designed prompts.
- All journal entries are end-to-end encrypted and strictly private.
- Generate a personalized "Strategy Briefing" with communication tips based on your entries.

### Unpack Mode: Joint Unpack (Premium Initiator, Free Invitee)
- Convert a "Solo Prep" session into a collaborative "Joint Unpack".
- Invite another person to the session with a secure, time-limited link.
- Invitee can respond to their prompts without creating an account.
- Responses are revealed simultaneously to both parties only upon mutual consent.
- A shared "Conversation Agenda" is automatically generated to guide the real-world conversation.

## Tech Stack

- **Framework:** React Native
- **State Management:** Redux Toolkit (with RTK Query)
- **Styling:** Styled Components
- **Navigation:** React Navigation
- **Forms:** Formik & Yup
- **Backend Services:** Firebase (Authentication, Messaging, Dynamic Links, Analytics)
- **Testing:** Jest, React Native Testing Library (Unit/Integration), Detox (E2E)
- **CI/CD:** GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- Yarn or npm
- Watchman (for macOS)
- A JDK (Java Development Kit)
- Android Studio (for Android development)
- Xcode (for iOS development)
- React Native CLI

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/parity-app.git
    cd parity-app
    ```

2.  **Install JavaScript dependencies:**
    ```bash
    yarn install
    ```

3.  **Install iOS dependencies (for macOS):**
    ```bash
    cd ios && pod install && cd ..
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file.
    ```bash
    cp .env.example .env
    ```
    Then, fill in the required values in your new `.env` file. These credentials will typically come from your Firebase project console and your backend API.

## Running the Application

### Run on iOS
```bash
yarn ios
Run on Android
yarn android
Running Tests
Unit & Integration Tests
Run all unit and integration tests using Jest.

yarn test
End-to-End (E2E) Tests
Detox is used for E2E testing. Ensure you have an emulator/simulator running.

Build the test app:

# For iOS
detox build -c ios.sim.debug

# For Android
detox build -c android.emu.debug
Run the tests:

# For iOS
detox test -c ios.sim.debug

# For Android
detox test -c android.emu.debug
Security & Privacy
This application places a high emphasis on user privacy and data security.

End-to-End Encryption: All user-generated content in "Unpack Mode," including journal entries and responses, is end-to-end encrypted.
Encryption at Rest: All user data stored on our servers is encrypted at rest.
Strict Access Control: Journal entries are private and only accessible by their author. Joint session data is only revealed with mutual consent.