"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiLogOut,
  FiCamera,
  FiSave,
} from "react-icons/fi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    processImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!file) return;

    processImage(file);
  };

  const processImage = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          bio,
          image,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (res.ok) {
        // Show success message
        alert("Profile updated successfully");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (error) {
      alert("An error occurred while updating");
    } finally {
      setIsSaving(false);
    }
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
          <p className="text-slate-600 font-medium text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 mt-4">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center tracking-tight">
            <FiUser className="mr-3 text-emerald-600" />
            Profile Settings
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Manage your account information and preferences
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-400/10 border-b border-slate-100 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-multiply"></div>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-10">
            {/* Avatar Section */}
            <div className="flex justify-center -mt-20 mb-6 relative z-10">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-slate-100 relative">
                  <img
                    src={image || "https://i.pravatar.cc/150?u=" + user.email}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://i.pravatar.cc/150?u=" + user.email;
                    }}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiCamera className="text-white w-8 h-8" />
                  </div>
                </div>
                <label className="absolute bottom-2 right-2 bg-emerald-600 text-white rounded-full p-3 cursor-pointer hover:bg-emerald-700 hover:scale-110 transition-all shadow-xl ring-4 ring-white">
                  <FiCamera className="w-5 h-5" />
                  <input
                    type="text"
                    className="hidden"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </label>
              </div>
            </div>

            {/* Email Display */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                {name || "Add your name"}
              </h2>
              <div className="flex items-center justify-center text-slate-500 font-medium bg-slate-50 px-4 py-1.5 rounded-full w-fit mx-auto border border-slate-200">
                <FiMail className="mr-2 text-slate-400" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Bio Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none leading-relaxed"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <p className="text-xs font-bold text-slate-400 mt-2">
                  Brief description for your profile. URLs are hyperlinked.
                </p>
              </div>

              {/* Profile Image URL Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Profile Image URL
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <FiCamera className="text-emerald-500 text-2xl" />
                  </div>

                  <p className="text-slate-700 font-bold mb-1">
                    Drag & Drop your profile image here
                  </p>

                  <p className="text-slate-500 text-sm font-medium">
                    or click to browse a file manually
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />

                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg mt-4 inline-block hover:bg-emerald-100 transition-colors"
                  >
                    Browse Local File
                  </label>
                </div>
                {image && (
                   <div className="mt-6 flex flex-col items-center">
                    <p className="text-sm font-bold text-slate-500 mb-3">Image Preview</p>
                    <img
                        src={image}
                        className="w-32 h-32 rounded-3xl object-cover shadow-sm ring-1 ring-slate-200"
                    />
                  </div>
                )}
                
                <div className="mt-4">
                  <input
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Or paste an image URL directly here..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 mt-4 border-t border-slate-100">
                <button
                  onClick={updateProfile}
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-4 border-emerald-200 border-t-white rounded-full animate-spin mr-3"></div>
                      Saving Updates...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" size={20} />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  onClick={logout}
                  className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-4 px-6 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center focus:outline-none"
                >
                  <FiLogOut className="mr-2" size={20} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-slate-900 font-bold mb-5 flex items-center text-lg">
            <FiEdit2 className="mr-3 text-emerald-600" />
            Account Information Details
          </h3>
          <div className="space-y-4 text-sm font-medium">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Member since</span>
              <span className="text-slate-900 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Last updated</span>
              <span className="text-slate-900 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Account status</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded border border-emerald-100 flex items-center">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                 Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
