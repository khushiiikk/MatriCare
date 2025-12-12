# MatriCare - Maternal Health & Wellness Platform

A comprehensive, multilingual React web application for maternal health care, designed specifically for rural India. Features a beautiful, calming design with modern UI/UX patterns.

## 🎨 Color Palette

- **Mauve**: #9B7B7E (Primary)
- **Peach**: #E5C4C0 (Secondary)
- **Cream**: #EDE8C8 (Background)
- **Mint Green**: #E8F0D7 (Accent)

## ✨ Features

### 🔐 Authentication
- Phone number (OTP) authentication via Firebase
- Password-based login
- Secure user session management

### 🌍 Multilingual Support
- Full support for 4 languages: English, Hindi, Marathi, Tamil
- Dynamic language switching
- All content translated including UI, exercises, and chatbot responses

### 🤰 Pregnancy Tracking
- Trimester-specific yoga exercises (6+ exercises per trimester)
- Step-by-step instructions with video tutorials
- Personalized dashboard with pregnancy progress
- Week-by-week tracking

### 💬 AI Chatbot
- Multilingual support (responds in selected language)
- Maternal health guidance
- Animated robot mascot
- Context-aware responses

### 🏥 Healthcare Services
- **Find Care**: Interactive map to locate nearby healthcare facilities
  - ASHA Centers
  - Government Hospitals
  - Ambulances
  - Pharmacies
- **SOS Emergency Button**: Quick access to emergency services (102, 100, 108)

### 📊 Health Analytics
- Pregnancy progress visualization
- Health metrics tracking
- Appointment history
- Immunization records

### ⚙️ Settings & Customization
- Profile management
- Language preferences
- Notification settings
- Theme customization

### 📚 Educational Content
- Trimester-specific information
- Nutrition guidance
- Exercise recommendations
- Health tips and articles

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/khushiiikk/MatriCare.git
cd MaternalHealth
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Update `src/firebase.js` with your Firebase configuration
   - Enable Phone Authentication in Firebase Console
   - Add authorized domains for deployment

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
powershell -ExecutionPolicy Bypass -Command "npm run build"
```

Or simply:
```bash
npm run build
```

## 📁 Project Structure

```
MaternalHealth/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── SOSButton.jsx
│   │   └── Robot.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Trimester1.jsx
│   │   ├── Trimester2.jsx
│   │   ├── Trimester3.jsx
│   │   ├── Chatbot.jsx
│   │   ├── FindCare.jsx
│   │   ├── Analytics.jsx
│   │   └── Settings.jsx
│   ├── context/            # React Context
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── utils/              # Utility functions
│   │   └── dateUtils.js
│   ├── firebase.js         # Firebase configuration
│   ├── App.jsx            # Main app component
│   └── index.css          # Global styles
├── public/                # Static assets
├── netlify.toml          # Netlify configuration
├── vercel.json           # Vercel configuration
└── vite.config.js        # Vite configuration
```

## 🌐 Deployment

### Quick Deploy

The project is configured for easy deployment to Netlify or Vercel:

**Netlify:**
1. Push to GitHub
2. Connect repository to Netlify
3. Build settings are auto-configured via `netlify.toml`
4. Deploy!

**Vercel:**
1. Push to GitHub
2. Import project to Vercel
3. Configuration is auto-detected via `vercel.json`
4. Deploy!

### Post-Deployment
- Add your deployment domain to Firebase authorized domains
- Test all features on the live site
- Verify multilingual functionality

For detailed deployment instructions, see `.agent/workflows/deploy.md`

## 🛠️ Technologies

### Core
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing

### Authentication & Backend
- **Firebase Authentication** - Phone & password auth
- **Firebase Analytics** - Usage tracking

### Maps & Location
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet

### Styling
- **CSS3** - Custom properties and modern CSS
- **Responsive Design** - Mobile-first approach
- **Animations** - Smooth transitions and micro-interactions

## 🌟 Key Highlights

- **Offline-First Design**: Core features work without internet
- **Accessibility**: WCAG compliant, keyboard navigation
- **Performance**: Optimized bundle size, lazy loading
- **SEO**: Proper meta tags and semantic HTML
- **Security**: Secure authentication, data protection

## 🤝 Contributing

This is an educational project for maternal health awareness in rural India.

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

Built with care for maternal health and wellness in rural India.
