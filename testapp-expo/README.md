# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## How to Run Locally (Android + Backend)

### Prerequisites
- Node.js v20+
- Java JDK 17 or 21
- Android Studio (for emulator or real device)
- Expo CLI (`npm install -g expo-cli` optional)
- Backend server (FastAPI, running on your local machine)
- Your phone and computer must be on the same WiFi for real device testing

### 1. Clone the repo
```bash
git clone https://github.com/aimbot6120/expotest.git
cd expotest/testapp-expo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Android SDK (if not already)
Add to your `~/.zshrc` or terminal:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. Create local.properties (if missing)
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### 5. Connect your Android device (or start emulator)
- Enable **Developer Mode** and **USB Debugging** on your phone
- Connect via USB and run:
```bash
adb devices
```
- You should see your device listed

### 6. Start the backend server
On your computer, in the backend folder:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
- Note your computer's local IP (e.g., `192.168.1.4`)
- The Expo app uses this IP to reach the backend

### 7. Run the Expo app on Android
```bash
npx expo run:android
```
- The app will build and install on your device
- If using a real device, make sure the API URL in `app/index.tsx` matches your computer's IP

### 8. Test the Auth Flow
- Enter your test phone number and OTP
- If new user, fill registration fields
- Tokens will be displayed on screen

## Troubleshooting
- If you see SDK errors, check your `ANDROID_HOME` and `local.properties`
- If the app can't reach backend, check your computer's IP and firewall
- For emulator, use `10.0.2.2` as backend URL
- For real device, use your computer's local IP

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
