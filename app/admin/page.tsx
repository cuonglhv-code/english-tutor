"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    BookOpen,
    Download,
    Plus,
    Trash2,
    Save,
    X,
    LogOut,
    ChevronRight,
    Search,
    Filter,
    FileText,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase";
import { TASK1_TYPES, TASK2_TYPES, SOURCES } from "@/lib/questionBank";

// Simple admin auth check
const ADMIN_USER = process.env.NEXT_PUBLIC_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || "jaxtina2024";

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
    const [loading, setLoading] = useState(false);

    // Data state
    const [users, setUsers] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [taskFilter, setTaskFilter] = useState("All");

    // UI state
    const [activeTab, setActiveTab] = useState("users");
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        title: "",
        skill: "writing",
        task_type: "task2",
        question_type: "Opinion Essay",
        source: "Jaxtina Bank",
        description: "",
        body_text: "",
        image_url: "",
        is_published: true
    });

    useEffect(() => {
        const savedAuth = sessionStorage.getItem("admin_auth");
        if (savedAuth === "true") {
            setIsLoggedIn(true);
            fetchData();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginForm.user === ADMIN_USER && loginForm.pass === ADMIN_PASS) {
            setIsLoggedIn(true);
            sessionStorage.setItem("admin_auth", "true");
            toast.success("Welcome back, Admin!");
            fetchData();
        } else {
            toast.error("Invalid credentials");
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        sessionStorage.removeItem("admin_auth");
        router.push("/");
    };

    const fetchData = async () => {
        setLoading(true);
        const supabase = createBrowserClient();

        try {
            // Fetch users (profiles)
            const { data: profiles, error: pError } = await supabase
                .from("profiles")
                .select(`
          *,
          user_progress (average_band, total_submissions)
        `)
                .order("created_at", { ascending: false });

            if (pError) throw pError;
            setUsers(profiles || []);

            // Fetch exercises (questions)
            const { data: exercises, error: eError } = await supabase
                .from("exercises")
                .select("*")
                .order("created_at", { ascending: false });

            if (eError) throw eError;
            setQuestions(exercises || []);

        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createBrowserClient();

        try {
            const { data, error } = await supabase
                .from("exercises")
                .insert([newQuestion])
                .select();

            if (error) throw error;

            toast.success("Question added successfully!");
            setQuestions([data[0], ...questions]);
            setShowAddQuestion(false);
            setNewQuestion({
                title: "",
                skill: "writing",
                task_type: "task2",
                question_type: "Opinion Essay",
                source: "Jaxtina Bank",
                description: "",
                body_text: "",
                image_url: "",
                is_published: true
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to add question");
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;

        setLoading(true);
        const supabase = createBrowserClient();

        try {
            const { error } = await supabase
                .from("exercises")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setQuestions(questions.filter(q => q.id !== id));
            toast.success("Question deleted");
        } catch (error: any) {
            toast.error("Failed to delete question");
        } finally {
            setLoading(false);
        }
    };

    const exportUsersCSV = () => {
        if (users.length === 0) return;

        const headers = ["ID", "Email", "Display Name", "Joined At", "Avg Band", "Total Essays"];
        const rows = users.map(u => [
            u.id,
            u.email,
            u.display_name || "",
            new Date(u.created_at).toLocaleDateString(),
            u.user_progress?.[0]?.average_band || "0",
            u.user_progress?.[0]?.total_submissions || "0"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ielts_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-jaxtina-red to-jaxtina-blue rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4">
                            A
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-neutral-500 text-sm mt-1">Jaxtina IELTS Examiner Management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Username</label>
                            <Input
                                value={loginForm.user}
                                onChange={e => setLoginForm({ ...loginForm, user: e.target.value })}
                                className="bg-neutral-800 border-neutral-700 text-white rounded-xl py-6"
                                placeholder="Enter admin username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Password</label>
                            <Input
                                type="password"
                                value={loginForm.pass}
                                onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })}
                                className="bg-neutral-800 border-neutral-700 text-white rounded-xl py-6"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-jaxtina-red to-jaxtina-blue hover:opacity-90 py-6 text-lg font-bold rounded-xl mt-4 shadow-lg shadow-jaxtina-red/20">
                            Sign In
                        </Button>

                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="w-full text-neutral-500 hover:text-neutral-300 text-sm py-2 transition-colors"
                        >
                            Public Website
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTask = taskFilter === "All" ||
            (taskFilter === "Task 1" && q.task_type === "task1") ||
            (taskFilter === "Task 2" && q.task_type === "task2");
        return matchesSearch && matchesTask;
    });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
            {/* Header */}
            <header className="h-20 border-b bg-white dark:bg-neutral-900 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-jaxtina-red rounded-xl flex items-center justify-center text-white font-black">
                        A
                    </div>
                    <div>
                        <h2 className="font-bold text-lg dark:text-white leading-none">Admin Dashboard</h2>
                        <p className="text-xs text-neutral-500 mt-1">Status: Operational</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="rounded-xl border-neutral-200 dark:border-neutral-800">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500 hover:text-red-500 rounded-xl">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 p-6">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2">
                    <Button
                        variant={activeTab === "users" ? "default" : "ghost"}
                        className={`w-full justify-start rounded-2xl h-12 ${activeTab === "users" ? "bg-jaxtina-red text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <Users className="h-5 w-5 mr-3" /> User Management
                    </Button>
                    <Button
                        variant={activeTab === "questions" ? "default" : "ghost"}
                        className={`w-full justify-start rounded-2xl h-12 ${activeTab === "questions" ? "bg-jaxtina-red text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                        onClick={() => setActiveTab("questions")}
                    >
                        <BookOpen className="h-5 w-5 mr-3" /> Question Bank
                    </Button>

                    <div className="pt-6">
                        <Card className="bg-gradient-to-br from-jaxtina-blue/10 to-transparent border-jaxtina-blue/10 rounded-3xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold">Quick Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-neutral-500">Users</span>
                                    <span className="text-2xl font-black text-jaxtina-blue">{users.length}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-neutral-500">Questions</span>
                                    <span className="text-2xl font-black text-jaxtina-red">{questions.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {activeTab === "users" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight">Active Users</h3>
                                    <p className="text-neutral-500">Manage and view student progress</p>
                                </div>
                                <Button onClick={exportUsersCSV} className="bg-jaxtina-blue hover:opacity-90 rounded-2xl font-bold h-11 px-6 shadow-lg shadow-jaxtina-blue/20">
                                    <Download className="h-4 w-4 mr-2" /> Export List (CSV)
                                </Button>
                            </div>

                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-10 rounded-2xl border-neutral-200 dark:border-neutral-800 h-11"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-4">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center py-20 bg-white dark:bg-neutral-900 border rounded-3xl text-neutral-500 italic">
                                        No users found matching your criteria
                                    </div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <Card key={user.id} className="rounded-3xl border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="p-1 grid md:grid-cols-[1fr,auto] items-center gap-4">
                                                <div className="p-5 flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400 text-xl font-black">
                                                        {user.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg dark:text-white leading-tight">
                                                            {user.display_name || "Guest User"}
                                                        </h4>
                                                        <p className="text-sm text-neutral-500">{user.email}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge variant="outline" className="text-[10px] rounded-lg bg-neutral-50 dark:bg-neutral-800 border-none">
                                                                Joined {new Date(user.created_at).toLocaleDateString()}
                                                            </Badge>
                                                            {user.user_progress?.[0] && (
                                                                <Badge className="text-[10px] rounded-lg bg-green-500/10 text-green-600 border-none hover:bg-green-500/20">
                                                                    {user.user_progress[0].total_submissions} Essays
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-5 md:px-10 flex md:flex-col items-center justify-center gap-2 border-l border-neutral-100 dark:border-neutral-800 h-full">
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Avg Band</span>
                                                    <span className="text-3xl font-black text-jaxtina-red leading-none">
                                                        {user.user_progress?.[0]?.average_band || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "questions" && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight">Question Bank</h3>
                                    <p className="text-neutral-500">Add and manage IELTS practice prompts</p>
                                </div>
                                <Button
                                    onClick={() => setShowAddQuestion(true)}
                                    className="bg-jaxtina-red hover:opacity-90 rounded-2xl font-bold h-11 px-6 shadow-lg shadow-jaxtina-red/20"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add New Question
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input
                                        placeholder="Search questions..."
                                        className="pl-10 rounded-2xl border-neutral-200 dark:border-neutral-800 h-10"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={taskFilter} onValueChange={setTaskFilter}>
                                    <SelectTrigger className="w-40 rounded-2xl h-10 border-neutral-200 dark:border-neutral-800">
                                        <SelectValue placeholder="Task Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Tasks</SelectItem>
                                        <SelectItem value="Task 1">Academic Task 1</SelectItem>
                                        <SelectItem value="Task 2">Task 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Add Question Dialog */}
                            {showAddQuestion && (
                                <Card className="rounded-3xl border-jaxtina-red/20 shadow-xl overflow-hidden bg-white dark:bg-neutral-900">
                                    <div className="p-6 border-b flex items-center justify-between">
                                        <h4 className="font-bold text-lg">Create New Question</h4>
                                        <Button variant="ghost" size="icon" onClick={() => setShowAddQuestion(false)}>
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <CardContent className="p-6">
                                        <form onSubmit={handleAddQuestion} className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Title / ID</label>
                                                    <Input
                                                        placeholder="e.g. Household Technology in UK"
                                                        required
                                                        className="rounded-xl h-12"
                                                        value={newQuestion.title}
                                                        onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Task Number</label>
                                                    <Select
                                                        value={newQuestion.task_type}
                                                        onValueChange={v => setNewQuestion({ ...newQuestion, task_type: v })}
                                                    >
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="task1">Task 1 (Academic)</SelectItem>
                                                            <SelectItem value="task2">Task 2</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Question Type</label>
                                                    <Select
                                                        value={newQuestion.question_type}
                                                        onValueChange={v => setNewQuestion({ ...newQuestion, question_type: v })}
                                                    >
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {newQuestion.task_type === "task1"
                                                                ? TASK1_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)
                                                                : TASK2_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Source</label>
                                                    <Select
                                                        value={newQuestion.source}
                                                        onValueChange={v => setNewQuestion({ ...newQuestion, source: v })}
                                                    >
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Prompt Text</label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Enter the full IELTS prompt here..."
                                                    className="w-full bg-transparent border rounded-xl p-4 focus:ring-2 focus:ring-jaxtina-red/20 outline-none text-sm leading-relaxed"
                                                    required
                                                    value={newQuestion.description}
                                                    onChange={e => setNewQuestion({ ...newQuestion, description: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Image URL (Optional)</label>
                                                <Input
                                                    placeholder="https://example.com/image.png"
                                                    className="rounded-xl h-12"
                                                    value={newQuestion.image_url}
                                                    onChange={e => setNewQuestion({ ...newQuestion, image_url: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4 border-t">
                                                <Button type="button" variant="ghost" onClick={() => setShowAddQuestion(false)}>Cancel</Button>
                                                <Button type="submit" disabled={loading} className="bg-jaxtina-red hover:opacity-90 rounded-xl px-8 font-bold">
                                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                    Save Question
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid gap-4">
                                {filteredQuestions.length === 0 ? (
                                    <div className="text-center py-20 bg-white dark:bg-neutral-900 border rounded-3xl text-neutral-500 italic">
                                        No questions found in the database
                                    </div>
                                ) : (
                                    filteredQuestions.map(q => (
                                        <Card key={q.id} className="rounded-3xl border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="p-4 grid md:grid-cols-[1fr,auto] items-center gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${q.task_type === 'task1' ? 'bg-blue-50 text-jaxtina-blue' : 'bg-orange-50 text-orange-600'}`}>
                                                        {q.task_type === 'task1' ? '📊' : '✍️'}
                                                    </div>
                                                    <div>
                                                        <div className="flex gap-2 items-center mb-1">
                                                            <Badge variant="outline" className="text-[10px] h-5 rounded-md uppercase font-bold tracking-wider">
                                                                {q.task_type === 'task1' ? 'Task 1' : 'Task 2'}
                                                            </Badge>
                                                            <span className="text-xs font-bold text-neutral-400">·</span>
                                                            <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">{q.question_type}</span>
                                                            <span className="text-xs font-bold text-neutral-400">·</span>
                                                            <span className="text-xs text-neutral-500">{q.source}</span>
                                                        </div>
                                                        <h4 className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{q.title}</h4>
                                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{q.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pl-4 border-l border-neutral-100 dark:border-neutral-800 h-full">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteQuestion(q.id)}
                                                        className="text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="rounded-xl">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Toast provider requirement check - usually at root but added here for safety if sonner not global */}
            {/* <Toaster position="top-right" richColors /> */}
        </div>
    );
}
