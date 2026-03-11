"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name,email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } else {
      setError(data.error || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
      <form 
        onSubmit={handleSignup} 
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
        <input
  type="text"
  placeholder="Full Name"
  className="block w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>
        <input 
          type="email" placeholder="Email"
          className="block w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={email} onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" placeholder="Password"
          className="block w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={password} onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input 
          type="password" placeholder="Confirm Password"
          className="block w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <button className="w-full bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition">
          Sign Up
        </button>

        <p className="text-center mt-4 text-gray-500">
          Already have an account? 
          <span 
            className="text-purple-500 cursor-pointer ml-1 hover:underline"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}