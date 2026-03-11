"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext"; // Import the auth hook
import { FiHome, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX, FiLayout } from "react-icons/fi";

export default function Navbar() {
  const { user, token, logout, loading } = useAuth(); // Get auth state from context
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout(); // Use context logout
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Show loading state if needed
  if (loading) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const loggedIn = !!token;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
            onClick={closeMobileMenu}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform">
              <span className="text-white font-bold text-lg">LC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              LogClassify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors group"
            >
              <FiHome className="group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </Link>

            {loggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <FiLayout className="group-hover:scale-110 transition-transform" />
                  <span>Dashboard</span>
                </Link>

                <Link 
                  href="/profile" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <FiUser className="group-hover:scale-110 transition-transform" />
                  <span>Profile</span>
                </Link>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">
                    Hi, <span className="font-semibold text-gray-700">{user?.name || user?.email || "User"}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-md hover:shadow-red-500/25"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors group"
                >
                  <FiLogIn className="group-hover:scale-110 transition-transform" />
                  <span>Login</span>
                </Link>

                <Link 
                  href="/signup" 
                  className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md hover:shadow-blue-500/25"
                >
                  <FiUserPlus />
                  <span>Signup</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6 text-gray-600" />
            ) : (
              <FiMenu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="bg-white border-t border-gray-100 shadow-lg px-4 py-4 space-y-3">
          {/* Mobile User Greeting (when logged in) */}
          {loggedIn && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-800">{user?.name || user?.email || "User"}</p>
            </div>
          )}

          <Link 
            href="/" 
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={closeMobileMenu}
          >
            <FiHome className="text-blue-500" />
            <span className="font-medium">Home</span>
          </Link>

          {loggedIn ? (
            <>
              {/* Dashboard Link for Mobile */}
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                <FiLayout className="text-blue-500" />
                <span className="font-medium">Dashboard</span>
              </Link>

              {/* Profile Link for Mobile */}
              <Link 
                href="/profile" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                <FiUser className="text-blue-500" />
                <span className="font-medium">Profile</span>
              </Link>

              {/* Logout Button for Mobile */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                <FiLogIn className="text-blue-500" />
                <span className="font-medium">Login</span>
              </Link>

              <Link 
                href="/signup" 
                className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                onClick={closeMobileMenu}
              >
                <FiUserPlus />
                <span className="font-medium">Signup</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}