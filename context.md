### **Project Overview**  
A WhatsApp-like mobile app built with Expo, offering secure messaging, voice/video calls, and multimedia sharing. Features include end-to-end encryption, offline support, and scalable architecture.  

### **Tech Stack**  
- **Framework**: Expo (React Native)  
- **Language**: TypeScript  
- **Navigation**: Expo Router  
- **UI Library**: React Native Paper  
- **Backend/Auth**: Supabase (Auth, Storage, Realtime)  
- **Deployment**: Expo Go  

---  

### **Expo Setup**  
Initialize Expo project with TypeScript, configure ESLint/Prettier, and set up basic navigation using Expo Router.  

### **Authentication Flow**  
- **Sign-up/Login**: Email/password + OAuth (Google/Apple) via Supabase Auth.  
- **Multi-Factor Auth**: Optional SMS/email 2FA.  
- **Session Management**: Secure JWT storage and auto-login.  

### **Messaging (Real-Time)**  
- **One-on-One Chats**: Supabase Realtime for instant messaging.  
- **Message History**: Fetch/paginate past messages.  
- **Notifications**: Expo Notifications for push alerts.  

### **Multimedia Sharing**  
- **Photos/Videos**: Expo ImagePicker + Supabase Storage.  
- **Documents**: FileSystem API for local handling.  
- **Voice Messages**: Expo AV for recording/playback.  

### **Voice/Video Calls**  
- **WebRTC**: Peer-to-peer calls with react-native-webrtc.  
- **Group Calls**: Mesh networking for ≤4 participants.  

### **Group Features**  
- **Creation/Management**: Supabase groups table with admin roles.  
- **Permissions**: Toggle settings (e.g., mute, add members).  

### **End-to-End Encryption**  
- **Signal Protocol**: Encrypt messages via libsignal-protocol.  
- **Key Management**: Device-specific keys stored securely.  

### **User Interface**  
- **Themes/Dark Mode**: React Native Paper theming.  
- **Chat Customization**: User-selectable colors/wallpapers.  

### **Offline Support**  
- **Queue Messages**: Store outgoing messages via AsyncStorage.  
- **Sync on Reconnect**: Merge offline/online data.  

### **Server Architecture**  
- **Backend**: Supabase (PostgreSQL, Realtime API).  
- **Scalability**: Load-balanced Cloud Functions (if needed).  

### **Security**  
- **Block/Report**: Flag users/content to admins.  
- **Data Encryption**: Encrypt media/files at rest.  

---  
**Note**: Prioritize Expo-compatible libraries (e.g., react-native-webrtc over native modules). Test on Expo Go during development.