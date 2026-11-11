import React, { useState, useMemo } from "react";
import { UserPlus, X, Edit, Key, ShieldCheck, User as UserIcon } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { User } from "../lib/types";
import { usersApi, ApiClientError } from "../lib/api";

export function UsersModule({ users, onUsersChange, currentUser }: { users: User[]; onUsersChange: () => void; currentUser: any }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [changingPassword, setChangingPassword] = useState<User | null>(null);
  
  const [form, setForm] = useState({ username: "", password: "", displayName: "", role: "worker", title: "Barangay Health Worker" });
  const [passForm, setPassForm] = useState({ newPassword: "" });
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSubmit() {
    if (!form.displayName || !form.role || !form.title) return;
    if (!editing && (!form.username || !form.password)) return;

    setSaving(true);
    setSaveError("");
    try {
      if (editing) {
        await usersApi.update(editing.id, { displayName: form.displayName, role: form.role, title: form.title });
      } else {
        await usersApi.create({ ...form });
      }
      onUsersChange();
      closeModal();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit() {
    if (!passForm.newPassword || !changingPassword) return;

    setSaving(true);
    setSaveError("");
    try {
      await usersApi.updatePassword(changingPassword.id, passForm.newPassword);
      closeModal();
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await usersApi.delete(id);
      onUsersChange();
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : "Failed to delete user.");
    }
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ username: u.username, password: "", displayName: u.displayName, role: u.role, title: u.title });
    setShowAdd(true);
  }

  function openPassword(u: User) {
    setChangingPassword(u);
    setPassForm({ newPassword: "" });
  }

  function closeModal() {
    setShowAdd(false);
    setEditing(null);
    setChangingPassword(null);
    setForm({ username: "", password: "", displayName: "", role: "worker", title: "Barangay Health Worker" });
    setPassForm({ newPassword: "" });
    setSaveError("");
  }

  return (
    <div>
      <SectionHeader title="Staff Management" subtitle="Manage administrators and health workers" action={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
          <UserPlus size={14} /> Add Staff
        </button>
      } />

      {(showAdd || editing) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">{editing ? "Edit Staff Member" : "Add New Staff"}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Display Name</label>
                <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none" placeholder="e.g. Maria Santos" />
              </div>
              {!editing && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Username</label>
                    <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none" placeholder="e.g. maria.santos" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Password</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">System Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none">
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Job Title</label>
                  <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none">
                    <option>Barangay Health Worker</option>
                    <option>Nurse</option>
                    <option>Midwife</option>
                    <option>Doctor</option>
                    <option>Administrator</option>
                  </select>
                </div>
              </div>
              {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted">Cancel</button>
              <button disabled={saving} onClick={handleSubmit} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {changingPassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Change Password</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Changing password for <strong>{changingPassword.username}</strong></p>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">New Password</label>
                <input type="password" value={passForm.newPassword} onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none" />
              </div>
              {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted">Cancel</button>
              <button disabled={saving} onClick={handlePasswordSubmit} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Updating..." : "Update Password"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Staff Member</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Username</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">System Role</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{u.avatar}</div>
                    <span className="font-medium text-foreground">{u.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.username}</td>
                <td className="px-4 py-3 text-foreground">{u.title}</td>
                <td className="px-4 py-3">
                  <Badge className={u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                    {u.role === "admin" ? <ShieldCheck size={12} className="mr-1 inline" /> : <UserIcon size={12} className="mr-1 inline" />}
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openPassword(u)} className="p-1.5 text-muted-foreground hover:text-amber-600 transition-colors" title="Change Password"><Key size={14} /></button>
                    <button onClick={() => openEdit(u)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Edit Staff"><Edit size={14} /></button>
                    {u.id.toString() !== currentUser.id?.toString() && (
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors" title="Delete Staff"><X size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No staff members found.</div>
        )}
      </div>
    </div>
  );
}
