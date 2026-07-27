"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import {
  getNotificationsAction,
  markNotificationsReadAction,
  toggleNotificationPreferenceAction,
  getUserNotificationPreferencesAction
} from "@/app/blog/blog-actions";
import ThemeToggle from "@/components/ThemeToggle";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState({
    notify_new_posts: true,
    notify_likes: true,
    notify_comments: true,
  });

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications and preferences if logged in
  useEffect(() => {
    if (!session?.user) return;

    const loadData = async () => {
      const notifs = await getNotificationsAction();
      setNotifications(notifs);

      const prefs = await getUserNotificationPreferencesAction();
      if (prefs) {
        setPreferences({
          notify_new_posts: prefs.notify_new_posts,
          notify_likes: prefs.notify_likes,
          notify_comments: prefs.notify_comments,
        });
      }
    };

    loadData();
    // Poll notifications every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
        setSettingsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markNotificationsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleTogglePref = async (type: "new_posts" | "likes" | "comments") => {
    const key = 
      type === "new_posts" ? "notify_new_posts" :
      type === "likes" ? "notify_likes" :
      "notify_comments";
      
    const newValue = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    try {
      await toggleNotificationPreferenceAction(type, newValue);
    } catch (error) {
      console.error("Failed to update notification settings", error);
      // Revert UI state on error
      setPreferences((prev) => ({ ...prev, [key]: !newValue }));
    }
  };

  // Helper to build links that work from blog sub-directories
  const getNavLink = (hash: string) => {
    if (pathname === "/" || pathname === "") {
      return hash;
    }
    return `/${hash}`;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-rd-deep/70 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Ramseys Digital logo"
            width={72}
            height={72}
            className="h-9 w-9 rounded-md object-cover"
            priority
          />
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Ramseys <span className="text-rd-red">Digital</span>
          </span>
        </Link>

        {/* Main Nav (Desktop) */}
        <nav className="hidden items-center gap-9 text-sm font-medium text-white/80 md:flex">
          {/* Accueil : regroupe les sections de la page d'accueil */}
          <div className="relative group">
            <Link
              href="/"
              className="nav-link inline-flex items-center gap-1 hover:text-white"
            >
              Accueil
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-white/50 transition-transform group-hover:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>
            <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-4 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="w-56 rounded-xl border border-rd-line bg-rd-graphite p-2 shadow-2xl shadow-black/60">
                <Link
                  href={getNavLink("#services")}
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06] hover:text-white"
                >
                  Services
                </Link>
                <Link
                  href={getNavLink("#pourquoi")}
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06] hover:text-white"
                >
                  Pourquoi nous
                </Link>
                <Link
                  href={getNavLink("#stats")}
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06] hover:text-white"
                >
                  Résultats
                </Link>
                <Link
                  href={getNavLink("#temoignages")}
                  className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06] hover:text-white"
                >
                  Témoignages
                </Link>
              </div>
            </div>
          </div>
          <Link href={getNavLink("#videos")} className="nav-link hover:text-white">
            Vidéos
          </Link>
          <Link href={getNavLink("#contact")} className="nav-link hover:text-white">
            Contact
          </Link>
          <Link
            href="/blog"
            className={`nav-link hover:text-white ${
              pathname.startsWith("/blog") ? "text-rd-red font-semibold" : ""
            }`}
          >
            Blog
          </Link>
        </nav>

        {/* Action / User Bar */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session?.user ? (
            <>
              {/* Notification Center */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setNotificationsOpen((prev) => !prev);
                    setSettingsOpen(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-rd-line bg-rd-graphite/40 transition hover:border-rd-red/50 hover:bg-rd-graphite/80"
                  aria-label="Notifications"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="text-white/85"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rd-red text-[10px] font-bold text-white ring-2 ring-rd-deep">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen ? (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-rd-line bg-rd-graphite p-4 shadow-2xl shadow-black/80 md:w-96">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Notifications</span>
                        {unreadCount > 0 ? (
                          <span className="rounded-full bg-rd-red/20 px-2 py-0.5 text-xs text-rd-redlight font-mono font-bold">
                            {unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSettingsOpen((prev) => !prev)}
                          className="p-1 text-white/50 hover:text-white"
                          title="Paramètres"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        </button>
                        {unreadCount > 0 ? (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-rd-redlight hover:underline"
                          >
                            Tout lire
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Settings Submenu */}
                    {settingsOpen ? (
                      <div className="border-b border-white/5 py-3 space-y-2.5">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                          Préférences notifications
                        </p>
                        <div className="space-y-2 text-xs">
                          <label className="flex items-center justify-between cursor-pointer text-white/80 hover:text-white">
                            <span>Nouveaux articles</span>
                            <input
                              type="checkbox"
                              checked={preferences.notify_new_posts}
                              onChange={() => handleTogglePref("new_posts")}
                              className="h-3.5 w-3.5 accent-rd-red"
                            />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer text-white/80 hover:text-white">
                            <span>Likes sur mes articles</span>
                            <input
                              type="checkbox"
                              checked={preferences.notify_likes}
                              onChange={() => handleTogglePref("likes")}
                              className="h-3.5 w-3.5 accent-rd-red"
                            />
                          </label>
                          <label className="flex items-center justify-between cursor-pointer text-white/80 hover:text-white">
                            <span>Commentaires sur mes articles</span>
                            <input
                              type="checkbox"
                              checked={preferences.notify_comments}
                              onChange={() => handleTogglePref("comments")}
                              className="h-3.5 w-3.5 accent-rd-red"
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}

                    {/* Notifications List */}
                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="py-8 text-center text-xs text-white/40">
                          Aucune notification pour le moment.
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              if (notif.link) {
                                router.push(notif.link);
                              }
                            }}
                            className={`cursor-pointer rounded-xl p-3 text-left transition ${
                              notif.read
                                ? "bg-white/[0.02] text-white/60 hover:bg-white/[0.05]"
                                : "bg-white/[0.08] text-white hover:bg-white/[0.12]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold">
                                {notif.title}
                              </span>
                              {!notif.read ? (
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rd-red" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="mt-1.5 block text-[9px] font-mono text-white/30">
                              {new Date(notif.created_at).toLocaleDateString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-rd-line bg-rd-graphite/80 px-3 py-1.5 text-sm font-semibold transition hover:border-rd-red/50"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rd-red/20 text-xs font-bold text-rd-redlight">
                    {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="hidden max-w-[90px] truncate md:inline">
                    {session.user.name}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/60"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {userDropdownOpen ? (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl border border-rd-line bg-rd-graphite p-2 shadow-2xl shadow-black/80">
                    <div className="border-b border-white/5 px-3 py-2 text-xs">
                      <p className="text-white/40">Connecté en tant que</p>
                      <p className="mt-0.5 truncate font-semibold">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.05] hover:text-white"
                    >
                      Mon profil
                    </Link>
                    {session.user.role === "ADMIN" || session.user.role === "EDITOR" ? (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.05] hover:text-white"
                      >
                        {session.user.role === "ADMIN" ? "Tableau de bord" : "Espace rédacteur"}
                      </Link>
                    ) : null}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-rd-redlight hover:bg-white/[0.05]"
                    >
                      Se déconnecter
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2 text-xs font-semibold transition hover:border-rd-red/50 hover:bg-rd-graphite"
            >
              Se connecter
            </Link>
          )}

          {/* Burger Menu Button (Mobile) */}
          <button
            id="burger"
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <span className="h-[2px] w-6 bg-white" />
            <span className="h-[2px] w-6 bg-white" />
            <span className="h-[2px] w-4 self-end bg-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen ? (
        <div
          id="mobileMenu"
          className="flex flex-col gap-1 border-t border-white/5 bg-rd-deep px-6 pb-6 md:hidden"
        >
          <Link
            href="/"
            className="py-3 text-sm font-semibold uppercase tracking-wide text-white/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link
            href={getNavLink("#services")}
            className="border-b border-white/5 py-3 pl-4 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href={getNavLink("#pourquoi")}
            className="border-b border-white/5 py-3 pl-4 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pourquoi nous
          </Link>
          <Link
            href={getNavLink("#stats")}
            className="border-b border-white/5 py-3 pl-4 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Résultats
          </Link>
          <Link
            href={getNavLink("#temoignages")}
            className="border-b border-white/5 py-3 pl-4 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Témoignages
          </Link>
          <Link
            href={getNavLink("#videos")}
            className="border-b border-white/5 py-3 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Vidéos
          </Link>
          <Link
            href={getNavLink("#contact")}
            className="border-b border-white/5 py-3 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/blog"
            className="py-3 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
        </div>
      ) : null}
    </header>
  );
}