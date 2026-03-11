"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiEdit2, FiLogOut, FiCamera, FiSave } from "react-icons/fi";

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
            Authorization: `Bearer ${token}`
          }
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

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          bio,
          image
        })
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="  min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-10">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FiUser className="mr-3 text-blue-400" />
            Profile Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-gray-700"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-700">
                  <img
                    src={image || "https://i.pravatar.cc/150?u=" + user.email}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://i.pravatar.cc/150?u=" + user.email;
                    }}
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition shadow-lg opacity-0 group-hover:opacity-100">
                  <FiCamera className="text-white w-4 h-4" />
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-1">
                {name || "Add your name"}
              </h2>
              <div className="flex items-center justify-center text-gray-400">
                <FiMail className="mr-2" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Bio Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Brief description for your profile. URLs are hyperlinked.
                </p>
              </div>

              {/* Profile Image URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a direct link to your profile image
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={updateProfile}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
                
                <button
                  onClick={logout}
                  className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 py-3 px-4 rounded-lg font-medium hover:bg-red-500/20 hover:border-red-500/50 transition flex items-center justify-center"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <FiEdit2 className="mr-2 text-blue-400" />
            Account Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Member since</span>
              <span className="text-gray-300">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last updated</span>
              <span className="text-gray-300">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Account status</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}