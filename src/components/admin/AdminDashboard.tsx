import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  loginAdminWithGoogle,
  loginAdminWithEmailPassword,
  completeOneTimeAdminSetup,
  signOutAdmin,
  formatFirebaseAuthError,
  FormattedAuthError,
  FIREBASE_PROJECT_ID,
} from '../../firebase';
import { ProjectsManager } from './ProjectsManager';
import { SectionsEditor } from './SectionsEditor';
import { SettingsEditor } from './SettingsEditor';
import { PublicPortfolio } from '../PublicPortfolio';
import {
  LayoutDashboard,
  Home,
  UserCheck,
  Briefcase,
  FolderKanban,
  FolderPlus,
  Sparkles,
  GitCommitHorizontal,
  PhoneCall,
  Share2,
  Palette,
  SearchCheck,
  Compass,
  PanelBottom,
  Shield,
  LogOut,
  ExternalLink,
  Eye,
  Save,
  Send,
  RotateCcw,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Menu,
  X,
  Lock,
  KeyRound,
  Mail,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

type AdminTabId =
  | 'dashboard'
  | 'hero'
  | 'about'
  | 'services'
  | 'projects'
  | 'add-project'
  | 'skills'
  | 'process'
  | 'contact'
  | 'socials'
  | 'appearance'
  | 'seo'
  | 'navigation'
  | 'footer'
  | 'admin-settings';

interface SidebarItem {
  id: AdminTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: '1. Dashboard Overview', icon: LayoutDashboard },
  { id: 'hero', label: '2. Homepage Editor', icon: Home },
  { id: 'about', label: '3. About Section', icon: UserCheck },
  { id: 'services', label: '4. Services', icon: Briefcase },
  { id: 'projects', label: '5. Projects / Portfolio', icon: FolderKanban },
  { id: 'add-project', label: '+ Add New Project', icon: FolderPlus },
  { id: 'skills', label: '6. Skills', icon: Sparkles },
  { id: 'process', label: '7. Process', icon: GitCommitHorizontal },
  { id: 'contact', label: '8. Contact Information', icon: PhoneCall },
  { id: 'socials', label: '9. Social Media Links', icon: Share2 },
  { id: 'appearance', label: '10. Website Appearance', icon: Palette },
  { id: 'seo', label: '11. SEO Settings', icon: SearchCheck },
  { id: 'navigation', label: '12. Navigation Settings', icon: Compass },
  { id: 'footer', label: '13. Footer Settings', icon: PanelBottom },
  { id: 'admin-settings', label: '14. Admin Settings', icon: Shield },
];

