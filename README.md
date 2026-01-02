# JUET Helpdesk Chatbot

An AI-powered helpdesk chatbot for Jaypee University of Engineering and Technology (JUET) Guna. This chatbot provides instant answers to queries about admissions, fees, placements, courses, departments, and more.

## Features

- **AI-Powered Responses**: Uses Google Gemini 2.5 Flash model for intelligent, context-aware answers
- **Real-time Chat**: Streaming responses for a smooth conversational experience
- **Comprehensive Knowledge Base**: Covers admissions, placements, fees, scholarships, departments, and announcements
- **Modern UI**: Built with React, shadcn/ui components, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Chat History**: Maintains conversation context throughout the session
- **Suggestion Chips**: Quick-start questions for common queries

## Technology Stack

### Frontend

- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend

- **Supabase Edge Functions** - Serverless backend (Deno runtime)
- **Google Gemini 2.5 Flash** - AI model via Lovable AI Gateway

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## Project Structure

```
Helpdesk_Chatbot/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── ChatHeader.tsx  # Chat header with branding
│   │   ├── ChatInput.tsx   # Message input field
│   │   ├── ChatMessage.tsx # Message display component
│   │   ├── FloatingWidget.tsx # Floating chat widget
│   │   ├── SuggestionChips.tsx # Quick question suggestions
│   │   └── WidgetChat.tsx  # Main chat interface
│   ├── hooks/              # Custom React hooks
│   │   └── useChat.ts      # Chat logic and API integration
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client and types
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main page
│   │   └── NotFound.tsx    # 404 page
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── supabase/
│   └── functions/
│       └── chat/           # Supabase Edge Function for chat
│           └── index.ts    # Chat API endpoint
├── public/                 # Static assets
├── dist/                   # Build output
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or bun)
- A Supabase account and project
- Lovable AI API key (for the AI model)

### Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd Helpdesk_Chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Deploy Supabase Edge Function**

   Install Supabase CLI:

   ```bash
   npm install -g supabase
   ```

   Link your project and deploy:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy chat
   ```

   Set the `LOVABLE_API_KEY` secret in your Supabase project:

   ```bash
   supabase secrets set LOVABLE_API_KEY=your_lovable_api_key
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## How It Works

1. **User Interface**: The chatbot appears as a floating widget on the page with a clean, modern interface
2. **Message Flow**: When a user sends a message, it's sent to the Supabase Edge Function
3. **AI Processing**: The Edge Function forwards the message to Google Gemini 2.5 Flash via the Lovable AI Gateway
4. **Streaming Response**: The AI's response is streamed back to the frontend in real-time
5. **Knowledge Base**: The AI uses a comprehensive JUET knowledge base to answer university-specific questions

## Knowledge Base Coverage

The chatbot has detailed information about:

- **Admissions**: B.Tech, M.Tech, M.Sc, and PhD programs
- **Eligibility Criteria**: Subject requirements, marks, and qualifications
- **Fees**: Tuition, development fees, and other charges
- **Scholarships**: Armed forces quotas and reservations
- **Placements**: Statistics, top recruiters, salary packages
- **Departments**: CSE, ECE, Mechanical, Civil, Chemical Engineering
- **Latest Announcements**: Registration dates, exam schedules, results

## Customization

### Updating the Knowledge Base

Edit the `JUET_KNOWLEDGE` constant in `supabase/functions/chat/index.ts` to update or add information.

### Modifying the UI

The UI components are in `src/components/`. The chatbot uses shadcn/ui components which can be customized via Tailwind classes.

### Changing the AI Model

Edit the `model` parameter in the Edge Function to use a different model from the Lovable AI Gateway.

## Deployment

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

Make sure to set the environment variables in your deployment platform.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
