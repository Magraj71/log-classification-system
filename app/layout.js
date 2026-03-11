import { AuthProvider } from "@/app/contexts/AuthContext";
import Navbar from './components/Layout/Navbar';
import './globals.css';

export const metadata = {
  title: 'Log Classification System',
  description: 'Classify your logs with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}