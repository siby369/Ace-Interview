# Ace Interview

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/siby369/Ace-Interview?style=social)](https://github.com/siby369/Ace-Interview/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/siby369/Ace-Interview?style=social)](https://github.com/siby369/Ace-Interview/network/members)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub issues](https://img.shields.io/github/issues/siby369/Ace-Interview)](https://github.com/siby369/Ace-Interview/issues)

A powerful **AI-Powered Mock Interview** platform designed to help candidates prepare for technical and behavioral interviews. Ace Interview leverages Google Genkit and AI to provide actionable feedback, helping users improve their performance and communication skills.

🌐 **Live Website:** [Ace Interview Live Demo](https://ace-interview-2kxa.vercel.app/)

## Screenshots

<p align="center">
  <img src="./images_readme/preview_2.gif" width="100%">
</p>

## Features

- **Role-Based Practice**: Support for multiple roles including Software Engineer, Product Manager, UX Designer, and Data Analyst.
- **AI-Powered Questions**: Dynamic question generation using Google Genkit based on difficulty levels and specific topics.
- **Audio Feedback**: Real-time recording and AI-driven analysis of answer content and pronunciation.
- **Pronunciation Scoring**: Detailed feedback on speech clarity and accuracy with a dedicated scoring system.
- **Fast & Modern**: Built with Next.js 15 and React 18 for high performance and a seamless user experience.
- **Interactive UI**: Sleek, responsive design optimized for preparation across all devices.

## Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### AI and Backend
![Genkit](https://img.shields.io/badge/Genkit-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## Quick Start

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/siby369/Ace-Interview.git

# Navigate to project directory
cd Ace-Interview

# Install dependencies
npm install
```

### Running Locally

```bash
# Create a .env file with your credentials
# GOOGLE_GENAI_API_KEY=your_api_key_here

# Start development server
npm run dev

# Start Genkit AI development server (optional)
npm run genkit:dev
```

## Project Structure

```
Ace-Interview/
├── src/                # Application source code
│   ├── app/            # Next.js App Router pages
│   ├── components/     # UI components
│   ├── ai/             # Genkit AI flows and config
│   └── lib/            # Utility functions
├── images_readme/      # Documentation assets
├── public/             # Static assets
└── README.md           # Project documentation
```

## Contributing

Contributions are always welcome! Here's how you can help:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Ace Interview

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contact

**Developer** - [Siby R](https://github.com/siby369)

**Project Link:** [https://github.com/siby369/Ace-Interview](https://github.com/siby369/Ace-Interview)

## Acknowledgments

- [Google GenAI](https://ai.google.dev/) - For providing powerful AI capabilities
- [Vercel](https://vercel.com/) - For hosting and deployment
- [Genkit](https://firebase.google.com/docs/genkit) - For AI flow orchestration
