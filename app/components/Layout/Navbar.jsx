"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { FiHome, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX, FiLayout, FiActivity, FiCpu, FiMoon, FiSun } from "react-icons/fi";

export default function Navbar() {
  const { user, token, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (loading) {
    return (
      <nav className="fixed top-0 w-full z-50 h-[72px] border-b border-emerald-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl animate-pulse"></div>
            <div className="h-6 w-32 bg-emerald-50 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="h-5 w-20 bg-emerald-50 rounded animate-pulse hidden md:block"></div>
            <div className="h-10 w-10 bg-emerald-50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  const loggedIn = !!token;

  // NavLink Component: Soft, appealing green active states
  const NavLink = ({ href, icon: Icon, children }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-300 ${
          isActive 
            ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100" 
            : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50"
        }`}
      >
        <Icon className={`w-[18px] h-[18px] ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/90 backdrop-blur-xl border-b border-emerald-100/50 shadow-lg shadow-emerald-900/5" 
            : "bg-white border-b border-emerald-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 group focus:outline-none"
              onClick={closeMobileMenu}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 transform group-hover:-translate-y-0.5">
                <FiActivity className="text-white w-6 h-6 stroke-[2.5px]" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-800">
                LogClassify
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1.5 list-none">
              <NavLink href="/" icon={FiHome}>Home</NavLink>
              <NavLink href="/upload" icon={FiCpu}>Analyze Log</NavLink>
              
              {loggedIn && (
                <>
                  <NavLink href="/dashboard" icon={FiLayout}>Dashboard</NavLink>
                </>
              )}
            </div>

            {/* Desktop Right Section (Auth / Profile) */}
            <div className="hidden md:flex items-center space-x-5">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all outline-none"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              {loggedIn ? (
                <div className="flex items-center space-x-4 pl-5 border-l border-emerald-100">
                  <Link 
                    href="/profile"
                    className="flex items-center space-x-3 py-1.5 px-1.5 pr-4 rounded-full border border-emerald-100/80 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm ring-1 ring-emerald-100/50 group-hover:bg-emerald-100 transition-colors">
                      {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-600 group-hover:text-emerald-800 transition-colors max-w-[140px] truncate">
                      {user?.name || user?.email?.split('@')[0] || "User"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all outline-none"
                    title="Log out"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/login" 
                    className="text-[15px] font-medium text-slate-500 hover:text-emerald-700 px-3 py-2 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup" 
                    className="flex items-center space-x-1.5 text-[15px] font-medium bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Get Started</span>
                    <FiUserPlus className="w-4 h-4 ml-1 opacity-90" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 -mr-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-emerald-100 absolute w-full shadow-2xl shadow-emerald-900/10 ${
            mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 border-transparent shadow-none"
          }`}
        >
          <div className="px-4 py-5 space-y-1.5">
            <Link 
              href="/" 
              className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${pathname === '/' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
              onClick={closeMobileMenu}
            >
              <FiHome className={`w-5 h-5 ${pathname === '/' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Home</span>
            </Link>

            <Link 
              href="/upload" 
              className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${pathname === '/upload' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
              onClick={closeMobileMenu}
            >
              <FiCpu className={`w-5 h-5 ${pathname === '/upload' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Analyze Log</span>
            </Link>

            {loggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${pathname === '/dashboard' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                  onClick={closeMobileMenu}
                >
                  <FiLayout className={`w-5 h-5 ${pathname === '/dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/profile" 
                  className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${pathname === '/profile' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                  onClick={closeMobileMenu}
                >
                  <FiUser className={`w-5 h-5 ${pathname === '/profile' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Profile</span>
                </Link>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center px-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mr-4 shadow-sm ring-1 ring-emerald-100">
                      {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-slate-800">{user?.name || user?.email?.split('@')[0] || "User"}</span>
                      <span className="text-sm text-slate-500 truncate max-w-[200px]">{user?.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-4 py-3.5 text-[15px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Log out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 pt-6 border-t border-slate-100 space-y-3">
                <Link 
                  href="/login" 
                  className="flex items-center justify-center space-x-2 px-4 py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors w-full"
                  onClick={closeMobileMenu}
                >
                  <span>Log in</span>
                </Link>
                <Link 
                  href="/signup" 
                  className="flex items-center justify-center w-full space-x-2 px-4 py-3 bg-emerald-600 text-white text-[15px] font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                  onClick={closeMobileMenu}
                >
                  <span>Get Started for Free</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-[72px] w-full bg-transparent"></div>
    </>
  );
}