# Beem — Your AI Engineer

#### video was recorded: Sunday june/29/2025, 19:14:33
####**Live Demo on YouTube**: [https://youtu.be/UknVReItwhw](https://youtu.be/UknVReItwhw)

---

## 📌 Project Overview

**Beem** an AI-powered web application built was a final project for Harvard's CS50 course.  
Its primary purpose is to help non-technical users interact with an artificial intelligence system 
that assists them in generating code, answering questions, and facilitating productive conversations 
related to software development and AI. Inspired by tools like **ChatGPT** and **Lovable.dev**, Beem 
combines a conversational interface with advanced backend logic to help users technical or not, build 
what they envision using the art of programming. The app delivers an intuitive and easy-to-use experience, 
particularly for developers or learners who want to engage with AI in a structured, helpful environment.
Users can ask technical or conceptual questions, receive AI-generated code snippets, or simply use the 
interface as a productivity companion.

---

## ✨ Core Features

- **Chat Interface**: A sleek, responsive UI that works across desktop, tablet, and mobile.
- **Dynamic Token Tracking**: Each user has a limited token balance; the app deducts tokens with each AI interaction and updates it in real time.
- **AI Integration**: Communicates with Google's Gemini model via an API to generate AI responses.
- **Persistent Conversations**: Conversations are saved by workspace using Convex, enabling users to return to past sessions.
- **Chat History**: Users can browse and reuse their previous AI chats and saved projects.
- **User Authentication**: Each user has a profile with avatar and token limits.
- **Real-time Feedback**: Visual loaders indicate when the AI is generating a response.

---

## File & Folder Structure

### `/pages/api/ai-chat.js`
Handles API route for submitting prompts to the AI (Google's Gemini) and returning the response. Acts as the brain of the AI logic.

### `/components/ChatView.jsx`
Main React component for the chat UI. Displays all messages, manages input, triggers token deductions, and shows AI/user chat bubbles.

### `/context/UserDetailContext.jsx`
Manages global user-specific data like token balance and avatar. Used across multiple components.

### `/context/MessagesContext.jsx`
Manages the state for all chat messages in a session/workspace, ensuring clean data flow and reactivity.

### `/data/Colors.jsx`
Holds all color constants to maintain UI consistency and theme flexibility.

### `/data/Prompt.jsx`
Contains default prompts that are prepended to user input to structure the AI's replies.

### `/convex/schema.js`
Handles database logic using Convex functions for updating messages, token usage, and user data persistence.

### `/public/`
Stores static assets like avatars, logos, and placeholder images.

---

## Design Decisions

### 1. **React + Context API**
React was used for modular UI development, and Context API was chosen to manage state globally without excessive prop-drilling.

### 2. **Convex for Backend**
Convex was used for its real-time querying and functional approach to backend logic. It's lightweight, scalable, and affordable—ideal for this project's MVP scope.

### 3. **Tailwind CSS**
A utility-first framework like Tailwind CSS enabled fast, responsive UI development with minimal overhead and custom class naming.

### 4. **Robust AI Response Handling**
AI responses were parsed to detect valid JSON structures or fallback to raw text, improving reliability and flexibility in how answers are presented.

### 5. **Token Limiting System**
To simulate real-world limitations (like API quotas), each user has a token budget. Tokens are subtracted based on the length of AI responses, promoting thoughtful usage.

---

## Future Improvements

- **Multi-AI Model Support**: Let users switch between different AI models based on their needs and preferences.
- **Multi-Language & Framework Support**: Currently limited to React; support for other languages/frameworks will enhance flexibility.
- **Custom Avatars**: Allow users to upload or generate their own visual identity.
- **Voice Input**: Add voice-to-text functionality for hands-free AI interactions.
- **App Store Availability**: Plan to launch as a native app to make Beem available beyond the web.

---

## How to Run This Project Locally

### Prerequies

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (for cloning the repository)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd beem.ai
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Create the environment file
touch .env.local
```

Add the following environment variables to `.env.local`:

```env
# Convex Database (Required)
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Google OAuth (Required)
NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY=your_google_oauth_client_id

# Google Gemini AI (Required)
GEMINI_API_KEY=your_gemini_api_key
```

### Step 4: Get Your API Keys

#### 1. Convex Database Setup
1. Go to [convex.dev](https://convex.dev)
2. Create a new account or sign in
3. Create a new project
4. Copy your deployment URL (looks like: `https://your-project.convex.cloud`)

#### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized origins: `http://localhost:3000`
7. Add authorized redirect URIs: `http://localhost:3000`
8. Copy the Client ID

#### 3. Google Gemini AI Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### Step 5: Run the Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Step 6: Build for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Troubleshooting

#### Common Issues:

1. **"Module not found" errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment variables not loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server after adding environment variables
   - Check that variable names match exactly (case-sensitive)

3. **Google OAuth not working**
   - Verify your Client ID is correct
   - Check that `http://localhost:3000` is in authorized origins
   - Ensure the Google+ API is enabled

4. **Convex connection issues**
   - Verify your Convex URL is correct
   - Check that your Convex project is active
   - Ensure you're using the correct deployment URL

5. **Gemini AI errors**
   - Verify your API key is correct
   - Check your API quota and billing status
   - Ensure the API key has the necessary permissions

### Project Structure for Developers

```
beem.ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (main)/            # Main application pages
│   └── layout.js          # Root layout
├── components/            # React components
│   ├── custom/           # Custom application components
│   └── ui/               # Reusable UI components
├── convex/               # Convex backend functions
├── context/              # React context providers
├── data/                 # Static data and configurations
├── configs/              # AI model configurations
└── public/               # Static assets
```

### Key Dependencies

#### Frontend
- **Next.js 15**: React framework with App Router
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library

#### Backend & AI
- **Convex**: Real-time database and backend
- **Google Gemini AI**: AI model for code generation
- **Google OAuth**: User authentication

#### Development Tools
- **TypeScript**: Type safety (optional)
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console for error messages
3. Ensure all environment variables are set correctly
4. Verify all dependencies are installed

For additional help, please open an issue on GitHub with:
- Your operating system
- Node.js version
- Error messages
- Steps to reproduce the issue

---

**I think that's pretty much it !** 
