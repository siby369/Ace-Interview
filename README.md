# Ace Interview

Ace Interview is an AI-powered mock interview platform designed to help candidates prepare for technical and behavioral interviews. The platform provides role-specific interview questions, audio recording capabilities, and comprehensive AI-driven feedback on both answer content and pronunciation.

<p align="center">
  <img src="images_readme/preview.mp4" width="100%">
</p>

![Demo](images_readme/preview.mp4)

## Features

### Role-Based Interview Practice
- Support for multiple professional roles including Software Engineer, Product Manager, UX Designer, and Data Analyst
- Customizable topic selection with difficulty levels (Easy, Medium, Hard)
- Comprehensive topic coverage tailored to each role

### AI-Generated Questions
- Dynamic question generation using Google Genkit AI
- Questions tailored to selected role and topics
- Support for both conceptual/behavioral questions and coding problems
- Intelligent difficulty scaling

### Audio Recording and Feedback
- Real-time audio recording for interview answers
- AI-powered feedback on answer content and delivery
- Detailed pronunciation analysis and scoring
- Instant performance insights

### Pronunciation Practice
- Dedicated pronunciation practice module
- Detailed feedback on speech clarity and accuracy
- Pronunciation scoring system

## Technology Stack

### Frontend
- **Framework**: Next.js 15.3.3 with React 18.3.1
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### AI and Backend
- **AI Framework**: Google Genkit 1.14.1
- **AI Provider**: Google AI (via @genkit-ai/googleai)
- **Server Actions**: Next.js Server Actions for AI flow execution

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js Turbopack
- **Linting**: ESLint
- **Type Checking**: TypeScript

### Hosting
- **Static Hosting**: Firebase Hosting
- **Build Output**: Static export to `out` directory

## Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Google AI API key (for Genkit AI functionality)
- Firebase account (for hosting, optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/siby369/Ace-Interview
cd Ace-Interview
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```

4. Configure Firebase (if deploying):
```bash
firebase login
firebase init
```

## Development

### Start Development Server

Run the Next.js development server:
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

### Start Genkit AI Development Server

In a separate terminal, start the Genkit development server:
```bash
npm run genkit:dev
```

Or with watch mode for automatic reloading:
```bash
npm run genkit:watch
```

### Available Scripts

- `npm run dev` - Start Next.js development server with Turbopack on port 9002
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit with watch mode for auto-reloading
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking without emitting files

## Configuration

### Next.js Configuration

The project uses Next.js 15 with the following configuration:
- TypeScript build errors are ignored during builds
- ESLint errors are ignored during builds
- Remote image patterns configured for external image sources

### Firebase Hosting

The project is configured for Firebase Hosting with:
- Public directory: `out`
- Ignore patterns for Firebase config, hidden files, and node_modules

### Environment Variables

Required environment variables:
- `GOOGLE_GENAI_API_KEY`: Your Google AI API key for Genkit functionality

## Deployment

### Firebase Hosting

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy --only hosting
```

### Build Output

The application builds to a static export in the `out` directory, which is configured as the public directory for Firebase Hosting.

## Live Demo

- Primary Demo: https://ace-interview-2kxa.vercel.app/
- Alternative Demo: https://twmp-taupe.vercel.app/

## Design System

### Color Palette
- Primary: Deep Blue (#3F51B5) - Professional and trustworthy
- Background: Light Blue-Gray (#E8EAF6) - Clean and calming
- Accent: Soft Green (#8BC34A) - Encouraging and growth-oriented

### Typography
- Headlines: Space Grotesk (sans-serif)
- Body: Inter (sans-serif)

## Contributing

This is a private project. For contributions or questions, please contact the project maintainers.

## License

Copyright 2025 Ace Interview. All rights reserved.
