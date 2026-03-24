"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiLogOut,
  FiCamera,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiCode,
  FiSettings,
  FiLock,
  FiKey,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiDownloadCloud,
  FiBell,
  FiMoon,
  FiSun,
  FiMonitor,
  FiPlus
} from "react-icons/fi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: "", message: "" });
  
  // Tabs: "general", "security", "api", "preferences"
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Preference States
  const [theme, setTheme] = useState("light");
  const [emailAlerts, setEmailAlerts] = useState({
    critical: true,
    weekly: false,
    updates: true
  });

  // API Key States
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "Production Server", key: "sk_log_prod_***9x2P", createdAt: "2024-02-10", lastUsed: "Today" },
    { id: 2, name: "Staging Pipeline", key: "sk_log_stg_***k3mQ", createdAt: "2024-03-01", lastUsed: "Yesterday" }
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
          setName(data.name || "");
          setBio(data.bio || "");
          setImage(data.image || "");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const showToast = (type, message) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus({ type: "", message: "" }), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please upload a valid image file.");
      return;
    }
    processAndCompressImage(file);
  };

  const processAndCompressImage = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 400; const MAX_HEIGHT = 400;
        let width = img.width; let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width; canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setImage(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, bio, image }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Profile updated successfully!");
        setUser(prev => ({ ...prev, name, bio, image })); 
      } else {
        showToast("error", data.error || "Failed to save profile.");
      }
    } catch (error) {
       showToast("error", "Network error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match!");
      return;
    }
    showToast("success", "Password successfully updated! (Demo)");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const handleGenerateApiKey = () => {
    const newKey = {
      id: Date.now(),
      name: "New API Key",
      key: `sk_log_new_***${Math.floor(Math.random()*1000)}`,
      createdAt: "Just now",
      lastUsed: "Never"
    };
    setApiKeys([...apiKeys, newKey]);
    showToast("success", "New API Key generated successfully!");
  };

  const handleRevokeKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    showToast("success", "API Key revoked and disabled.");
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Loading your settings...</p>
        </div>
      </div>
    );
  }

  // Helper for Sidebar Tabs
  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
        activeTab === id
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center md:justify-start">
            <FiSettings className="mr-3 text-emerald-600" />
            Account Settings
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Manage your profile, security, developer APIs, and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-28">
              <nav className="space-y-2">
                <TabButton id="general" icon={FiUser} label="General Profile" />
                <TabButton id="security" icon={FiShield} label="Security & Logins" />
                <TabButton id="api" icon={FiCode} label="Developer API" />
                <TabButton id="preferences" icon={FiSettings} label="Preferences" />
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 hover:border-red-100 border border-transparent transition-all"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Log Out Securely</span>
                </button>
              </div>
            </div>

            {/* Global Save Status Toast (if active) */}
            {saveStatus.message && (
              <div className={`mt-6 flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-sm shadow-sm animate-fade-in ${
                saveStatus.type === "success" 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}>
                {saveStatus.type === "success" ? <FiCheckCircle className="w-5 h-5 shrink-0" /> : <FiAlertCircle className="w-5 h-5 shrink-0" />}
                <span>{saveStatus.message}</span>
              </div>
            )}
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1">
            
            {/* ===================== GENERAL TAB ===================== */}
            {activeTab === "general" && (
              <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden animate-fade-in">
                {/* Profile Header Block */}
                <div className="px-8 py-8 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8 bg-slate-50/50">
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 relative ring-1 ring-slate-200">
                      <img
                        src={image || "https://i.pravatar.cc/150?u=" + user.email}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => { e.target.src = "https://i.pravatar.cc/150?u=" + user.email; }}
                      />
                      <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <FiCamera className="text-white w-8 h-8 mb-1" />
                        <span className="text-white text-xs font-bold">Change</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                       {user?.name || "Anonymous User"}
                    </h2>
                    <div className="inline-flex items-center text-slate-500 font-medium bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-sm">
                      <FiMail className="mr-2 text-slate-400" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                     <FiEdit2 className="mr-3 text-emerald-600" />
                     Personal Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          placeholder="What should we call you?"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                          value={name} onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Professional Bio</label>
                        <textarea
                          placeholder="Tell your team a bit about yourself..." rows="4"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none leading-relaxed"
                          value={bio} onChange={(e) => setBio(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 mt-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Update Profile Picture</label>
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => { e.preventDefault(); handleImageUpload({ target: { files: e.dataTransfer.files }}); }}
                          className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-colors group cursor-pointer"
                          onClick={() => fileInputRef.current.click()}
                        >
                          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <FiCamera className="text-emerald-500 text-2xl" />
                          </div>
                          <p className="text-slate-700 font-bold mb-1">Drag & Drop a new image or Click to Browse</p>
                          <p className="text-slate-500 text-sm font-medium">JPG, PNG, or WEBP (Automatically optimized & compressed)</p>
                          <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 mt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={updateProfile} disabled={isSaving}
                        className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center focus:ring-4 focus:ring-emerald-500/30"
                      >
                        {isSaving ? "Saving..." : <><FiSave className="mr-2" size={20} /> Save Profile Settings</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SECURITY TAB ===================== */}
            {activeTab === "security" && (
              <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden animate-fade-in">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <FiLock className="mr-3 text-emerald-600" />
                    Security & Authentication
                  </h3>
                </div>
                
                <div className="p-8">
                  {/* Password Change Form */}
                  <form onSubmit={handlePasswordChange} className="max-w-xl">
                    <h4 className="text-lg font-bold text-slate-800 mb-6">Change Password</h4>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Current Password</label>
                        <input type="password" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">New Password</label>
                          <input type={showPassword ? "text" : "password"} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Confirm New Password</label>
                          <div className="relative">
                            <input type={showPassword ? "text" : "password"} required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 pr-12" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </form>

                  <hr className="my-10 border-slate-100" />

                  {/* Two Factor Auth */}
                  <div>
                     <h4 className="text-lg font-bold text-slate-800 mb-4">Two-Factor Authentication (2FA)</h4>
                     <p className="text-slate-500 font-medium mb-6">Add an extra layer of security to your account by requiring a secondary verification step during login.</p>
                     
                     <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${twoFactor ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                            <FiShield className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Authenticator App</p>
                            <p className="text-sm text-slate-500">Use apps like Google Authenticator or Authy</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setTwoFactor(!twoFactor); showToast(twoFactor ? "error" : "success", twoFactor ? "2FA Disabled" : "2FA Enabled Successfully!"); }} 
                          className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${twoFactor ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                          {twoFactor ? "Disable 2FA" : "Enable 2FA"}
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== DEVELOPER API TAB ===================== */}
            {activeTab === "api" && (
              <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden animate-fade-in">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <FiCode className="mr-3 text-emerald-600" />
                    Developer API Keys
                  </h3>
                  <button onClick={handleGenerateApiKey} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition">
                    <FiPlus /> <span>Generate New Key</span>
                  </button>
                </div>
                
                <div className="p-8">
                  <p className="text-slate-500 font-medium mb-8">
                    Use these Secret API Keys to authenticate external systems and directly send logs to LogClassify via programmatic HTTP requests.
                  </p>

                  <div className="space-y-4">
                    {apiKeys.map(key => (
                      <div key={key.id} className="p-5 border border-slate-200 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                           <div className="flex items-center space-x-3 mb-2">
                             <h4 className="font-bold text-slate-900">{key.name}</h4>
                             <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-md">Active</span>
                           </div>
                           <div className="flex items-center space-x-2 text-slate-500 font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                              <FiKey className="text-slate-400" />
                              <span>{key.key}</span>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4 md:space-x-6">
                           <div className="text-sm">
                             <p className="text-slate-400 font-bold uppercase text-[10px]">Created</p>
                             <p className="text-slate-700 font-medium">{key.createdAt}</p>
                           </div>
                           <div className="text-sm">
                             <p className="text-slate-400 font-bold uppercase text-[10px]">Last Used</p>
                             <p className="text-slate-700 font-medium">{key.lastUsed}</p>
                           </div>
                           <button onClick={() => handleRevokeKey(key.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Revoke Key">
                             <FiTrash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    ))}
                    {apiKeys.length === 0 && (
                      <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-500 font-medium">No active API keys found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== PREFERENCES TAB ===================== */}
            {activeTab === "preferences" && (
              <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden animate-fade-in">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <FiSettings className="mr-3 text-emerald-600" />
                    System Preferences
                  </h3>
                </div>
                
                <div className="p-8">
                  {/* Appearance Theme */}
                  <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">Appearance Theme</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {["light", "dark", "system"].map((t) => (
                      <button 
                        key={t} onClick={() => { setTheme(t); showToast("success", `Theme set to ${t} (Demo)`); }}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${theme === t ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {t === "light" ? <FiSun className="w-8 h-8 mb-2" /> : t === "dark" ? <FiMoon className="w-8 h-8 mb-2" /> : <FiMonitor className="w-8 h-8 mb-2" />}
                        <span className="font-bold capitalize">{t}</span>
                      </button>
                    ))}
                  </div>

                  {/* Email Notifications */}
                  <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">Email Notifications</h4>
                  <div className="space-y-3 mb-12">
                     <label className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                       <input type="checkbox" checked={emailAlerts.critical} onChange={e => {setEmailAlerts({...emailAlerts, critical: e.target.checked}); showToast("success", "Preferences Saved!")}} className="w-5 h-5 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500 cursor-pointer" />
                       <div className="ml-4">
                         <p className="font-bold text-slate-900">Critical Error Alerts</p>
                         <p className="text-sm font-medium text-slate-500">Email me immediately when a high-confidence ERROR log is analyzed.</p>
                       </div>
                     </label>
                     <label className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                       <input type="checkbox" checked={emailAlerts.weekly} onChange={e => {setEmailAlerts({...emailAlerts, weekly: e.target.checked}); showToast("success", "Preferences Saved!")}} className="w-5 h-5 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500 cursor-pointer" />
                       <div className="ml-4">
                         <p className="font-bold text-slate-900">Weekly System Summary</p>
                         <p className="text-sm font-medium text-slate-500">Receive a weekly digest of your log classifications and system health.</p>
                       </div>
                     </label>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 border-2 border-red-100 bg-red-50/50 rounded-2xl">
                    <h4 className="text-lg font-bold text-red-600 mb-2 flex items-center">Danger Zone</h4>
                    <p className="font-medium text-slate-600 text-sm mb-6">These actions are permanent and cannot be undone. Please proceed with extreme caution.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition shadow-sm">
                         <FiDownloadCloud /> <span>Export All JSON Data</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 bg-red-600 border border-transparent text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 transition shadow-sm">
                         <FiTrash2 /> <span>Delete Account Permanently</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
