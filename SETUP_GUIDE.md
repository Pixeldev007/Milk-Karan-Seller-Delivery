# Complete Setup Guide - Milk Karan App

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## 🚀 Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd "/home/pixel/Downloads/Milk Karan"
```

### Step 2: Install Dependencies

**Option A: Using npm**
```bash
npm install
```

**Option B: Using the install script**
```bash
chmod +x install.sh
./install.sh
```

This will install all required packages:
- React Native
- Expo SDK
- React Navigation
- Vector Icons
- And all other dependencies

### Step 3: Start the Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Open Expo DevTools in your browser
- Display a QR code for mobile testing

## 🖥️ Running on Different Platforms

### Web (Desktop & Mobile Browser)

**Recommended for quick testing!**

```bash
npm run web
```

Or press `w` after running `npm start`

The app will open in your default browser at `http://localhost:19006`

### Android

**Prerequisites:**
- Android Studio installed
- Android emulator running OR
- Physical Android device with Expo Go app

```bash
npm run android
```

Or press `a` after running `npm start`

### iOS (Mac only)

**Prerequisites:**
- Xcode installed
- iOS simulator running OR
- Physical iOS device with Expo Go app

```bash
npm run ios
```

Or press `i` after running `npm start`

### Mobile Device (Easiest Method)

1. Install **Expo Go** app from:
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
   - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

2. Run `npm start` on your computer

3. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app (opens in Expo Go)

## 🎨 App Features

### ✅ Implemented Features

- **Dashboard Screen** with calendar and statistics
- **16 Menu Modules** for dairy management
- **Side Drawer Navigation** with user profile
- **Interactive Calendar** with date selection
- **Statistics Cards** for quick overview
- **Responsive Design** (works on all screen sizes)
- **Light Green Theme** throughout the app
- **Modern UI** with smooth animations

### 📱 Menu Modules

1. My Customer - Customer management
2. Delivery Boy - Delivery personnel tracking
3. Daily Sell - Daily sales recording
4. New Daily Sell - Enhanced sales (NEW!)
5. Create Bill - Bill generation
6. Report - Various reports
7. Products - Product inventory
8. Message - Customer messaging
9. Received Payment - Payment tracking
10. Dispute Request List - Dispute handling
11. Archive - Archived data
12. What's App - WhatsApp integration
13. Milk Report - Quality reports
14. App Message - In-app messaging
15. Group Management - Customer groups
16. Settings - App configuration

## 🛠️ Troubleshooting

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Kill the process using port 19000
kill -9 $(lsof -ti:19000)

# Or use a different port
npm start -- --port 19001
```

### Issue: Expo command not found

**Solution:**
```bash
# Install Expo CLI globally
npm install -g expo-cli
```

### Issue: Web build fails

**Solution:**
```bash
# Install web dependencies
npx expo install react-native-web react-dom @expo/webpack-config
```

### Issue: Module not found errors

**Solution:**
```bash
# Clear Metro bundler cache
npx expo start --clear
```

## 📱 Testing on Different Screen Sizes

### Desktop Browser
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test different screen sizes:
  - Mobile: 375x667 (iPhone SE)
  - Tablet: 768x1024 (iPad)
  - Desktop: 1920x1080

### Responsive Breakpoints
- **Mobile**: < 768px (2 cards per row)
- **Desktop**: ≥ 768px (4 cards per row)

## 🎯 Next Development Steps

### 1. Add Functionality to Menu Cards

Edit `src/screens/DashboardScreen.js` and add navigation:

```javascript
<MenuCard
  title="My Customer"
  icon="people"
  onPress={() => navigation.navigate('CustomerScreen')}
/>
```

### 2. Create New Screens

Create new screen files in `src/screens/`:
- `CustomerScreen.js`
- `DeliveryBoyScreen.js`
- `BillScreen.js`
- etc.

### 3. Add Backend Integration

Install axios for API calls:
```bash
npm install axios
```

### 4. Add State Management

Install Redux or Context API for state management:
```bash
npm install @reduxjs/toolkit react-redux
```

### 5. Add Database

For local storage:
```bash
npx expo install @react-native-async-storage/async-storage
```

## 📚 Useful Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Run on web
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios

# Check for outdated packages
npm outdated

# Update packages
npm update

# Build for production (web)
npx expo export:web
```

## 🔧 Configuration Files

- `package.json` - Dependencies and scripts
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration
- `.gitignore` - Git ignore rules

## 📖 Documentation Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Vector Icons](https://icons.expo.fyi/)

## 💡 Tips

1. **Hot Reload**: Changes auto-refresh in development
2. **Debug Menu**: Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS)
3. **Performance**: Use `React.memo()` for optimization
4. **Icons**: Browse all icons at https://icons.expo.fyi/
5. **Styling**: Use StyleSheet.create() for better performance

## 🆘 Need Help?

- Check the [Expo Forums](https://forums.expo.dev/)
- Visit [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)
- Read the [React Native Community](https://reactnative.dev/help)

## 📄 License

MIT License - Feel free to use and modify!

---

**Happy Coding! 🥛✨**

For custom app development, contact **Ruhiverse Technologies**
