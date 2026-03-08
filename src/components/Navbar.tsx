"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LANGUAGES = [
    { code: "en", label: "EN", full: "English" },
    { code: "hi", label: "HI", full: "हिंदी (Hindi)" },
    { code: "te", label: "TE", full: "తెలుగు (Telugu)" },
    { code: "ta", label: "TA", full: "தமிழ் (Tamil)" },
    { code: "mr", label: "MR", full: "मराठी (Marathi)" },
    { code: "pa", label: "PA", full: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "bn", label: "BN", full: "বাংলা (Bengali)" },
    { code: "kn", label: "KN", full: "ಕನ್ನಡ (Kannada)" },
    { code: "gu", label: "GU", full: "ગુજરાતી (Gujarati)" },
    { code: "ml", label: "ML", full: "മലയാളം (Malayalam)" },
    { code: "or", label: "OR", full: "ଓଡ଼ିଆ (Odia)" },
    { code: "as", label: "AS", full: "অসমীয়া (Assamese)" },
    { code: "ur", label: "UR", full: "اردو (Urdu)" },
    { code: "sa", label: "SA", full: "संस्कृतम् (Sanskrit)" },
    { code: "ks", label: "KS", full: "कॉशुर (Kashmiri)" },
    { code: "ne", label: "NE", full: "नेपाली (Nepali)" },
    { code: "sd", label: "SD", full: "سنڌي (Sindhi)" },
    { code: "mai", label: "MAI", full: "मैथिली (Maithili)" },
    { code: "doi", label: "DOI", full: "डोगरी (Dogri)" },
    { code: "mni", label: "MNI", full: "ꯃꯤꯇꯩꯂꯣꯟ (Manipuri)" },
    { code: "kok", label: "KOK", full: "कोंकणी (Konkani)" },
    { code: "bho", label: "BHO", full: "भोजपुरी (Bhojpuri)" },
    { code: "brx", label: "BRX", full: "बड़ो (Bodo)" },
    { code: "sat", label: "SAT", full: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)" }
];

const NAV_LINKS = [
    { href: "/advisor", label: "AI Advisor" },
    { href: "/climate-map", label: "Climate Map" },
];

