# PhishingShield AI 🛡️

Advanced phishing detection powered by Google's Gemini AI. Protect your organization from sophisticated email threats and malicious workloads in real-time.

![PhishingShield AI Dashboard](https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=2000)

## Features

- 🔍 Real-time email scanning
- 🤖 Gemini AI-powered threat detection
- ☁️ Cloud workload monitoring
- 📧 Seamless Gmail integration
- 🚫 One-click threat blocking
- 📊 Detailed security analytics
- 🔐 OAuth 2.0 authentication
- 📱 Responsive web dashboard

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Chrome Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `chrome-extension` directory
4. Configure your API keys in `config.js`

## Gmail Add-on

1. Open Google Apps Script editor
2. Create a new project
3. Copy contents from `gmail-addon` directory
4. Deploy as Gmail Add-on

## Environment Variables

Create a `.env` file with:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_REDIRECT_URI=your_redirect_uri
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Google Gemini AI
- Chrome Extensions API
- Google Workspace Add-ons SDK
- Zustand
- React Hot Toast

## Architecture

```
src/
├── components/        # React components
├── services/         # API and external services
├── store/           # State management
├── types/           # TypeScript definitions
└── utils/           # Helper functions

chrome-extension/    # Chrome extension files
gmail-addon/        # Gmail Add-on files
```

## Security Features

- Real-time email analysis
- Phishing detection
- Link scanning
- Attachment analysis
- Domain verification
- Traffic pattern monitoring
- Threat intelligence
- One-click blocking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- Documentation: [docs.phishingshield.ai](https://docs.phishingshield.ai)
- Issues: [GitHub Issues](https://github.com/phishingshield/issues)
- Email: support@phishingshield.ai

## Acknowledgments

- Google Gemini AI team
- Chrome Extensions community
- Google Workspace developers

---

Made with ❤️ by PhishingShield Team