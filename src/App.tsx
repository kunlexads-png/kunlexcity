import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AIAssistantDrawer } from './components/common/AIAssistantDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { ComparePage } from './pages/ComparePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
          {/* Top Demo Role Switcher bar */}
          <RoleSwitcher />

          {/* Main Luxury Navigation */}
          <Navbar onOpenAI={() => setAiDrawerOpen(true)} />

          {/* Main Routing Views */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage onOpenAI={() => setAiDrawerOpen(true)} />} />
              <Route path="/properties" element={<PropertiesPage onOpenAI={() => setAiDrawerOpen(true)} />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />

          {/* PrimeNest AI Assistant Slide-over Drawer */}
          <AIAssistantDrawer
            isOpen={aiDrawerOpen}
            onClose={() => setAiDrawerOpen(false)}
          />

          {/* Floating AI launcher badge */}
          {!aiDrawerOpen && (
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-full bg-slate-950 text-amber-400 border border-amber-400/50 shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
              title="Open PrimeNest AI Assistant"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold font-serif-luxury tracking-wide">PrimeNest AI</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                Gemini
              </span>
            </button>
          )}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