// Context for app-wide language — read by advisor page & ModulePanel
export const LANG_KEY = "agrisaathi_lang";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [lang, setLang] = useState("en");
    const [langOpen, setLangOpen] = useState(false);
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (mounted) {
            const saved = localStorage.getItem(LANG_KEY);
            if (saved) setLang(saved);
        }
    }, [mounted]);

    const selectLang = (code: string) => {
        setLang(code);
        localStorage.setItem(LANG_KEY, code);
        setLangOpen(false);
        // Full page Google translation via cookie
        const cookieStr = code === "en" ? "" : `/en/${code}`;
        const expires = code === "en" ? "expires=Thu, 01 Jan 1970 00:00:00 UTC;" : "";

        // Set multiple variations for maximum compatibility across Vercel subdomains
        document.cookie = `googtrans=${cookieStr}; ${expires} path=/`;
        document.cookie = `googtrans=${cookieStr}; ${expires} path=/; domain=${window.location.hostname}`;
        // Also handle the case of .vercel.app
        if (window.location.hostname.includes("vercel.app")) {
            const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
            document.cookie = `googtrans=${cookieStr}; ${expires} path=/; domain=.${rootDomain}`;
        }

        window.dispatchEvent(new CustomEvent("agrisaathi_lang_change", { detail: code }));
        setTimeout(() => window.location.reload(), 100);
    };

    const currentLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];
    const isAdvisor = pathname === "/advisor";

    if (!mounted) return (
        <nav className="nav-bar" style={{ height: "90px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "transparent" }}>
            <div className="section-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "1440px" }}>
                <div className="nav-logo" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <img src="/logo.png" alt="Logo" style={{ height: "50px", width: "50px", borderRadius: "100%" }} />
                </div>
            </div>
        </nav>
    );

    return (
        <nav
            className={`nav-bar ${scrolled ? "liquid-glass" : ""}`}
            style={{
                height: "90px",
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                background: scrolled ? "rgba(5, 8, 10, 0.95)" : "transparent",
                borderBottom: scrolled ? "1px solid rgba(0, 255, 127, 0.15)" : "none",
                display: "flex", alignItems: "center",
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000
            }}
        >
            <div
                className="section-container"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "1440px" }}
            >
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <Link href="/" className="nav-logo" style={{ display: "flex", alignItems: "center", gap: "1rem", textDecoration: "none" }}>
                        <img src="/logo.png" alt="AgriSaathi Logo" style={{ height: "50px", width: "50px", borderRadius: "10px" }} />
                        <div style={{ fontSize: "1.8rem", fontWeight: "900", letterSpacing: "4px", fontFamily: "var(--font-display)" }}>
                            <span style={{ color: "var(--vibrant-yellow)" }}>AGRI</span>
                            <span style={{ color: "var(--vibrant-green)" }}>SAATHI</span>
                        </div>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="desktop-only desktop-nav">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.href} href={link.href} className="nav-link" style={{
                                fontFamily: "var(--font-display)", fontSize: "1.1rem",
                                textTransform: "uppercase", fontWeight: "400",
                                letterSpacing: "1px", color: "var(--vibrant-yellow)"
                            }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right side — Language + Dashboard + Logout */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="desktop-only auth-group" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>

                        {/* ── Language Dropdown ── */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setLangOpen(p => !p)}
                                style={{
                                    background: "rgba(173,255,47,0.08)", border: "1px solid rgba(173,255,47,0.25)",
                                    color: "#ADFF2F", borderRadius: "8px", padding: "0.45rem 0.85rem",
                                    fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: "0.4rem",
                                    letterSpacing: "0.05em", transition: "all 0.2s"
                                }}
                            >
                                🌐 {currentLang.label} <span style={{ opacity: 0.6, fontSize: "0.7rem" }}>▼</span>
                            </button>

                            {langOpen && (
                                <div style={{
                                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                                    background: "#0a0f0a", border: "1px solid rgba(173,255,47,0.2)",
                                    borderRadius: "10px", padding: "0.4rem", zIndex: 2000,
                                    minWidth: "160px", boxShadow: "0 20px 60px rgba(0,0,0,0.7)"
                                }}>
                                    {LANGUAGES.map(l => (
                                        <button key={l.code} onClick={() => selectLang(l.code)} style={{
                                            width: "100%", background: lang === l.code ? "rgba(173,255,47,0.1)" : "transparent",
                                            border: "none", color: lang === l.code ? "#ADFF2F" : "rgba(173,255,47,0.6)",
                                            padding: "0.5rem 0.8rem", borderRadius: "7px", cursor: "pointer",
                                            fontSize: "0.82rem", textAlign: "left", display: "flex",
                                            justifyContent: "space-between", transition: "all 0.15s"
                                        }}>
                                            <span>{l.full}</span>
                                            <span style={{ opacity: 0.5 }}>{l.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {user && (
                            <>
                                {/* Dashboard button — only show when NOT on advisor page */}
                                {!isAdvisor && (
                                    <Link href="/advisor" style={{
                                        background: "rgba(173,255,47,0.12)", border: "1px solid rgba(173,255,47,0.3)",
                                        color: "#ADFF2F", borderRadius: "8px", padding: "0.5rem 1.2rem",
                                        fontSize: "0.85rem", fontWeight: 700, textDecoration: "none",
                                        letterSpacing: "0.04em", transition: "all 0.2s"
                                    }}>
                                        ⚡ Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={logout}
                                    className="btn-yellow-outline"
                                    style={{ fontSize: "0.9rem", padding: "0.6rem 1.8rem", cursor: "pointer" }}
                                >
                                    Logout
                                </button>
                            </>
                        )}

                        {!user && (
                            <>
                                <Link href="/login" className="btn-green-fill" style={{ fontSize: "0.9rem", padding: "0.6rem 1.8rem" }}>Sign In</Link>
                                <Link href="/signup" className="btn-yellow-outline" style={{ fontSize: "0.9rem", padding: "0.6rem 1.8rem" }}>Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button
                        className="mobile-only menu-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ background: "none", border: "none", color: "var(--vibrant-green)", fontSize: "2rem", cursor: "pointer", zIndex: 1100 }}
                    >
                        {isMenuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className={`mobile-drawer ${isMenuOpen ? "open" : ""}`}>
                <div className="drawer-links">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="drawer-link">
                            {link.label}
                        </Link>
                    ))}
                    <hr style={{ border: "1px solid rgba(0,255,127,0.1)", width: "100%", margin: "1rem 0" }} />

                    {/* Mobile language picker */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {LANGUAGES.map(l => (
                            <button key={l.code} onClick={() => selectLang(l.code)} style={{
                                background: lang === l.code ? "rgba(173,255,47,0.2)" : "transparent",
                                border: "1px solid rgba(173,255,47,0.2)", color: "#ADFF2F",
                                borderRadius: "6px", padding: "0.35rem 0.75rem", fontSize: "0.8rem", cursor: "pointer"
                            }}>{l.full}</button>
                        ))}
                    </div>

                    <hr style={{ border: "1px solid rgba(0,255,127,0.1)", width: "100%", margin: "1rem 0" }} />
                    {user ? (
                        <>
                            {!isAdvisor && <Link href="/advisor" onClick={() => setIsMenuOpen(false)} style={{ color: "#ADFF2F", textDecoration: "none", fontWeight: 700 }}>⚡ Dashboard</Link>}
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn-yellow-outline" style={{ width: "100%", marginTop: "1rem" }}>Logout</button>
                        </>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-green-fill" style={{ textAlign: "center" }}>Sign In</Link>
                            <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="btn-yellow-outline" style={{ textAlign: "center" }}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .mobile-drawer {
          position: fixed; top: 0; right: 0;
          height: 100vh; width: 100%;
          background: #05080A; z-index: 1050;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; flex-direction: column;
          padding: 120px 2rem 2rem 2rem;
        }
        .mobile-drawer.open { transform: translateX(0); }
        .drawer-links { display: flex; flex-direction: column; gap: 1.5rem; }
        .drawer-link { font-family: var(--font-display); font-size: 2rem; color: var(--vibrant-green); text-decoration: none; text-transform: uppercase; }
        .desktop-nav { display: flex; align-items: center; gap: 2rem; }
        .auth-group { display: flex; gap: 0.75rem; }
        @media (max-width: 1024px) {
          .desktop-nav, .auth-group { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-only { display: block; }
        }
        @media (min-width: 1025px) { .mobile-only { display: none; } }
      `}</style>
        </nav>
    );
}