interface AdminDashboardProps {
  onNavigatePublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigatePublic,
}) => {
  const {
    user,
    isAdmin,
    authReady,
    isSetupInitialized,
    refreshAdminAuth,
    projects,
    activityLogs,
    hasUnpublishedChanges,
    saveDraft,
    publishWebsite,
    discardDraft,
    isSaving,
    toasts,
    dismissToast,
    showToast,
    setIsPreviewingDraft,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');
  const [triggerAddProjectModal, setTriggerAddProjectModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [livePreviewModalOpen, setLivePreviewModalOpen] = useState(false);

  // Clean, empty Admin Login / One-Time Setup State (never pre-filled)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [authError, setAuthError] = useState<FormattedAuthError | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!isSetupInitialized && setupMode) {
      if (passwordInput !== confirmPasswordInput) {
        setAuthError({
          title: 'Passwords Do Not Match',
          message: 'Please ensure both password fields match before completing setup.',
        });
        return;
      }
    }

    setSigningIn(true);
    try {
      if (!isSetupInitialized && setupMode) {
        await completeOneTimeAdminSetup(emailInput, passwordInput);
        showToast(
          'One-time admin account created and permanently locked!',
          'success'
        );
      } else {
        await loginAdminWithEmailPassword(emailInput, passwordInput);
        showToast('Authenticated successfully.', 'success');
      }
      setEmailInput('');
      setPasswordInput('');
      setConfirmPasswordInput('');
      await refreshAdminAuth();
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await loginAdminWithGoogle();
      setEmailInput('');
      setPasswordInput('');
      setConfirmPasswordInput('');
      await refreshAdminAuth();
      showToast('Authenticated with Google.', 'success');
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    setEmailInput('');
    setPasswordInput('');
    setConfirmPasswordInput('');
    await signOutAdmin();
    await refreshAdminAuth();
    showToast('Logged out securely.', 'info');
  };

  const handleSelectSidebarItem = (id: AdminTabId) => {
    if (id === 'add-project') {
      setActiveTab('projects');
      setTriggerAddProjectModal(true);
    } else {
      setActiveTab(id);
    }
    setMobileSidebarOpen(false);
  };

  // Loading state while Firebase Auth & Setup Lock initialize
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-sm font-medium text-stone-400">
            Verifying Firebase Security State...
          </p>
        </div>
      </div>
    );
  }

  // Dedicated Secure Admin Login Screen at /admin
  if (!user || !isAdmin) {
    const isOneTimeSetupActive = !isSetupInitialized && setupMode;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 px-4 py-10 text-stone-100">
        <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/95 p-7 shadow-2xl sm:p-9">
          <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-600/15 text-orange-500">
            <Lock className="h-6 w-6" />
          </div>

          <div className="text-center">
            <span className="inline-block rounded-full bg-stone-800 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-stone-300">
              {isOneTimeSetupActive
                ? 'One-Time Owner Setup'
                : 'Restricted Access'}
            </span>
            <h1 className="mt-2 font-serif text-2xl font-semibold text-white">
              {isOneTimeSetupActive
                ? 'One-Time Admin Account Setup'
                : 'Admin Login'}
            </h1>
            <p className="mt-1.5 text-xs text-stone-400">
              {isOneTimeSetupActive
                ? 'Create your single administrator account. Once completed, admin registration is permanently locked.'
                : 'Sign in with your authorized administrator credentials to access the dashboard.'}
            </p>
          </div>

          {/* Detailed Firebase Auth Error & Console Instructions */}
          {authError && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200 space-y-2">
              <div className="flex items-start gap-2 font-bold text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError.title}</span>
              </div>
              <p className="text-red-200/90 leading-relaxed">
                {authError.message}
              </p>

              {authError.consoleHelp === 'email-provider-disabled' && (
                <div className="mt-2 rounded-xl border border-stone-700 bg-stone-950/90 p-3 text-[11px] text-stone-300 space-y-1.5">
                  <div className="font-bold text-orange-400">
                    How to Enable Email/Password in Firebase Console (1 Minute):
                  </div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      Open{' '}
                      <a
                        href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-orange-400 hover:text-orange-300"
                      >
                        Firebase Console → Authentication → Sign-in method
                      </a>
                    </li>
                    <li>
                      Click <b>Email/Password</b>, toggle <b>Enable</b> ON, and click <b>Save</b>.
                    </li>
                    <li>
                      Return here and submit your email and password again — or use <b>Sign in with Google</b> below.
                    </li>
                  </ol>
                </div>
              )}

              {authError.consoleHelp === 'unauthorized-domain' && (
                <div className="mt-2 rounded-xl border border-stone-700 bg-stone-950/90 p-3 text-[11px] text-stone-300 space-y-1.5">
                  <div className="font-bold text-orange-400">
                    How to Authorize This Domain in Firebase:
                  </div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      Open{' '}
                      <a
                        href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-orange-400 hover:text-orange-300"
                      >
                        Firebase Console → Authentication → Settings → Authorized domains
                      </a>
                    </li>
                    <li>
                      Click <b>Add domain</b> and enter:{' '}
                      <code className="rounded bg-stone-800 px-1.5 py-0.5 text-white">
                        {window.location.hostname}
                      </code>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Clean Login Form with Autocomplete Disabled & Empty Fields */}
          <form
            onSubmit={handleFormSubmit}
            autoComplete="off"
            className="mt-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-300">
                Admin Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  name="admin_auth_identifier"
                  required
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  name="admin_auth_secret"
                  required
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {isOneTimeSetupActive && (
              <div>
                <label className="block text-xs font-semibold text-stone-300">
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="password"
                    name="admin_auth_secret_confirm"
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Confirm password (min 8 characters)"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-500 transition disabled:opacity-50 cursor-pointer"
            >
              {signingIn
                ? 'Authenticating with Firebase...'
                : isOneTimeSetupActive
                ? 'Complete One-Time Admin Setup & Lock →'
                : 'Sign In to Admin Dashboard →'}
            </button>
          </form>

          {/* One-Time Setup Toggle: ONLY rendered if `/system_lock/admin_setup` does NOT exist yet */}
          {!isSetupInitialized && (
            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-center">
              <p className="text-[11px] text-amber-200/90">
                First-time setup is available because no admin account has been locked yet.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSetupMode(!setupMode);
                  setAuthError(null);
                }}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {setupMode
                  ? 'Already created your account? Switch to Admin Login'
                  : 'Complete One-Time Admin Account Setup'}
              </button>
            </div>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-800" />
            <span className="text-[11px] uppercase tracking-wider text-stone-500">
              or authorized Google account
            </span>
            <div className="h-px flex-1 bg-stone-800" />
          </div>

          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleAuth}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-700 bg-stone-800/90 px-5 py-2.5 text-xs font-semibold text-stone-100 hover:bg-stone-800 transition disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.25 5 12c0-3.25 3.36-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            Continue with Authorized Google Account
          </button>

          <button
            type="button"
            onClick={onNavigatePublic}
            className="mt-5 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-stone-400 hover:text-white cursor-pointer"
          >
            ← Return to Portfolio Website
          </button>
        </div>
      </div>
    );
  }

  // Stats for Dashboard Overview
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(
    (p) => p.status === 'published'
  ).length;
  const draftProjects = projects.filter((p) => p.status === 'draft').length;
  const totalSections = 8;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-semibold text-white shadow-xl cursor-pointer transition ${
              t.type === 'error'
                ? 'bg-red-600'
                : t.type === 'info'
                ? 'bg-stone-800'
                : 'bg-emerald-600'
            }`}
          >
            <span>{t.text}</span>
            <X className="h-3.5 w-3.5 shrink-0 opacity-75" />
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r border-stone-800 bg-stone-950 text-stone-300 transition-transform lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-stone-800 px-5">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="font-serif text-lg font-semibold text-white">
              Subhasish Admin
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            const isAddProjectBtn = item.id === 'add-project';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSidebarItem(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-orange-600 text-white shadow-sm'
                    : isAddProjectBtn
                    ? 'border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20'
                    : 'text-stone-400 hover:bg-stone-900 hover:text-stone-100'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout & Public Link Footer */}
        <div className="border-t border-stone-800 p-3 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setIsPreviewingDraft(false);
              onNavigatePublic();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-900 cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 text-orange-400" />
            View Public Website
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            15. Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Top Workflow Bar */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-xl border border-stone-200 p-2 text-stone-700 hover:bg-stone-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  hasUnpublishedChanges
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs font-semibold text-stone-700">
                {hasUnpublishedChanges
                  ? 'Unpublished Draft Changes'
                  : 'All Changes Published Live'}
              </span>
            </div>
          </div>

          {/* Save, Preview, Discard & Publish Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {hasUnpublishedChanges && (
              <button
                type="button"
                disabled={isSaving}
                onClick={discardDraft}
                title="Discard unpublished draft edits"
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Discard
              </button>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={() => saveDraft('Current Draft')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => setLivePreviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => publishWebsite('Admin Top Bar Publish')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-500 disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {isSaving ? 'Publishing...' : 'Publish to Website'}
            </button>
          </div>
        </header>

        {/* Active Tab Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="flex flex-col gap-4 rounded-3xl bg-stone-900 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <span className="inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400">
                    Admin Control Center
                  </span>
                  <h1 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
                    Welcome back, Subhasish
                  </h1>
                  <p className="mt-1 text-sm text-stone-400">
                    Manage your portfolio projects, customize website sections, and publish updates to Cloud Firestore in real time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('projects');
                      setTriggerAddProjectModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewingDraft(true);
                      onNavigatePublic();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Draft on Site
                  </button>
                </div>
              </div>

              {/* 4 Overview Metric Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Total Projects
                    </span>
                    <FolderKanban className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="mt-3 text-3xl font-bold text-stone-900">
                    {totalProjects}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    In your portfolio database
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Published Projects
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="mt-3 text-3xl font-bold text-emerald-600">
                    {publishedProjects}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Visible on public website
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Draft Projects
                    </span>
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="mt-3 text-3xl font-bold text-amber-600">
                    {draftProjects}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Hidden until published
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Website Sections
                    </span>
                    <Layers className="h-5 w-5 text-stone-700" />
                  </div>
                  <div className="mt-3 text-3xl font-bold text-stone-900">
                    {totalSections}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Dynamic editable sections
                  </p>
                </div>
              </div>

              {/* Quick Actions & Recent Updates Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 lg:col-span-2">
                  <h2 className="text-base font-bold text-stone-900">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('projects');
                        setTriggerAddProjectModal(true);
                      }}
                      className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/40 p-4 text-left hover:border-orange-500 hover:bg-orange-50 transition cursor-pointer"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600 text-white">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          Add New Project
                        </div>
                        <div className="text-xs text-stone-500">
                          Upload project screenshots &amp; live URL
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 text-left hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          Manage All Projects ({totalProjects})
                        </div>
                        <div className="text-xs text-stone-500">
                          Edit, delete, reorder &amp; manage gallery
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('hero')}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 text-left hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-700">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          Homepage Hero Editor
                        </div>
                        <div className="text-xs text-stone-500">
                          Update headline, portrait &amp; buttons
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('about')}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 text-left hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-700">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          About &amp; Services Editor
                        </div>
                        <div className="text-xs text-stone-500">
                          Edit bio, highlights &amp; service cards
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('appearance')}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 text-left hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-700">
                        <Palette className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          Website Appearance
                        </div>
                        <div className="text-xs text-stone-500">
                          Colors, fonts, dark mode &amp; spacing
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('seo')}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 p-4 text-left hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-700">
                        <SearchCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">
                          SEO &amp; Social Settings
                        </div>
                        <div className="text-xs text-stone-500">
                          Search titles, descriptions &amp; social links
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Updates Feed */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-stone-900">
                    Recent Updates
                  </h2>
                  {activityLogs.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {activityLogs.slice(0, 10).map((log) => (
                        <div
                          key={log.id}
                          className="rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs"
                        >
                          <div className="font-semibold text-stone-800">
                            {log.action}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-stone-400">
                            <span>{log.section}</span>
                            <span>
                              {new Date(log.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-stone-50 p-6 text-center text-xs text-stone-400">
                      Recent changes you save or publish will appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <ProjectsManager
              autoOpenAddModal={triggerAddProjectModal}
              onAutoOpenHandled={() => setTriggerAddProjectModal(false)}
            />
          )}

          {(activeTab === 'hero' ||
            activeTab === 'about' ||
            activeTab === 'services' ||
            activeTab === 'skills' ||
            activeTab === 'process' ||
            activeTab === 'contact') && (
            <SectionsEditor activeSection={activeTab} />
          )}

          {(activeTab === 'socials' ||
            activeTab === 'appearance' ||
            activeTab === 'seo' ||
            activeTab === 'navigation' ||
            activeTab === 'footer' ||
            activeTab === 'admin-settings') && (
            <SettingsEditor activeTab={activeTab} />
          )}
        </main>
      </div>

      {/* Full-Screen Interactive Live Preview Modal */}
      {livePreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-stone-950">
          <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-6 py-3 text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold">
                Interactive Draft Preview — Test your changes before publishing
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  await publishWebsite('Published from Live Preview');
                  setLivePreviewModalOpen(false);
                }}
                className="rounded-lg bg-orange-600 px-3.5 py-1.5 font-semibold text-white hover:bg-orange-500 cursor-pointer"
              >
                Publish Now
              </button>
              <button
                type="button"
                onClick={() => setLivePreviewModalOpen(false)}
                className="rounded-lg bg-stone-800 px-3.5 py-1.5 font-semibold text-stone-200 hover:bg-stone-700 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PublicPortfolio
              onNavigateAdmin={() => setLivePreviewModalOpen(false)}
              forceDraftPreview={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
