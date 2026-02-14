"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Search, RefreshCw, Users, Crown, Zap, Clock,
  AlertTriangle, Shield, Pencil, Gift, X, Check,
  ChevronDown, ChevronUp, Copy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  planTier: string | null;
  isSubscribed: boolean | null;
  isActive: boolean | null;
  createdAt: string | null;
  deletedAt: string | null;
  accessExpiresAt: string | null;
  phone: string | null;
  metadata: any;
  previousUserId: string | null;
}

interface Stats {
  total: number; active: number; expired: number;
  deleted: number; inactive: number;
  free: number; lite: number; pro: number; migrations: number;
}

interface ActivityLog {
  id: string;
  userId?: string; // Add this
  userEmail: string;
  userName: string | null;
  action: 'PLAN_CHANGE' | 'DELETE' | 'GRANT' | 'UPDATE' | 'LOGIN';
  details: string | null; // JSON string
  createdAt: string;
  adminId: string;
}

type TabFilter = "all" | "active" | "expired" | "inactive" | "deleted" | "logs";

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabFilter>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', planTier: '' as string, accessMonths: '' });
  const [saving, setSaving] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const [grantForm, setGrantForm] = useState({ name: '', email: '', phone: '', planTier: 'pro' as 'lite' | 'pro', password: '', reason: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) { setUsers(data.users); setStats(data.stats); }
      else toast.error(data.error || "Failed to load users");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/user-activities", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setLogs(data.logs);
    } catch { console.error("Failed to fetch logs"); }
  }, []);

  useEffect(() => { 
    if (tab === 'logs') fetchLogs();
    else fetchUsers(); 
  }, [fetchUsers, fetchLogs, tab]);

  // ── Expand user card for editing ──
  const toggleExpand = (user: User) => {
    if (expandedUser === user.id) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(user.id);
    setEditForm({
      name: user.name || '',
      email: user.email,
      password: '',
      planTier: user.planTier || 'free',
      accessMonths: '',
    });
  };

  // ── Save user changes ──
  const handleSave = async (user: User) => {
    const body: Record<string, any> = { userId: user.id };
    const changes: string[] = [];

    // Only send changed fields
    if (editForm.name && editForm.name !== user.name) { body.name = editForm.name; changes.push('name'); }
    if (editForm.email && editForm.email !== user.email) { body.email = editForm.email; changes.push('email'); }
    if (editForm.password) { body.password = editForm.password; changes.push('password'); }
    if (editForm.planTier && editForm.planTier !== user.planTier) { body.planTier = editForm.planTier; changes.push('plan'); }
    if (editForm.accessMonths) { body.accessMonths = Number(editForm.accessMonths); changes.push('expiry'); }

    if (changes.length === 0) { toast.info("No changes to save"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setExpandedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  // ── Toggle Active ──
  const handleToggle = async (user: User) => {
    const newActive = user.isActive === false;
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isActive: newActive }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchUsers(); }
      else toast.error(data.error);
    } catch { toast.error("Failed"); }
  };

  // ── Quick Plan Change ──
  const handleQuickPlan = async (userId: string, planTier: string) => {
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planTier, isActive: true }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchUsers(); }
      else toast.error(data.error);
    } catch { toast.error("Failed"); }
  };

  // ── Grant Plan ──
  const handleGrant = async () => {
    if (!grantForm.name || !grantForm.email || !grantForm.password) {
      toast.error("Name, email, and password are required"); return;
    }
    try {
      const res = await fetch("/api/admin/grant-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grantForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowGrant(false);
        setGrantForm({ name: '', email: '', phone: '', planTier: 'pro', password: '', reason: '' });
        fetchUsers();
      } else toast.error(data.error);
    } catch { toast.error("Failed to grant plan"); }
  };

  // ── Delete User ──
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This will delete the user but keep payment history.")) return;
    if (!confirm("Double check! This cannot be undone.")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error("Failed to delete user"); }
  };

  // ── Filter ──
  const now = new Date();
  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase();
    const matchesSearch = !search || 
      user.name?.toLowerCase().includes(q) || 
      user.email.toLowerCase().includes(q) ||
      user.phone?.includes(search);
    if (!matchesSearch) return false;

    if (tab === "active") return !user.deletedAt && user.isActive !== false && (!user.accessExpiresAt || new Date(user.accessExpiresAt) >= now);
    if (tab === "expired") return !user.deletedAt && user.accessExpiresAt && new Date(user.accessExpiresAt) < now;
    if (tab === "inactive") return !user.deletedAt && user.isActive === false;
    if (tab === "deleted") return !!user.deletedAt;
    return true;
  });

  const getStatus = (user: User) => {
    if (user.deletedAt) return { label: "Deleted", cls: "text-red-500 bg-red-50" };
    if (user.isActive === false) return { label: "Inactive", cls: "text-gray-500 bg-gray-50" };
    if (user.accessExpiresAt && new Date(user.accessExpiresAt) < now) return { label: "Expired", cls: "text-amber-600 bg-amber-50" };
    return { label: "Active", cls: "text-emerald-600 bg-emerald-50" };
  };

  const planBadge = (tier: string | null) => {
    if (tier === "pro") return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    if (tier === "lite") return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
    return "bg-slate-200 text-slate-700";
  };

  const daysLeft = (exp: string | null) => {
    if (!exp) return "No expiry";
    const d = Math.ceil((new Date(exp).getTime() - now.getTime()) / 86400000);
    return d < 0 ? `${Math.abs(d)}d ago` : `${d}d left`;
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl md:text-2xl font-bold">User Management</h1>
        <Button
          size="sm"
          onClick={() => setShowGrant(!showGrant)}
          className={`text-xs font-bold ${showGrant ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
        >
          <Gift className="w-3.5 h-3.5 mr-1" />
          {showGrant ? 'Close' : 'Grant Plan'}
        </Button>
      </div>

      {/* Grant Form */}
      {showGrant && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-bold text-purple-800">Grant Lite/Pro — No Payment</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" value={grantForm.name} placeholder="Full Name *"
              onChange={(e) => setGrantForm(f => ({ ...f, name: e.target.value }))}
              className="h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-500" />
            <input type="email" value={grantForm.email} placeholder="Email *"
              onChange={(e) => setGrantForm(f => ({ ...f, email: e.target.value }))}
              className="h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-500" />
            <input type="text" value={grantForm.phone} placeholder="Phone"
              onChange={(e) => setGrantForm(f => ({ ...f, phone: e.target.value }))}
              className="h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" value={grantForm.password} placeholder="Password (8+ chars, Aa1) *"
              onChange={(e) => setGrantForm(f => ({ ...f, password: e.target.value }))}
              className="h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-500" />
            <select value={grantForm.planTier}
              onChange={(e) => setGrantForm(f => ({ ...f, planTier: e.target.value as 'lite' | 'pro' }))}
              className="h-9 px-3 text-xs border rounded-lg outline-none bg-white focus:border-purple-500">
              <option value="lite">Lite (4 months)</option>
              <option value="pro">Pro (7 months)</option>
            </select>
            <input type="text" value={grantForm.reason} placeholder="Reason (optional)"
              onChange={(e) => setGrantForm(f => ({ ...f, reason: e.target.value }))}
              className="h-9 px-3 text-xs border rounded-lg outline-none focus:border-purple-500" />
          </div>
          <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold" onClick={handleGrant}>
            <Gift className="w-3 h-3 mr-1" /> Create & Grant Plan
          </Button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {[
            { l: "Total", v: stats.total, c: "text-slate-600" },
            { l: "Active", v: stats.active, c: "text-emerald-600" },
            { l: "Expired", v: stats.expired, c: "text-amber-600" },
            { l: "Inactive", v: stats.inactive, c: "text-gray-500" },
            { l: "Deleted", v: stats.deleted, c: "text-red-500" },
            { l: "Free", v: stats.free, c: "text-slate-500" },
            { l: "Lite", v: stats.lite, c: "text-blue-500" },
            { l: "Pro", v: stats.pro, c: "text-amber-500" },
            { l: "Upgrades", v: stats.migrations, c: "text-purple-500" },
          ].map(({ l, v, c }) => (
            <div key={l} className="bg-white rounded-lg border p-2 text-center">
              <div className={`text-lg font-bold ${c}`}>{v}</div>
              <div className="text-[10px] text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border text-sm outline-none focus:border-indigo-500" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "active", "expired", "inactive", "deleted", "logs"] as TabFilter[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                tab === t ? 'bg-slate-900 text-white' : 'bg-white border text-slate-500 hover:bg-slate-50'
              }`}>
              {t === 'logs' ? 'Activity Log' : t}
            </button>
          ))}
          <button onClick={() => tab === 'logs' ? fetchLogs() : fetchUsers()} disabled={loading}
            className="px-2 py-1.5 rounded-md bg-white border text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Results */}
      {tab === 'logs' ? (
        <div className="space-y-3">
           {logs.length === 0 ? <div className="text-center py-12 text-slate-400">No activity logs found</div> : 
            logs.map((log) => {
              const details = log.details ? JSON.parse(log.details) : {};
              const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });
              const logDate = new Date(log.createdAt);
              const exactTime = logDate.toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              // Use log.userId as primary, fallback to details.userId
              const displayUserId = 'userId' in log ? (log as any).userId : details.userId;

              return (
                <div key={log.id} className="bg-white rounded-lg border p-4 text-sm shadow-sm transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                         log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                         log.action === 'PLAN_CHANGE' ? 'bg-amber-100 text-amber-700' :
                         log.action === 'GRANT' ? 'bg-purple-100 text-purple-700' :
                         'bg-slate-100 text-slate-700'
                       }`}>{log.action}</span>
                       <div className="flex flex-col">
                         <span className="font-semibold text-slate-900">{log.userEmail}</span>
                         {log.userName && <span className="text-xs text-slate-500">{log.userName}</span>}
                       </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-900" title={exactTime}>{timeAgo}</div>
                      <div className="text-[10px] text-slate-400">{exactTime}</div>
                    </div>
                  </div>

                  {/* ID Section & Deleted Date Override */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100 w-fit">
                        <span className="text-[10px] uppercase font-bold text-slate-400">User ID:</span>
                        <code className="text-xs font-mono text-slate-600 select-all">{displayUserId || 'N/A'}</code>
                        {displayUserId && (
                        <button onClick={() => {
                            navigator.clipboard.writeText(displayUserId);
                            toast.success("ID copied");
                        }} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Copy ID">
                            <Copy className="w-3 h-3" />
                        </button>
                        )}
                    </div>
                    {log.action === 'DELETE' && (
                        <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100 w-fit">
                            Deleted on: {exactTime}
                        </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-md">
                    {Object.entries(details).map(([key, value]) => {
                      if (key === 'userId') return null; // Already shown
                      if (key === 'oldValues' || key === 'newValues' || key === 'changes') {
                         return (
                           <div key={key} className="col-span-full mt-1">
                             <span className="font-semibold text-slate-700 block mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                             <pre className="bg-white border rounded p-2 overflow-x-auto text-[10px]">{JSON.stringify(value, null, 2)}</pre>
                           </div>
                         );
                      }
                      return (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium text-slate-500 capitalize min-w-[80px]">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="truncate" title={String(value)}>{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
           }
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400">{filteredUsers.length} users</p>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No users found</div>
            ) : (
              filteredUsers.map((user) => {
                const status = getStatus(user);
                const isExpanded = expandedUser === user.id;

                return (
                  <div key={user.id} className={`bg-white rounded-lg border ${user.deletedAt ? 'opacity-50' : ''}`}>
                    {/* Main row */}
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {/* Name + badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="font-semibold text-sm truncate">{user.name || "—"}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${planBadge(user.planTier)}`}>
                              {user.planTier || "free"}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status.cls}`}>
                              {status.label}
                            </span>
                            {user.role === "admin" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">ADMIN</span>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                            <span>{user.email}</span>
                            {user.phone && <span>📱{user.phone}</span>}
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {daysLeft(user.accessExpiresAt)}
                            </span>
                          </div>
                        </div>
                        {/* Actions */}
                        {!user.deletedAt && (
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Quick plan buttons */}
                            {user.planTier !== "pro" && (
                              <button onClick={() => handleQuickPlan(user.id, 'pro')}
                                className="h-7 px-2 text-[10px] font-bold rounded-md bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 flex items-center gap-0.5"
                                title="Make Pro">
                                <Crown className="w-3 h-3" /> Pro
                              </button>
                            )}
                            {user.planTier !== "lite" && user.planTier !== "pro" && (
                              <button onClick={() => handleQuickPlan(user.id, 'lite')}
                                className="h-7 px-2 text-[10px] font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 flex items-center gap-0.5"
                                title="Make Lite">
                                <Zap className="w-3 h-3" /> Lite
                              </button>
                            )}
                            {/* Toggle active */}
                            <button onClick={() => handleToggle(user)}
                              className={`h-7 px-2 text-[10px] font-bold rounded-md border flex items-center gap-0.5 ${
                                user.isActive === false
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                              }`}>
                              <Shield className="w-3 h-3" />
                              {user.isActive === false ? 'On' : 'Off'}
                            </button>
                            {/* Edit expand */}
                            <button onClick={() => toggleExpand(user)}
                              className={`h-7 px-2 text-[10px] font-bold rounded-md border flex items-center gap-0.5 ${
                                isExpanded ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                              }`}>
                              <Pencil className="w-3 h-3" />
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            {/* Delete Button */}
                            <button onClick={() => handleDeleteUser(user.id)}
                              className="h-7 px-2 text-[10px] font-bold rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-0.5"
                              title="Delete User">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded edit form */}
                    {isExpanded && !user.deletedAt && (
                      <div className="border-t bg-slate-50 p-3 sm:p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Name</label>
                            <input type="text" value={editForm.name}
                              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full h-8 px-2 text-xs border rounded outline-none focus:border-indigo-500" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Email</label>
                            <input type="email" value={editForm.email}
                              onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                              className="w-full h-8 px-2 text-xs border rounded outline-none focus:border-indigo-500" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">New Password</label>
                            <input type="text" value={editForm.password}
                              onChange={(e) => setEditForm(f => ({ ...f, password: e.target.value }))}
                              className="w-full h-8 px-2 text-xs border rounded outline-none focus:border-indigo-500"
                              placeholder="Leave empty to keep" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Plan</label>
                            <select value={editForm.planTier}
                              onChange={(e) => setEditForm(f => ({ ...f, planTier: e.target.value }))}
                              className="w-full h-8 px-2 text-xs border rounded outline-none bg-white focus:border-indigo-500">
                              <option value="free">Free</option>
                              <option value="lite">Lite</option>
                              <option value="pro">Pro</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Extend (months)</label>
                            <input type="number" min={1} max={24} value={editForm.accessMonths}
                              onChange={(e) => setEditForm(f => ({ ...f, accessMonths: e.target.value }))}
                              className="w-full h-8 px-2 text-xs border rounded outline-none focus:border-indigo-500"
                              placeholder="e.g. 3" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" disabled={saving}
                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            onClick={() => handleSave(user)}>
                            <Check className="w-3 h-3 mr-1" /> {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs"
                            onClick={() => setExpandedUser(null)}>
                            <X className="w-3 h-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
