import React, { useEffect, useState, useRef } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Newspaper,
  Trophy,
  Users,
  Files,
  LayoutDashboard,
  Settings,
  Search,
  Plus,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  Sun,
  Moon,
  Monitor,
  Medal,
  MapPin,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Shield,
  Image,
  UserRound,
  Download,
  Check,
  Globe,
} from "lucide-react";
import { api, errorMessage, setToken } from "./api";
import { useApp } from "./context";
import {
  moduleNames,
  labels,
  fields,
  roles,
  canManage,
  tally,
  type ModuleName,
} from "../../shared/modules";
const icons: any = {
  events: CalendarDays,
  news: Newspaper,
  circulars: Files,
  results: Trophy,
  committee: Users,
  directory: Users,
  gallery: Image,
  athletes: Medal,
};
const human = (s: string) =>
  s
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (x) => x.toUpperCase());
function useData(url: string) {
  const [data, setData] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  const location = useLocation();
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(url)
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, version, location.key]);
  return { data, loading, error, reload: () => setVersion((v) => v + 1) };
}
function State({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
}) {
  return loading ? (
    <div className="empty" role="status">
      Loading…
    </div>
  ) : error ? (
    <div className="empty error" role="alert">
      {error}
      <p>Check your connection and refresh to try again.</p>
    </div>
  ) : empty ? (
    <div className="empty">
      <Files size={30} />
      <h3>Nothing published yet</h3>
      <p>Updates will appear here when they are ready.</p>
    </div>
  ) : null;
}
function Logo() {
  return (
    <Link className="brand" to="/">
      <span className="brand-symbol">
        <Trophy size={25} />
      </span>
      <span>
        Maharashtra<span>OLYMPIC ASSOCIATION</span>
      </span>
    </Link>
  );
}
function ThemePicker() {
  const { theme, setTheme } = useApp();
  return (
    <div className="themes" aria-label="Color theme">
      {[
        ["light", Sun],
        ["dark", Moon],
        ["system", Monitor],
      ].map(([t, Icon]: any) => (
        <button
          key={t}
          className={theme === t ? "selected" : ""}
          onClick={() => setTheme(t)}
          aria-pressed={theme === t}
        >
          <Icon size={17} />
          {human(t)}
        </button>
      ))}
    </div>
  );
}
function ProfileMenu() {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, []);
  return (
    <div
      className="profile-menu"
      ref={ref}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button
        className="profile-trigger"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            user.name.slice(0, 2).toUpperCase()
          )}
        </span>
        <span>
          {user.name}
          <small>{human(user.role)}</small>
        </span>
        <ChevronRight size={16} />
      </button>
      {open && (
        <div className="dropdown">
          <Link to="/profile">
            <UserRound size={17} /> My profile
          </Link>
          <Link to="/settings">
            <Settings size={17} /> Settings
          </Link>
          <Link to="/notifications">
            <Bell size={17} /> Notifications
          </Link>
          <hr />
          <button onClick={logout}>
            <LogOut size={17} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc]);
  return (
    <>
      <div className="topstrip">
        <span>MAHARASHTRA OLYMPIC ASSOCIATION</span>
        <span>Excellence · Friendship · Respect</span>
      </div>
      <header className="public-header">
        <Logo />
        <button
          className="mobile-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
        <nav className={open ? "open" : ""}>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/results">Results</NavLink>
          <NavLink to="/news">News</NavLink>
          <NavLink to="/committee">Committee</NavLink>
        </nav>
        {user ? (
          <ProfileMenu />
        ) : (
          <Link className="btn outline" to="/admin/login">
            <Shield size={16} /> Admin login
          </Link>
        )}
      </header>
      {children}
      <footer>
        <div>
          <Logo />
          <p>Supporting sporting excellence across Maharashtra.</p>
        </div>
        <div>
          <Link to="/circulars">Circulars</Link>
          <Link to="/directory">Directory</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/athletes">Athletes</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <ThemePicker />
        <small>
          © {new Date().getFullYear()} Maharashtra Olympic Association
        </small>
      </footer>
    </>
  );
}
function Guard({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { ready, user } = useApp();
  if (!ready) return <div className="empty">Checking your session…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (admin && user.role === "user") return <Navigate to="/profile" replace />;
  return <>{children}</>;
}
function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState("");
  const loc = useLocation(),
    navigate = useNavigate();
  useEffect(() => setOpen(false), [loc]);
  return (
    <div className="admin-shell">
      {open && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={open ? "sidebar open" : "sidebar"}>
        <Logo />
        <div className="workspace-label">
          ADMINISTRATION <span>MOA</span>
        </div>
        <nav>
          <NavLink to="/admin/dashboard">
            <LayoutDashboard />
            Overview
          </NavLink>
          <p>CONTENT & COMPETITIONS</p>
          {moduleNames.map((m) => {
            const Icon = icons[m];
            return (
              <NavLink key={m} to={"/admin/" + m}>
                <Icon />
                {labels[m]}
              </NavLink>
            );
          })}
          <NavLink to="/admin/medals">
            <Medal />
            Medal tally
          </NavLink>
          <p>WORKSPACE</p>
          <NavLink to="/admin/media">
            <Upload />
            Media library
          </NavLink>
          {user.role === "super_admin" && (
            <>
              <NavLink to="/admin/users">
                <Shield />
                Users & roles
              </NavLink>
              <NavLink to="/admin/messages">
                <Newspaper />
                Contact messages
              </NavLink>
            </>
          )}
          <NavLink to="/notifications">
            <Bell />
            Notifications
          </NavLink>
          <NavLink to="/settings">
            <Settings />
            Settings
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/">
            <Globe size={17} /> View public website <ArrowUpRight size={15} />
          </Link>
          <ProfileMenu />
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="icon-button mobile-toggle"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/admin/search?q=" + encodeURIComponent(search));
            }}
            className="global-search"
          >
            <Search size={18} />
            <input
              aria-label="Search all content"
              placeholder="Search your workspace…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <span className="header-label">MOA workspace</span>
          <Link
            className="icon-button"
            aria-label="Notifications"
            to="/notifications"
          >
            <Bell size={20} />
          </Link>
          <ProfileMenu />
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
function Title({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
function Dashboard() {
  const { user } = useApp();
  const events = useData("/admin/content/events"),
    news = useData("/admin/content/news"),
    results = useData("/admin/content/results"),
    committee = useData("/admin/content/committee"),
    activity = useData("/admin/activity");
  const upcoming = events.data.filter((x) =>
    ["Upcoming", "Registration Open"].includes(x.eventStatus),
  );
  const totals = tally(results.data.filter((x) => x.status === "published"));
  return (
    <>
      <Title
        eyebrow="YOUR ASSOCIATION, AT A GLANCE"
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
        description="Keep Maharashtra’s sporting community moving forward."
        action={
          canManage(user.role, "events") ? (
            <Link className="btn" to="/admin/events?new=1">
              <Plus size={18} />
              Create event
            </Link>
          ) : undefined
        }
      />
      <div className="stats">
        {[
          [CalendarDays, "Total events", events],
          [Newspaper, "News articles", news],
          [Trophy, "Results recorded", results],
          [Users, "Committee members", committee],
        ].map(([Icon, label, d]: any) => (
          <div className="stat" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={20} />
            </div>
            <strong>{d.loading ? "—" : d.error ? "—" : d.data.length}</strong>
            <small>
              {d.error ? "Unable to load" : "Across your workspace"}
            </small>
          </div>
        ))}
      </div>
      <div className="bento">
        <section className="panel span2">
          <div className="section-head">
            <div>
              <h2>Upcoming events</h2>
              <p>The next dates on your calendar</p>
            </div>
            <Link to="/admin/events">
              View all <ArrowUpRight size={16} />
            </Link>
          </div>
          <State
            loading={events.loading}
            error={events.error}
            empty={!upcoming.length}
          />
          {upcoming.slice(0, 5).map((e) => (
            <Link className="event-row" to="/admin/events" key={e._id}>
              <div className="date-tile">
                <small>
                  {e.startDate
                    ? new Date(e.startDate).toLocaleDateString("en", {
                        month: "short",
                      })
                    : "TBD"}
                </small>
                <strong>{e.startDate ? e.startDate.slice(8) : "—"}</strong>
              </div>
              <div>
                <h3>{e.title}</h3>
                <p>
                  {e.sport} · {e.venue || "Venue to be confirmed"}
                </p>
              </div>
              <span className="badge">{e.eventStatus}</span>
              <ChevronRight size={17} />
            </Link>
          ))}
        </section>
        <section className="panel medal-panel">
          <div className="eyebrow">EVERY PODIUM COUNTS</div>
          <Trophy className="large-trophy" size={44} />
          <h2>Medal overview</h2>
          <p>Published competition results</p>
          <div className="medal-counts">
            {["Gold", "Silver", "Bronze"].map((m) => (
              <div key={m}>
                <span className={"medal-dot " + m} />
                <strong>{totals.reduce((a, b) => a + b[m], 0)}</strong>
                <small>{m}</small>
              </div>
            ))}
          </div>
          <Link className="btn outline" to="/admin/medals">
            Explore medal tally <ArrowUpRight size={17} />
          </Link>
        </section>
        <section className="panel span2">
          <div className="section-head">
            <h2>Recent activity</h2>
            <Activity size={20} />
          </div>
          <State
            loading={activity.loading}
            error={activity.error}
            empty={!activity.data.length}
          />
          {activity.data.slice(0, 6).map((a) => (
            <div className="activity-row" key={a._id}>
              <span className="activity-icon">
                <Check size={16} />
              </span>
              <div>
                <p>
                  <strong>{a.userName}</strong> · {a.action.toLowerCase()}
                </p>
                <span>{a.title}</span>
              </div>
              <small>{new Date(a.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Quick actions</h2>
          <p>Make an update in a few clicks.</p>
          {(["news", "circulars", "results", "committee"] as ModuleName[])
            .filter((m) => canManage(user.role, m))
            .map((m) => (
              <Link
                className="quick-action"
                to={"/admin/" + m + "?new=1"}
                key={m}
              >
                {labels[m]}
                <Plus size={17} />
              </Link>
            ))}
        </section>
      </div>
    </>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function UploadField({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const { notify } = useApp();
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await api.post("/upload", form);
      onChange(r.data.url);
      notify("Upload complete.");
    } catch (e) {
      notify(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <label>
      {label}
      <input
        type="url"
        placeholder="https://…"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        aria-label={"Upload " + label}
        type="file"
        accept={
          label === "PDF document"
            ? "application/pdf"
            : label === "Image or PDF"
              ? "application/pdf,image/png,image/jpeg,image/webp"
              : "image/png,image/jpeg,image/webp"
        }
        disabled={busy}
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {busy && <small>Uploading…</small>}
    </label>
  );
}
function Editor({
  module,
  record,
  onClose,
  onSaved,
}: {
  module: ModuleName;
  record: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({ ...record }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const set = (key: string, value: any) =>
    setForm((f: any) => ({ ...f, [key]: value }));
  const { notify } = useApp();
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form };
      delete body._id;
      delete body.createdAt;
      delete body.updatedAt;
      await (record._id
        ? api.put("/admin/content/" + module + "/" + record._id, body)
        : api.post("/admin/content/" + module, body));
      notify("Changes saved.");
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={(record._id ? "Edit " : "Create ") + labels[module]}
      onClose={onClose}
    >
      <form onSubmit={save} className="editor">
        <label>
          {["committee", "directory", "athletes"].includes(module)
            ? "Full name"
            : "Title"}
          <input
            required
            minLength={2}
            maxLength={180}
            value={form.title || ""}
            onChange={(e) => set("title", e.target.value)}
          />
        </label>
        <label>
          Description / content
          <textarea
            rows={6}
            value={form.description || ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>
        <div className="form-grid">
          {fields[module].map((key) => {
            if (key === "fileUrl")
              return (
                <UploadField
                  key={key}
                  label="PDF document"
                  value={form[key]}
                  onChange={(v) => set(key, v)}
                />
              );
            if (key === "hallOfFame")
              return (
                <label key={key} className="check">
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  Hall of Fame
                </label>
              );
            const options =
              key === "eventStatus"
                ? [
                    "Upcoming",
                    "Registration Open",
                    "Ongoing",
                    "Completed",
                    "Cancelled",
                  ]
                : key === "medal"
                  ? ["Gold", "Silver", "Bronze", "None"]
                  : null;
            return (
              <label key={key}>
                {human(key)}
                {options ? (
                  <select
                    value={form[key] || options[0]}
                    onChange={(e) => set(key, e.target.value)}
                  >
                    {options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      /Date|deadline|^date$/.test(key)
                        ? "date"
                        : ["position", "points", "order"].includes(key)
                          ? "number"
                          : key === "email"
                            ? "email"
                            : key.endsWith("Url")
                              ? "url"
                              : "text"
                    }
                    required={["athlete", "tournament", "position"].includes(
                      key,
                    )}
                    min={key === "position" ? 1 : 0}
                    value={form[key] ?? ""}
                    onChange={(e) => set(key, e.target.value)}
                  />
                )}
              </label>
            );
          })}
          <UploadField
            value={form.imageUrl}
            onChange={(v) => set("imageUrl", v)}
          />
          <label>
            Visibility
            <select
              value={form.status || "draft"}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn outline" onClick={onClose}>
            Cancel
          </button>
          <button disabled={busy} className="btn">
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Manager({ module }: { module: ModuleName }) {
  const { data, loading, error, reload } = useData("/admin/content/" + module);
  const { user, notify } = useApp();
  const [q, setQ] = useState(""),
    [status, setStatus] = useState("all"),
    [sort, setSort] = useState("newest"),
    [page, setPage] = useState(1),
    [editor, setEditor] = useState<any>(null),
    [remove, setRemove] = useState<any>(null);
  const editable = canManage(user.role, module);
  const location = useLocation();
  useEffect(() => {
    setEditor(
      editable && location.search.includes("new=1")
        ? { status: "draft", medal: "None", eventStatus: "Upcoming" }
        : null,
    );
    setQ("");
    setPage(1);
  }, [module, location.search]);
  let filtered = data.filter(
    (r) =>
      JSON.stringify(r).toLowerCase().includes(q.toLowerCase()) &&
      (status === "all" || r.status === status),
  );
  if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  async function deleteRecord() {
    try {
      await api.delete("/admin/content/" + module + "/" + remove._id);
      setRemove(null);
      reload();
      notify("Record deleted.");
    } catch (e) {
      notify(errorMessage(e));
    }
  }
  function exportCSV() {
    const keys = ["title", ...fields[module], "status"];
    const value = (v: any) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const blob = new Blob(
      [
        keys.join(",") +
          "\n" +
          filtered
            .map((r) => keys.map((k) => value(r[k])).join(","))
            .join("\n"),
      ],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = module + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <Title
        eyebrow="CONTENT MANAGEMENT"
        title={labels[module]}
        description="Manage drafts, publish updates, and keep your community informed."
        action={
          editable ? (
            <button
              className="btn"
              onClick={() =>
                setEditor({
                  status: "draft",
                  medal: "None",
                  eventStatus: "Upcoming",
                })
              }
            >
              <Plus size={18} />
              Add new
            </button>
          ) : (
            <span className="badge">Read-only access</span>
          )
        }
      />
      <section className="panel">
        <div className="toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Search records"
              placeholder={"Search " + labels[module].toLowerCase() + "…"}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            aria-label="Filter by visibility"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {["draft", "published", "archived"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            aria-label="Sort records"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Recently updated</option>
            <option value="title">Title A–Z</option>
          </select>
          <button className="btn outline" onClick={exportCSV}>
            <Download size={16} />
            Export
          </button>
        </div>
        <State loading={loading} error={error} empty={!filtered.length} />
        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    {["committee", "directory", "athletes"].includes(module)
                      ? "Name"
                      : "Title"}
                  </th>
                  <th>Category / sport</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * 10, page * 10).map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.title}</strong>
                      <small>
                        {r.venue ||
                          r.designation ||
                          r.athlete ||
                          r.documentNumber}
                      </small>
                    </td>
                    <td>{r.sport || r.category || "—"}</td>
                    <td>
                      <span className={"badge " + r.status}>
                        {human(r.status)}
                      </span>
                    </td>
                    <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <Link
                          title="View public record"
                          aria-label={"View " + r.title}
                          to={"/" + module + "/" + r._id}
                        >
                          <Eye size={16} />
                        </Link>
                        {editable && (
                          <>
                            <button
                              title="Edit"
                              aria-label={"Edit " + r.title}
                              onClick={() => setEditor(r)}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              title="Duplicate as draft"
                              aria-label={"Duplicate " + r.title}
                              onClick={() =>
                                setEditor({
                                  ...r,
                                  _id: undefined,
                                  title: r.title + " (copy)",
                                  status: "draft",
                                })
                              }
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              title="Delete"
                              aria-label={"Delete " + r.title}
                              onClick={() => setRemove(r)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <span>{filtered.length} records</span>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * 10 >= filtered.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </section>
      {editor && (
        <Editor
          module={module}
          record={editor}
          onClose={() => setEditor(null)}
          onSaved={reload}
        />
      )}
      {remove && (
        <Modal title="Delete this record?" onClose={() => setRemove(null)}>
          <p>“{remove.title}” will be permanently deleted.</p>
          <div className="modal-actions">
            <button className="btn outline" onClick={() => setRemove(null)}>
              Cancel
            </button>
            <button className="btn danger" onClick={deleteRecord}>
              Delete record
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function PublicList({ module }: { module: ModuleName }) {
  const { data, loading, error } = useData("/public/" + module);
  const [q, setQ] = useState(""),
    [filter, setFilter] = useState("all");
  useEffect(() => {
    setQ("");
    setFilter("all");
  }, [module]);
  const key =
    module === "events"
      ? "eventStatus"
      : ["results", "athletes"].includes(module)
        ? "sport"
        : "category";
  const rows = data.filter(
    (r) =>
      JSON.stringify(r).toLowerCase().includes(q.toLowerCase()) &&
      (filter === "all" || r[key] === filter),
  );
  return (
    <div className="public-content">
      <Title
        eyebrow="MAHARASHTRA OLYMPIC ASSOCIATION"
        title={labels[module]}
        description="Discover the latest from Maharashtra’s sporting community."
        action={
          module === "results" ? (
            <Link className="btn" to="/medals">
              <Medal size={18} />
              Medal tally
            </Link>
          ) : undefined
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Search"
            placeholder="Search by name, sport or district…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter category"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All {human(key).toLowerCase()}</option>
          {[...new Set(data.map((r) => r[key]).filter(Boolean))].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <State loading={loading} error={error} empty={!rows.length} />
      <div className="public-grid">
        {rows.map((r) => (
          <ContentCard key={r._id} module={module} r={r} />
        ))}
      </div>
    </div>
  );
}
function ContentCard({ module, r }: { module: ModuleName; r: any }) {
  const Icon = icons[module];
  return (
    <article className="content-card">
      {r.imageUrl ? (
        <img className="card-image" src={r.imageUrl} alt={r.title} />
      ) : (
        <div className="card-icon">
          <Icon size={30} />
          <span>{r.sport || r.category || labels[module]}</span>
        </div>
      )}
      <div className="card-body">
        <div className="eyebrow">
          {r.eventStatus ||
            r.designation ||
            r.sport ||
            r.category ||
            labels[module]}
        </div>
        <h3>
          <Link to={"/" + module + "/" + r._id}>{r.title}</Link>
        </h3>
        <p>{r.description?.slice(0, 130)}</p>
        {r.startDate && (
          <p className="meta">
            <CalendarDays size={15} />
            {r.startDate}
          </p>
        )}
        {r.venue && (
          <p className="meta">
            <MapPin size={15} />
            {r.venue}
          </p>
        )}
        {r.medal && (
          <span className="badge">
            {r.medal} · {r.athlete}
          </span>
        )}
        <Link className="text-link" to={"/" + module + "/" + r._id}>
          View details <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
function Detail({ module }: { module: ModuleName }) {
  const { id } = useParams();
  const { data, loading, error } = useData("/public/" + module);
  const r = data.find((x) => x._id === id);
  const { user, notify } = useApp();
  const [registration, setRegistration] = useState(false);
  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await api.post(
        "/events/" + id + "/register",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      notify("Your registration has been received.");
      setRegistration(false);
    } catch (e) {
      notify(errorMessage(e));
    }
  }
  return (
    <div className="public-content narrow">
      <Link to={"/" + module}>← Back to {labels[module].toLowerCase()}</Link>
      <State loading={loading} error={error} empty={!r} />
      {r && (
        <>
          <Title eyebrow={r.sport || r.category} title={r.title} />
          {r.imageUrl && (
            <img className="detail-image" src={r.imageUrl} alt={r.title} />
          )}
          <p className="article-text">{r.description}</p>
          <div className="detail-fields">
            {fields[module]
              .filter((k) => r[k] && k !== "fileUrl" && k !== "videoUrl")
              .map((k) => (
                <div key={k}>
                  <small>{human(k)}</small>
                  <strong>{String(r[k])}</strong>
                </div>
              ))}
          </div>
          {r.fileUrl && (
            <a
              className="btn"
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={18} />
              Open PDF
            </a>
          )}
          {r.videoUrl && (
            <a
              className="btn outline"
              href={r.videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Watch video
            </a>
          )}
          {module === "events" &&
            r.eventStatus === "Registration Open" &&
            (user ? (
              <button className="btn" onClick={() => setRegistration(true)}>
                Register for this event
              </button>
            ) : (
              <Link className="btn" to="/signup">
                Sign in to register
              </Link>
            ))}
        </>
      )}
      {registration && (
        <Modal
          title="Event registration"
          onClose={() => setRegistration(false)}
        >
          <form onSubmit={register} className="editor">
            {["name", "phone", "sport", "district"].map((k) => (
              <label key={k}>
                {human(k)}
                <input
                  name={k}
                  required
                  defaultValue={
                    k === "name" ? user.name : k === "sport" ? r.sport : ""
                  }
                />
              </label>
            ))}
            <button className="btn">Submit registration</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function Home() {
  const events = useData("/public/events"),
    news = useData("/public/news"),
    results = useData("/public/results");
  return (
    <main className="public-content">
      <div className="hero-grid">
        <section className="hero">
          <div className="eyebrow">THE SPIRIT OF MAHARASHTRA</div>
          <h1>
            One state.
            <br />
            Limitless potential.
          </h1>
          <p>
            Celebrating our athletes. Connecting our community.
            <br />
            Building the future of sport, together.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/events">
              Explore events <ArrowUpRight size={18} />
            </Link>
            <Link className="btn glass" to="/results">
              Latest results
            </Link>
          </div>
          <small>Balewadi Stadium, Pune · Illustrative venue photograph</small>
        </section>
        <section className="hero-side panel">
          <span className="eyebrow">ON THE CALENDAR</span>
          <CalendarDays size={36} />
          <h2>The next chapter starts here.</h2>
          <p>
            Find upcoming competitions, venues and registration information.
          </p>
          <Link className="text-link" to="/events">
            View all events <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
      <div className="stats public-stats">
        {[
          ["Events", events.data.length],
          ["News & updates", news.data.length],
          ["Results", results.data.length],
          [
            "Medals awarded",
            results.data.filter((r) => r.medal !== "None").length,
          ],
        ].map(([t, n]) => (
          <div className="stat" key={t}>
            <strong>
              {events.loading || news.loading || results.loading ? "—" : n}
            </strong>
            <span>{t}</span>
          </div>
        ))}
      </div>
      <div className="section-head">
        <div>
          <div className="eyebrow">COMPETE. CONNECT. CELEBRATE.</div>
          <h2>Events & tournaments</h2>
        </div>
        <Link to="/events">
          View all events <ArrowUpRight size={17} />
        </Link>
      </div>
      <State
        loading={events.loading}
        error={events.error}
        empty={!events.data.length}
      />
      <div className="public-grid">
        {events.data.slice(0, 3).map((r) => (
          <ContentCard key={r._id} module="events" r={r} />
        ))}
      </div>
      <div className="section-head spaced">
        <h2>From the association</h2>
        <Link to="/news">
          All news <ArrowUpRight size={17} />
        </Link>
      </div>
      <State
        loading={news.loading}
        error={news.error}
        empty={!news.data.length}
      />
      <div className="public-grid">
        {news.data.slice(0, 3).map((r) => (
          <ContentCard key={r._id} module="news" r={r} />
        ))}
      </div>
      <div className="notice-banner">
        <Files size={32} />
        <div>
          <h2>Official updates, in one place.</h2>
          <p>Browse bulletins, circulars and association notices.</p>
        </div>
        <Link className="btn outline" to="/circulars">
          View circulars <ArrowUpRight size={17} />
        </Link>
      </div>
      <small className="photo-credit">
        Stadium photograph:{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Balewadi_Athletics_Stadiums_Interior.jpg">
          Rdglobetrekker / Wikimedia Commons
        </a>
        ,{" "}
        <a href="https://creativecommons.org/licenses/by-sa/3.0/">
          CC BY-SA 3.0
        </a>
        . Cropped with a dark overlay.
      </small>
    </main>
  );
}
function Login({ signup = false }: { signup?: boolean }) {
  const { setUser, notify } = useApp(),
    navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post(
        signup ? "/auth/signup" : "/auth/login",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setToken(r.data.accessToken);
      setUser(r.data.user);
      notify("Welcome, " + r.data.user.name);
      navigate(r.data.user.role === "user" ? "/profile" : "/admin/dashboard");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-intro">
        <Trophy size={48} />
        <span className="eyebrow">MAHARASHTRA OLYMPIC ASSOCIATION</span>
        <h1>
          Behind every
          <br />
          great performance.
        </h1>
        <p>One connected workspace for the people who make sport happen.</p>
        <Link to="/">← Return to website</Link>
      </section>
      <section className="auth-card">
        <Shield size={30} />
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p>
          {signup
            ? "Join the sporting community."
            : "Sign in to your association account."}
        </p>
        <form onSubmit={submit}>
          {signup && (
            <label>
              Full name
              <input name="name" required autoComplete="name" minLength={2} />
            </label>
          )}
          <label>
            Email address
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              minLength={12}
              maxLength={72}
              required
              autoComplete={signup ? "new-password" : "current-password"}
            />
          </label>
          <small>
            {signup
              ? "Use 12–72 characters. New accounts have member access."
              : "For account recovery, contact your association administrator."}
          </small>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="btn">
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <p>
          {signup ? "Already registered?" : "New to the community?"}{" "}
          <Link to={signup ? "/admin/login" : "/signup"}>
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <ThemePicker />
      </section>
    </div>
  );
}
function MedalPage() {
  const { data, loading, error } = useData("/public/results");
  const [sport, setSport] = useState("all"),
    [year, setYear] = useState("all"),
    [tournament, setTournament] = useState("all");
  const rows = tally(
    data.filter(
      (r) =>
        (sport === "all" || r.sport === sport) &&
        (year === "all" || r.date.startsWith(year)) &&
        (tournament === "all" || r.tournament === tournament),
    ),
  );
  return (
    <>
      <Title
        eyebrow="CELEBRATING ACHIEVEMENT"
        title="Medal tally"
        description="Ranked by gold, then silver, then bronze medals."
      />
      <section className="panel">
        <div className="toolbar">
          {[
            ["sport", sport, setSport],
            ["date", year, setYear],
            ["tournament", tournament, setTournament],
          ].map(([key, value, setter]: any) => (
            <select
              aria-label={"Filter " + key}
              value={value}
              key={key}
              onChange={(e) => setter(e.target.value)}
            >
              <option value="all">
                All {key === "date" ? "years" : key + "s"}
              </option>
              {[
                ...new Set(
                  data
                    .map((r) => (key === "date" ? r.date?.slice(0, 4) : r[key]))
                    .filter(Boolean),
                ),
              ].map((v) => (
                <option key={v as string}>{v as string}</option>
              ))}
            </select>
          ))}
        </div>
        <State loading={loading} error={error} empty={!rows.length} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>District / sport</th>
                  <th>Gold</th>
                  <th>Silver</th>
                  <th>Bronze</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.name}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>{r.Gold}</td>
                    <td>{r.Silver}</td>
                    <td>{r.Bronze}</td>
                    <td>
                      <strong>{r.total}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
function Account({ settings = false }: { settings?: boolean }) {
  const { user, setUser, notify, logout } = useApp();
  const [tab, setTab] = useState(settings ? "appearance" : "account"),
    [busy, setBusy] = useState(false);
  const sessions = useData("/me/sessions");
  useEffect(() => setTab(settings ? "appearance" : "account"), [settings]);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      if (tab === "security") {
        await api.post("/me/password", data);
        notify("Password changed. Please sign in again.");
        setToken("");
        setUser(null);
      } else {
        const r = await api.patch("/me", data);
        setUser(r.data);
        notify("Profile updated.");
      }
    } catch (e) {
      notify(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function preference(k: string, v: any) {
    try {
      const r = await api.patch("/me", {
        preferences: { ...user.preferences, [k]: v },
      });
      setUser(r.data);
      notify("Setting saved.");
    } catch (e) {
      notify(errorMessage(e));
    }
  }
  return (
    <>
      <Title
        eyebrow="YOUR WORKSPACE"
        title={settings ? "Settings" : "My profile"}
        description="Make your account work for you."
      />
      <div className="settings-grid">
        <nav className="settings-nav">
          {[
            "account",
            "appearance",
            "notifications",
            "security",
            "accessibility",
          ].map((t) => (
            <button
              className={tab === t ? "active" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {human(t)}
              <ChevronRight size={16} />
            </button>
          ))}
        </nav>
        <section className="panel settings-panel">
          <h2>{human(tab)}</h2>
          {tab === "account" && (
            <>
              <div className="profile-summary">
                <span className="avatar large">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profile" />
                  ) : (
                    user.name.slice(0, 2)
                  )}
                </span>
                <div>
                  <h2>{user.name}</h2>
                  <span className="badge">{human(user.role)}</span>
                  <p>{user.email}</p>
                </div>
              </div>
              <form onSubmit={save}>
                <label>
                  Full name
                  <input
                    name="name"
                    required
                    minLength={2}
                    defaultValue={user.name}
                  />
                </label>
                <label>
                  Phone
                  <input name="phone" defaultValue={user.phone} />
                </label>
                <UploadField
                  value={user.avatarUrl}
                  label="Profile photograph"
                  onChange={async (v) => {
                    try {
                      const r = await api.patch("/me", { avatarUrl: v });
                      setUser(r.data);
                    } catch (e) {
                      notify(errorMessage(e));
                    }
                  }}
                />
                <p className="muted">
                  Joined {new Date(user.createdAt).toLocaleDateString()} · Email
                  changes require administrator assistance.
                </p>
                <button disabled={busy} className="btn">
                  Save profile
                </button>
              </form>
            </>
          )}
          {tab === "appearance" && (
            <>
              <p>Choose how the entire website looks on your device.</p>
              <ThemePicker />
              <div className="theme-preview">
                <div />
                <section>
                  <div />
                  <div />
                  <div />
                </section>
              </div>
              <p className="muted">
                Your choice is saved to your account. System follows your
                device’s appearance.
              </p>
            </>
          )}
          {tab === "notifications" && (
            <>
              {["eventUpdates", "newsUpdates", "systemNotifications"].map(
                (k) => (
                  <label className="toggle-row" key={k}>
                    <span>{human(k)}</span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={user.preferences?.[k] !== false}
                      onChange={(e) => preference(k, e.target.checked)}
                    />
                  </label>
                ),
              )}
              <p className="muted">
                Preferences apply to your in-app notification feed.
              </p>
            </>
          )}
          {tab === "accessibility" && (
            <>
              <label>
                Text size
                <select
                  value={user.preferences?.fontSize || "normal"}
                  onChange={(e) => preference("fontSize", e.target.value)}
                >
                  <option value="normal">Standard</option>
                  <option value="large">Large</option>
                </select>
              </label>
              {["reducedMotion", "highContrast"].map((k) => (
                <label className="toggle-row" key={k}>
                  {human(k)}
                  <input
                    type="checkbox"
                    role="switch"
                    checked={!!user.preferences?.[k]}
                    onChange={(e) => preference(k, e.target.checked)}
                  />
                </label>
              ))}
            </>
          )}
          {tab === "security" && (
            <>
              <form onSubmit={save}>
                <label>
                  Current password
                  <input
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <label>
                  New password
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={72}
                    required
                  />
                </label>
                <button disabled={busy} className="btn">
                  Change password
                </button>
              </form>
              <h3 className="spaced">Active sessions</h3>
              <State
                loading={sessions.loading}
                error={sessions.error}
                empty={!sessions.data.length}
              />
              {sessions.data.map((s) => (
                <div className="session" key={s._id}>
                  <Monitor size={19} />
                  <div>
                    {s.current ? "This session" : "Signed-in device"}
                    <small>
                      {s.userAgent?.slice(0, 100)} ·{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
              <button
                className="btn outline"
                onClick={async () => {
                  try {
                    await api.delete("/me/sessions");
                    setToken("");
                    setUser(null);
                  } catch (e) {
                    notify(errorMessage(e));
                  }
                }}
              >
                Log out of all devices
              </button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
function Notifications() {
  const { data, loading, error, reload } = useData("/notifications");
  const { notify } = useApp();
  async function mark() {
    try {
      await api.patch("/notifications");
      reload();
    } catch (e) {
      notify(errorMessage(e));
    }
  }
  return (
    <>
      <Title
        title="Notifications"
        action={
          <button className="btn outline" onClick={mark}>
            Mark all as read
          </button>
        }
      />
      <section className="panel">
        <State loading={loading} error={error} empty={!data.length} />
        {data.map((n) => (
          <div className="activity-row" key={n._id}>
            <Bell size={20} />
            <div>
              <p>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
            <span className="badge">{n.read ? "Read" : "New"}</span>
            <button
              className="icon-button"
              aria-label="Delete notification"
              onClick={async () => {
                try {
                  await api.delete("/notifications/" + n._id);
                  reload();
                } catch (e) {
                  notify(errorMessage(e));
                }
              }}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
function UsersPage() {
  const { data, loading, error, reload } = useData("/admin/users");
  const { user, notify } = useApp();
  return (
    <>
      <Title
        title="Users & roles"
        description="Members sign up themselves. Assign staff responsibilities here."
      />
      <section className="panel">
        <State loading={loading} error={error} empty={!data.length} />
        {data.map((u) => (
          <div className="activity-row" key={u.id}>
            <span className="avatar">{u.name.slice(0, 2)}</span>
            <div>
              <strong>{u.name}</strong>
              <p>{u.email}</p>
            </div>
            <select
              aria-label={"Role for " + u.name}
              disabled={u.id === user.id}
              value={u.role}
              onChange={async (e) => {
                try {
                  await api.patch("/admin/users/" + u.id, {
                    role: e.target.value,
                  });
                  reload();
                  notify("Role updated. Existing sessions revoked.");
                } catch (e) {
                  notify(errorMessage(e));
                }
              }}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {human(r)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </section>
    </>
  );
}
function MediaPage() {
  const { data, loading, error, reload } = useData("/admin/media");
  const [url, setUrl] = useState("");
  return (
    <>
      <Title
        title="Media library"
        description="Upload photographs and PDFs for use across your website."
      />
      <section className="panel">
        <UploadField
          label="Image or PDF"
          value={url}
          onChange={(v) => {
            setUrl(v);
            reload();
          }}
        />
      </section>
      <State loading={loading} error={error} empty={!data.length} />
      <div className="public-grid spaced">
        {data.map((m) => (
          <a
            className="content-card"
            href={m.url}
            target="_blank"
            rel="noreferrer"
            key={m._id}
          >
            {m.mimeType === "image" ? (
              <img className="card-image" src={m.url} alt={m.name} />
            ) : (
              <div className="card-icon">
                <Files size={30} />
              </div>
            )}
            <div className="card-body">
              <h3>{m.name}</h3>
              <small>{new Date(m.createdAt).toLocaleDateString()}</small>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
function GlobalSearch() {
  const loc = useLocation();
  const q = new URLSearchParams(loc.search).get("q") || "";
  const [rows, setRows] = useState<any[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    Promise.all(
      moduleNames.map(async (m) =>
        (await api.get("/admin/content/" + m)).data.map((r: any) => ({
          ...r,
          module: m,
        })),
      ),
    )
      .then((r) =>
        setRows(
          r
            .flat()
            .filter((r) =>
              JSON.stringify(r).toLowerCase().includes(q.toLowerCase()),
            ),
        ),
      )
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [q]);
  return (
    <>
      <Title title={"Search: " + q} />
      <State loading={loading} error={error} empty={!rows.length} />
      {rows.map((r) => (
        <Link
          className="quick-action panel"
          to={"/admin/" + r.module}
          key={r._id}
        >
          {r.title}
          <span>{labels[r.module as ModuleName]}</span>
        </Link>
      ))}
    </>
  );
}
function Contact() {
  const { notify } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <div className="public-content narrow">
      <Title
        title="Contact the association"
        description="Send an enquiry to the MOA administration team."
      />
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setBusy(true);
          try {
            await api.post("/contact", Object.fromEntries(new FormData(form)));
            form.reset();
            notify("Your enquiry has been received.");
          } catch (e) {
            notify(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {["name", "email"].map((k) => (
          <label key={k}>
            {human(k)}
            <input name={k} type={k === "email" ? "email" : "text"} required />
          </label>
        ))}
        <label>
          Message
          <textarea name="message" rows={6} minLength={10} required />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? "Sending…" : "Send enquiry"}
        </button>
      </form>
    </div>
  );
}
function Messages() {
  const { data, loading, error } = useData("/admin/messages");
  return (
    <>
      <Title title="Contact enquiries" />
      <State loading={loading} error={error} empty={!data.length} />
      {data.map((m) => (
        <section className="panel spaced" key={m._id}>
          <h3>{m.name}</h3>
          <a href={"mailto:" + m.email}>{m.email}</a>
          <p className="article-text">{m.message}</p>
          <small>{new Date(m.createdAt).toLocaleString()}</small>
        </section>
      ))}
    </>
  );
}
export default function App() {
  const { user } = useApp();
  const loc = useLocation();
  useEffect(() => {
    document.title =
      (loc.pathname.split("/").filter(Boolean).map(human).join(" · ") ||
        "Home") + " | Maharashtra Olympic Association";
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  const pub = (node: React.ReactNode) => <PublicLayout>{node}</PublicLayout>;
  const admin = (node: React.ReactNode) => (
    <Guard admin>
      <AdminLayout>{node}</AdminLayout>
    </Guard>
  );
  const account = (node: React.ReactNode) => (
    <Guard>
      {user?.role !== "user" ? (
        <AdminLayout>{node}</AdminLayout>
      ) : (
        <PublicLayout>
          <main className="public-content">{node}</main>
        </PublicLayout>
      )}
    </Guard>
  );
  return (
    <>
      <a className="skip-link" href="#page-content">
        Skip to content
      </a>
      <div id="page-content">
        <Routes>
          <Route path="/" element={pub(<Home />)} />
          <Route
            path="/about"
            element={pub(
              <div className="public-content narrow">
                <Title
                  eyebrow="ABOUT THE ASSOCIATION"
                  title="Together, for sport."
                />
                <p className="article-text">
                  The Maharashtra Olympic Association platform connects
                  athletes, officials and the sporting community with events,
                  results and association updates.
                </p>
                <div className="panel">
                  <h2>Excellence. Friendship. Respect.</h2>
                  <p>
                    Explore competitions, celebrate sporting achievement, and
                    find the people supporting sport across Maharashtra.
                  </p>
                  <Link className="btn" to="/committee">
                    Meet the committee
                  </Link>
                </div>
              </div>,
            )}
          />
          {moduleNames.map((m) => (
            <React.Fragment key={m}>
              <Route path={"/" + m} element={pub(<PublicList module={m} />)} />
              <Route
                path={"/" + m + "/:id"}
                element={pub(<Detail module={m} />)}
              />
              <Route
                path={"/admin/" + m}
                element={admin(<Manager module={m} />)}
              />
            </React.Fragment>
          ))}
          <Route
            path="/medals"
            element={pub(
              <div className="public-content">
                <MedalPage />
              </div>,
            )}
          />
          <Route path="/contact" element={pub(<Contact />)} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login signup />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={admin(<Dashboard />)} />
          <Route path="/admin/medals" element={admin(<MedalPage />)} />
          <Route path="/admin/media" element={admin(<MediaPage />)} />
          <Route path="/admin/users" element={admin(<UsersPage />)} />
          <Route path="/admin/messages" element={admin(<Messages />)} />
          <Route path="/admin/search" element={admin(<GlobalSearch />)} />
          <Route path="/profile" element={account(<Account />)} />
          <Route path="/settings" element={account(<Account settings />)} />
          <Route path="/notifications" element={account(<Notifications />)} />
          <Route path="/admin/profile" element={<Navigate to="/profile" />} />
          <Route path="/admin/settings" element={<Navigate to="/settings" />} />
          <Route
            path="*"
            element={pub(
              <div className="empty">
                <h1>Page not found</h1>
                <Link className="btn" to="/">
                  Return home
                </Link>
              </div>,
            )}
          />
        </Routes>
      </div>
    </>
  );
}
