import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Database,
  ExternalLink,
  LayoutDashboard,
  LockKeyhole,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Users,
  CircleCheck,
  CircleX,
  Eye,
  Copy,
  Link2,
  Sparkles,
} from "lucide-react";
import {
  RSVP_SHEET_EDIT_URL,
  RSVP_SHEET_ID,
  fetchSheetRows,
  getSheetConfig,
  saveSheetConfig,
  type RsvpAttendance,
  type RsvpSheetRow,
  deleteSheetRow,
  updateSheetRow,
} from "@/lib/rsvp-sheet";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type ToastTone = "success" | "error" | "warn";

function toastClass(tone: ToastTone) {
  if (tone === "error") return "border-destructive/70 text-destructive";
  if (tone === "warn") return "border-primary/60 text-primary";
  return "border-primary/60 text-primary";
}

function DashboardPage() {
  const [config, setConfig] = useState(() => getSheetConfig());
  const [loginPin, setLoginPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [rows, setRows] = useState<RsvpSheetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: ToastTone } | null>(null);
  const [sheetSource, setSheetSource] = useState(config.csvUrl);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUnlocked(window.sessionStorage.getItem("rsvp_dashboard_unlocked") === "true");
  }, []);

  const pushMessage = (text: string, tone: ToastTone = "success") => {
    setMessage({ text, tone });
    window.setTimeout(() => setMessage(null), 3200);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const fresh = await fetchSheetRows(sheetSource || config.csvUrl);
      setRows(fresh);
      pushMessage("Live data loaded from Google Sheets.", "success");
    } catch (error) {
      console.error(error);
      setRows([]);
      pushMessage("Could not load the sheet. Publish it to the web or check the CSV URL.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    void reload();
  }, [unlocked]);

  const stats = {
    total: rows.length,
    attending: rows.filter((row) => row.status === "attending").length,
    declined: rows.filter((row) => row.status === "declined").length,
    seats: rows.reduce((sum, row) => sum + (row.status === "attending" ? Math.max(1, row.seats || 1) : 0), 0),
  };

  const submitLogin = (event: FormEvent) => {
    event.preventDefault();
    if (loginPin.trim() === (config.dashboardPin || "082226")) {
      sessionStorage.setItem("rsvp_dashboard_unlocked", "true");
      setUnlocked(true);
      pushMessage("Dashboard unlocked.", "success");
      return;
    }
    pushMessage("Incorrect dashboard PIN.", "error");
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const next = saveSheetConfig({
        sheetId: RSVP_SHEET_ID,
        csvUrl: sheetSource.trim() || config.csvUrl || "",
        scriptUrl: config.scriptUrl.trim(),
        dashboardPin: config.dashboardPin.trim() || "082226",
      });
      setConfig(next);
      setSheetSource(next.csvUrl);
      pushMessage("Settings saved.", "success");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (row: RsvpSheetRow, attendance: RsvpAttendance) => {
    const nextRows = rows.map((item) =>
      item.rowNumber === row.rowNumber ? { ...item, status: attendance } : item,
    );
    setRows(nextRows);
    try {
      await updateSheetRow(row, { attendance });
      pushMessage("Row updated in the sheet.", "success");
    } catch (error) {
      console.error(error);
      pushMessage("The Apps Script URL is missing or the update failed.", "error");
      setRows(rows);
    }
  };

  const removeRow = async (row: RsvpSheetRow) => {
    if (!window.confirm(`Delete ${row.name} from the sheet?`)) return;
    const nextRows = rows.filter((item) => item.rowNumber !== row.rowNumber);
    setRows(nextRows);
    try {
      await deleteSheetRow(row);
      pushMessage("Row deleted from the sheet.", "warn");
    } catch (error) {
      console.error(error);
      pushMessage("Delete failed. Check the Apps Script URL.", "error");
      setRows(rows);
    }
  };

  const copySheetLink = async () => {
    await navigator.clipboard.writeText(RSVP_SHEET_EDIT_URL);
    pushMessage("Sheet link copied.", "success");
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-md p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 text-primary mb-6">
            <LockKeyhole className="w-6 h-6" strokeWidth={1.5} />
            <span className="tracking-[0.35em] uppercase text-xs">Private Dashboard</span>
          </div>
          <h1 className="font-serif text-4xl text-center mb-3">RSVP Console</h1>
          <p className="text-center text-foreground/70 text-sm mb-6">
            Open the dashboard to review live rows from your Google Sheet and manage the connection settings.
          </p>
          <form onSubmit={submitLogin} className="space-y-4">
            <label className="block">
              <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Dashboard PIN</span>
              <input
                value={loginPin}
                onChange={(event) => setLoginPin(event.target.value)}
                type="password"
                className="mt-2 w-full rounded-xl bg-input border border-border px-4 py-3 outline-none focus:border-primary"
                placeholder="Enter PIN"
              />
            </label>
            <button className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-[0.25em] uppercase text-xs hover:brightness-110 transition inline-flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" strokeWidth={1.5} />
              Enter Dashboard
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between text-xs text-foreground/55">
            <a href="/" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to invitation
            </a>
            <span>Sheet ID: {RSVP_SHEET_ID.slice(0, 8)}…</span>
          </div>
          {message && (
            <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${toastClass(message.tone)}`}>
              {message.text}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 md:px-6 py-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-3xl border border-border bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-primary/90 mb-3">
                <LayoutDashboard className="w-6 h-6" strokeWidth={1.5} />
                <span className="tracking-[0.35em] uppercase text-xs">Dashboard</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl">RSVP Console</h1>
              <p className="text-foreground/70 mt-2 max-w-2xl">
                This page reads live responses from your Google Sheet and lets you manage the sheet connection for the live form.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={RSVP_SHEET_EDIT_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-full border border-border bg-background/40 text-sm inline-flex items-center gap-2 hover:border-primary/70 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Sheet
              </a>
              <a
                href="/"
                className="px-4 py-3 rounded-full bg-primary text-primary-foreground text-sm inline-flex items-center gap-2 hover:brightness-110 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to site
              </a>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-5 h-5" />} label="Total Responses" value={stats.total} />
            <StatCard icon={<CircleCheck className="w-5 h-5" />} label="Attending" value={stats.attending} />
            <StatCard icon={<CircleX className="w-5 h-5" />} label="Declined" value={stats.declined} />
            <StatCard icon={<Database className="w-5 h-5" />} label="Seats Taken" value={stats.seats} />
          </div>
          {message && (
            <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${toastClass(message.tone)}`}>
              {message.text}
            </div>
          )}
        </header>

        <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-serif text-3xl">Live Sheet Data</h2>
                <p className="text-sm text-foreground/65 mt-1">Columns: #, Name, Seats, Phone, Message, Status, Actions</p>
              </div>
              <button
                onClick={() => void reload()}
                className="px-4 py-2 rounded-full border border-border inline-flex items-center gap-2 text-sm hover:border-primary/70 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-[860px] w-full text-sm">
                <thead className="bg-background/70 text-foreground/80">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Seats</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Message</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.rowNumber} className="border-t border-border/70 align-top">
                      <td className="px-4 py-4 text-foreground/60">{index + 1}</td>
                      <td className="px-4 py-4 font-medium">{row.name}</td>
                      <td className="px-4 py-4">{row.status === "attending" ? Math.max(1, row.seats || 1) : "—"}</td>
                      <td className="px-4 py-4 text-foreground/70">{row.phone || "—"}</td>
                      <td className="px-4 py-4 text-foreground/70 max-w-[260px] truncate" title={row.message || ""}>
                        {row.message || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={row.status}
                          onChange={(event) => void updateStatus(row, event.target.value as RsvpAttendance)}
                          className="rounded-full border border-border bg-background/60 px-3 py-2 text-xs uppercase tracking-[0.22em] outline-none focus:border-primary"
                        >
                          <option value="attending">Attending</option>
                          <option value="declined">Declined</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => void updateStatus(row, "attending")}
                            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:border-primary/70 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Mark Attending
                          </button>
                          <button
                            onClick={() => void removeRow(row)}
                            className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-foreground/60">
                        No rows loaded yet. Publish the sheet to the web or set the CSV URL in settings.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-foreground/60">
                        Loading live rows from Google Sheets…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 text-primary/90">
                <Link2 className="w-5 h-5" />
                <h2 className="font-serif text-3xl">Connection</h2>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs tracking-[0.25em] uppercase text-primary/80">CSV URL</span>
                  <input
                    value={sheetSource}
                    onChange={(event) => setSheetSource(event.target.value)}
                    className="mt-2 w-full rounded-xl bg-input border border-border px-4 py-3 outline-none focus:border-primary text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Apps Script URL</span>
                  <input
                    value={config.scriptUrl}
                    onChange={(event) => setConfig((current) => ({ ...current, scriptUrl: event.target.value }))}
                    placeholder="https://script.google.com/macros/s/..."
                    className="mt-2 w-full rounded-xl bg-input border border-border px-4 py-3 outline-none focus:border-primary text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.25em] uppercase text-primary/80">Dashboard PIN</span>
                  <input
                    value={config.dashboardPin}
                    onChange={(event) => setConfig((current) => ({ ...current, dashboardPin: event.target.value }))}
                    className="mt-2 w-full rounded-xl bg-input border border-border px-4 py-3 outline-none focus:border-primary text-sm"
                  />
                </label>
                <button
                  onClick={() => void saveSettings()}
                  disabled={saving}
                  className="w-full rounded-full bg-primary text-primary-foreground py-3 text-xs tracking-[0.25em] uppercase hover:brightness-110 transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : "Save Settings"}
                </button>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={copySheetLink}
                    className="flex-1 rounded-full border border-border px-4 py-3 text-xs tracking-[0.2em] uppercase hover:border-primary/70 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Sheet
                  </button>
                  <a
                    href={RSVP_SHEET_EDIT_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-border px-4 py-3 text-xs tracking-[0.2em] uppercase hover:border-primary/70 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Sheet
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 text-primary/90">
                <Sparkles className="w-5 h-5" />
                <h2 className="font-serif text-3xl">Where is the dashboard?</h2>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                The dashboard lives at <span className="text-primary">/dashboard</span> on the live site. Use it to unlock the console, save the Apps Script URL, and refresh the sheet-backed guest list.
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed mt-4">
                The form can only write to the sheet after the Apps Script web app URL is pasted here and deployed from your Google account.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background/35 p-5">
      <div className="flex items-center gap-3 text-primary/90 mb-3">
        {icon}
        <span className="text-xs tracking-[0.25em] uppercase">{label}</span>
      </div>
      <div className="font-serif text-4xl">{value}</div>
    </div>
  );
}
