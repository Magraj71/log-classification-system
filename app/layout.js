import { AuthProvider } from "@/app/contexts/AuthContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import Navbar from './components/Layout/Navbar';
import './globals.css';

export const metadata = {
  title: 'LogClassify AI — Intelligent Log Classification System',
  description: 'Multi-model AI-powered log analysis platform combining Regex, NLP, and Gemini LLM for automatic log classification, severity scoring, and code fix suggestions.',
  keywords: 'log analysis, error classification, AI, NLP, regex, Gemini, log monitoring',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
       <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}