# LINMUB

LINMUB is a social discovery platform designed for introverts and people who prefer quieter, interest-driven connections. It combines anonymous thought sharing, AI-powered interest matching, and pseudonymous community participation into a cohesive experience.

## What it does

- Provides an anonymous Agora for sharing thoughts without revealing identity
- Matches users using interest embeddings and a swipe-based discovery stack
- Supports communities with temporary usernames and optional identity reveal
- Enables one-to-one conversations after users resonate with each other
- Lets users customize their profile, interests, and social style

## Core features

- **Anonymous Thought Sharing (Agora)**: Authenticated users publish thoughts, others can resonate or begin anonymous conversations.
- **AI-Powered Interest Matching**: Users manage interests, generate vector embeddings, and discover compatible profiles through swipe interactions.
- **Community Participation**: Create or join niche communities with pseudonymous member identities.
- **Direct Messaging**: One-to-one chat after mutual resonance.
- **Profile Customization**: Configure bio, age, gender (optional), socializing capability, and interests.
- **Community Events**: Organize events for community members with scheduled dates and status management.

## Technologies

- **Frontend**
  - React 19 with hooks-based state management and context API
  - Vite for fast development, bundling, and HMR
  - Tailwind CSS for utility-first responsive design
  - Framer Motion for interactive page and card animations
  - React Router v7 for client-side navigation and protected routes
  - Axios with a shared API client and request interceptor for auth tokens
  - React Hot Toast for lightweight notifications
  - Lucide icons and Tailwind Merge for consistent styling

- **Backend**
  - Node.js and Express.js for REST APIs
  - MongoDB with Mongoose for schema-driven data models
  - dotenv for runtime configuration
  - CORS middleware for frontend/backend communication

- **Authentication**
  - JWT sessions stored in browser localStorage
  - bcrypt for secure password hashing

- **AI Tokenization Model**
  - Xenova/all-MiniLM-L6-v2 for interest embedding generation


## Use cases

1. **Anonymous Thought Sharing (Agora)**
   - Actor: Authenticated User
   - Goal: Share thoughts publicly without revealing identity
   - Description: Users create thoughts around themes and others can resonate and initiate conversations anonymously.

2. **AI-Powered Interest Matching**
   - Actor: Authenticated User with interests configured
   - Goal: Discover compatible friends through interest-based matching
   - Description: Users add multiple interests and a vector is generated. The swipe experience surfaces people with similar interests.

3. **Community Group Participation**
   - Actor: Authenticated User
   - Goal: Join interest-based communities with pseudonymous identity
   - Description: Communities are centered on niches and protect user identity behind temporary names. Members can reveal information selectively.

4. **Direct Messaging**
   - Actor: Authenticated User
   - Goal: Communicate privately with matched users
   - Description: Start one-to-one conversations with users you resonate with, including text and media exchange.

5. **Profile Customization**
   - Actor: Authenticated User
   - Goal: Define socializing style and interests
   - Description: Users set bio, age, gender, socializing capability, and interests to refine their discovery profile.

6. **Community Events**
   - Actor: Community Admin
   - Goal: Organize events for community members
   - Description: Communities can create events, schedule them, and make them visible to members.

## Architecture summary

- **Frontend**: React application running in the browser, consuming backend APIs and rendering discovery, chat, community, and profile workflows.
- **Backend**: Express API server handling auth, user profiles, thoughts, chat, communities, and interactions.
- **Database**: MongoDB stores users, thoughts, communities, conversations, messages, and events.
- **AI Matching**: Interest embeddings are generated from user interest lists and used to compare compatibility.

## WebTech elements

- The frontend entry point is `frontend/src/main.jsx`, which initializes React, global auth context, and toast notifications.
- `frontend/src/api/axios.js` defines a shared Axios instance that attaches the current JWT token to API requests.
- `frontend/src/context/AuthContext.jsx` exposes auth state, login/register helpers, and startup token validation via React Context.
- `frontend/src/App.jsx` defines the main router with a public landing page and protected routes for the authenticated app shell.
- `frontend/src/components/Layout.jsx` implements the app shell, sidebar navigation, responsive header, and mobile-aware view.
- Tailwind CSS utility classes are used throughout for layout, spacing, typography, glassmorphism effects, and responsive breakpoints.
- Framer Motion powers swipe card transitions, page fades, and interactive hover state animations.
- The app uses environment variables via `frontend/.env` to connect to the backend API.


## Database design

- The project uses **MongoDB** as a document database.
- **Mongoose** defines schema models for each collection, enforcing structure while keeping flexibility for app-specific fields.
- The backend persists core entities in separate collections: `users`, `thoughts`, `communities`, `interactions`, `conversations`, `messages`, and `events`.
- User documents hold profile fields plus an `interestEmbedding` vector used for AI-based compatibility scoring.
- Thought and community documents support pseudonymous attributes so anonymous posts and temporary usernames can be stored without revealing real identity.
- Conversations and messages are linked by document references, enabling chat history and anonymous aliasing across discussions.
- The app connects to MongoDB through `backend/server.js` using `mongoose.connect(...)` and a `.env` database URL.
- API controllers read and write MongoDB documents through Mongoose models, with auth middleware protecting user-specific operations.

## Database model overview

- **User**: username, password, bio, age, gender, interests, interestEmbedding, socializingCapability, isVisible
- **Thought**: author, content, isAnonymous, community, resonates, media, timestamps
- **Community**: name, description, niche, members, temporaryUsername, role, timestamps
- **Interaction**: swiper, swipee, action, timestamps
- **Conversation**: participants, isInstantMatch, isAnonymous, type, community, suggestedTopics
- **Message**: conversation, sender, senderAlias, mentions, content, media, isRead, timestamps
- **Event**: community, organizer, organizerAlias, title, description, scheduledDate, locationOrLink, status, timestamps

## Running the app

- Frontend development: `npm run dev` from `frontend/`
- Backend development: `node server.js` or `npm run dev` from `backend/`

## Notes

- The frontend expects `VITE_API_URL` to point to the backend API.
- Anonymity is a core focus: thoughts are posted anonymously and community identities are pseudonymous.
- Security uses JWT authentication and bcrypt password hashing.
