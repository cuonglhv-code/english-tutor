"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Users, BookOpen, MessageSquare,
    Download, ClipboardList, LogOut, Menu, X, ChevronRight,
    GraduationCap,
} from "lucide-react";

const NAV = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Questions", href: "/admin/questions", icon: BookOpen },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    { label: "Export", href: "/admin/export", icon: Download },
    { label: "Audit Log", href: "/admin/audit", icon: ClipboardList },
];

export default function AdminShell({
    children,
    adminName,
}: {
    children: React.ReactNode;
    adminName: string;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        const { createBrowserClient } = await import("@/lib/supabase");
        const sb = createBrowserClient();
        await sb.auth.signOut();
        router.push("/login");
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-jaxtina-red to-jaxtina-blue rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="font-black text-white text-sm leading-none">JAXTINA</p>
                        <p className="text-[10px] text-white/50 font-semibold tracking-widest uppercase">Admin</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${active
                                    ? "bg-jaxtina-blue text-white shadow-lg shadow-jaxtina-blue/30"
                                    : "text-white/60 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                            {active && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Admin info + logout */}
            <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-jaxtina-blue/30 flex items-center justify-center text-white text-xs font-black">
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{adminName}</p>
                        <p className="text-[10px] text-white/40">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-semibold transition-all"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-neutral-950 text-white">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-60 shrink-0 flex-col bg-neutral-900 border-r border-white/[0.06] fixed h-screen z-30">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-neutral-900 z-50 flex flex-col md:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>
                <SidebarContent />
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col md:ml-60 min-h-screen">
                {/* Mobile topbar */}
                <header className="md:hidden h-14 border-b border-white/[0.06] bg-neutral-900 flex items-center px-4 gap-4 sticky top-0 z-20">
                    <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white">
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="font-bold text-white text-sm">Admin Dashboard</span>
                </header>

                <main className="flex-1 p-5 md:p-8 max-w-screen-2xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
