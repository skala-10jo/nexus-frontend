# Language Learning Platform - Frontend

Vue 3 frontend application with Tailwind CSS, Vue Router, and Pinia state management.

## Features

- **Authentication**: Login and registration with JWT tokens
- **Responsive Sidebar Navigation**: Animated sidebar with collapsible submenus
- **Orange Gradient Theme**: Custom orange gradient colors (#FF6B3D → #FF8A5C → #FFA07A)
- **Protected Routes**: Route guards for authenticated access
- **Modern UI**: Clean, professional interface with Tailwind CSS

## Prerequisites

- Node.js >= 18
- Backend API running on http://localhost:3000

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

The `.env` file is already configured to connect to the local backend:

```
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will start on http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/
│   │   └── Sidebar.vue  # Main sidebar navigation
│   ├── views/           # Page components
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── Settings.vue
│   │   ├── management/  # Management feature pages
│   │   ├── conversation/ # Conversation feature pages
│   │   ├── translation/ # Translation feature pages
│   │   └── collaboration/ # Collaboration feature pages
│   ├── router/
│   │   └── index.js     # Vue Router configuration
│   ├── stores/
│   │   └── auth.js      # Pinia authentication store
│   ├── services/
│   │   └── api.js       # Axios API client
│   ├── App.vue          # Main app component
│   ├── main.js          # Application entry point
│   └── style.css        # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features Overview

### 🏠 Dashboard
- Welcome card with user information
- Quick action buttons
- Activity overview

### 📄 Management
- **Document Upload**: File upload interface
- **Project Management**: Project list and creation
- **Glossary**: Terminology dictionary
- **Schedule**: Calendar and event management

### 💬 Conversation
- **Scenario Practice**: Conversation scenarios (Business, Shopping, Travel)
- **Expression Practice**: Common phrases and expressions
- **Mistakes Review**: Track and review mistakes

### 🌐 Translation
- **Text Translation**: Translate text between languages
- **Voice Translation**: Speech-to-text translation
- **Video Translation**: Video subtitle translation

### ✉️ Collaboration
- **Mail**: Email-like interface
- **Messenger**: Chat messaging system

### ⚙️ Settings
- Profile management
- Notification preferences

## Navigation Structure

All routes are protected and require authentication:

```
/ - Dashboard
/management/document-upload
/management/project
/management/glossary
/management/schedule
/conversation/scenario
/conversation/expression
/conversation/mistakes
/translation/text
/translation/voice
/translation/video
/collaboration/mail
/collaboration/messenger
/settings
```

## Authentication Flow

1. User visits the app
2. If not authenticated, redirected to `/login`
3. User can login with existing credentials or register
4. Upon successful authentication, JWT token is stored in localStorage
5. Token is automatically included in all API requests
6. User can navigate all protected routes
7. Logout clears token and redirects to login

## Styling

The application uses Tailwind CSS with custom orange gradient colors:

- **Primary**: `#FF6B3D`
- **Medium**: `#FF8A5C`
- **Light**: `#FFA07A`

Orange gradient is applied to:
- Sidebar background
- Login page background
- Buttons and interactive elements
- Active navigation states

## Icons

The application uses Heroicons for all icons:
- Home, Document, Chat, Globe, Envelope, Cog, Chevron, etc.

## State Management

Pinia store (`stores/auth.js`) manages:
- User authentication state
- Current user data
- Login/logout operations
- Token persistence
- Auth state initialization

## API Integration

Axios client (`services/api.js`) provides:
- Automatic JWT token injection
- Response/request interceptors
- Error handling
- Token expiration handling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
