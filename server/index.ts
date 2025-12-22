import path from "path";
import fs from "fs";
import crypto from "crypto";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

type AuthUser = {
  id: number;
  email: string;
  name: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const app = express();
const port = Number(process.env.PORT || 3001);
const isProduction = process.env.NODE_ENV === "production";

const allowlist = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowlist.includes(origin) || !isProduction) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const dataDir = path.resolve(process.cwd(), "server", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, "app.db"));

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    UNIQUE(user_id, role_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(role_id) REFERENCES roles(id)
  );
  CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY,
    phone TEXT,
    team TEXT,
    role TEXT,
    timezone TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    email_notifications INTEGER NOT NULL DEFAULT 1,
    single_session INTEGER NOT NULL DEFAULT 0,
    module_pipeline INTEGER NOT NULL DEFAULT 1,
    module_finance INTEGER NOT NULL DEFAULT 1,
    module_contacts INTEGER NOT NULL DEFAULT 1,
    module_calendar INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS pipeline_data (
    user_id INTEGER PRIMARY KEY,
    data_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS pipeline_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS finance_data (
    user_id INTEGER PRIMARY KEY,
    data_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    role_id INTEGER,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(role_id) REFERENCES roles(id)
  );
`);

const roleCount = db.prepare("SELECT COUNT(*) as count FROM roles").get() as {
  count: number;
};
if (roleCount.count === 0) {
  const insertRole = db.prepare("INSERT INTO roles (name) VALUES (?)");
  ["Administrador", "Gestor", "Analista", "Leitor"].forEach((role) =>
    insertRole.run(role)
  );
}

const moduleCount = db.prepare("SELECT COUNT(*) as count FROM modules").get() as {
  count: number;
};
if (moduleCount.count === 0) {
  const insertModule = db.prepare(
    "INSERT INTO modules (name, description, enabled) VALUES (?, ?, ?)"
  );
  [
    ["Dashboard executivo", "KPIs e indicadores de acesso.", 1],
    ["Gestao de usuarios", "Perfis, roles e permissao.", 1],
    ["Convites e onboarding", "Fluxos de entrada.", 1],
    ["Relatorios", "Exportacao e auditoria.", 1],
  ].forEach((module) => insertModule.run(...module));
}

const ensureUserPreferencesColumns = () => {
  const columns = db.prepare("PRAGMA table_info(user_preferences)").all() as {
    name: string;
  }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("module_pipeline")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN module_pipeline INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("module_finance")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN module_finance INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("module_contacts")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN module_contacts INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("module_calendar")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN module_calendar INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("language")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN language TEXT NOT NULL DEFAULT 'pt-BR'").run();
  }
  if (!names.has("notify_mentions")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN notify_mentions INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("notify_pipeline_updates")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN notify_pipeline_updates INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("notify_finance_alerts")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN notify_finance_alerts INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("notify_weekly_summary")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN notify_weekly_summary INTEGER NOT NULL DEFAULT 1").run();
  }
  if (!names.has("notify_product_updates")) {
    db.prepare("ALTER TABLE user_preferences ADD COLUMN notify_product_updates INTEGER NOT NULL DEFAULT 1").run();
  }
};

ensureUserPreferencesColumns();

const ensureUserProfileColumns = () => {
  const columns = db.prepare("PRAGMA table_info(user_profiles)").all() as {
    name: string;
  }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("phones")) {
    db.prepare("ALTER TABLE user_profiles ADD COLUMN phones TEXT").run();
  }
  if (!names.has("emails")) {
    db.prepare("ALTER TABLE user_profiles ADD COLUMN emails TEXT").run();
  }
  if (!names.has("addresses")) {
    db.prepare("ALTER TABLE user_profiles ADD COLUMN addresses TEXT").run();
  }
  if (!names.has("comments")) {
    db.prepare("ALTER TABLE user_profiles ADD COLUMN comments TEXT").run();
  }
};

ensureUserProfileColumns();

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const issueSession = (userId: number) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
  db.prepare(
    "INSERT INTO sessions (user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)"
  ).run(userId, tokenHash, now.toISOString(), expires.toISOString());
  return { token, expires };
};

const hasActiveSession = (userId: number) => {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM sessions WHERE user_id = ?")
    .get(userId) as { count: number };
  return row.count > 0;
};

const clearUserSessions = (userId: number) => {
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
};

const setSessionCookie = (res: Response, token: string, expires: Date) => {
  res.cookie("sc_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    expires,
  });
};

const clearSessionCookie = (res: Response) => {
  res.clearCookie("sc_session");
};

const getTokenFromRequest = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }
  return req.cookies.sc_session || null;
};

const getUserFromRequest = (req: Request): AuthUser | null => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }
  const tokenHash = hashToken(token);
  const session = db
    .prepare(
      "SELECT sessions.id, sessions.user_id, sessions.expires_at, users.email, users.name FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ?"
    )
    .get(tokenHash) as
    | { id: number; user_id: number; expires_at: string; email: string; name: string | null }
    | undefined;
  if (!session) {
    return null;
  }
  if (new Date(session.expires_at) < new Date()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(session.id);
    return null;
  }
  return { id: session.user_id, email: session.email, name: session.name };
};

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  req.user = user;
  next();
};

app.post("/api/auth/signup", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : null;
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ error: "email_and_password_required" });
    return;
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email) as { id: number } | undefined;
  if (existing) {
    res.status(409).json({ error: "email_in_use" });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
    )
    .run(name, email, passwordHash, now);
  const userId = Number(result.lastInsertRowid);

  const defaultRole = db
    .prepare("SELECT id FROM roles WHERE name = ?")
    .get("Administrador") as { id: number } | undefined;
  if (defaultRole) {
    db.prepare("INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)").run(
      userId,
      defaultRole.id
    );
  }

  const session = issueSession(userId);
  setSessionCookie(res, session.token, session.expires);
  res.json({ user: { id: userId, email, name }, token: session.token });
});

app.post("/api/auth/login", (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ error: "email_and_password_required" });
    return;
  }

  const user = db
    .prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
    .get(email) as
    | { id: number; email: string; name: string | null; password_hash: string }
    | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }

  const prefs = db
    .prepare("SELECT single_session FROM user_preferences WHERE user_id = ?")
    .get(user.id) as { single_session?: number } | undefined;
  const singleSessionEnabled = Boolean(prefs?.single_session);
  if (singleSessionEnabled && hasActiveSession(user.id)) {
    clearUserSessions(user.id);
    res.status(409).json({ error: "session_conflict" });
    return;
  }

  const session = issueSession(user.id);
  setSessionCookie(res, session.token, session.expires);
  res.json({ user: { id: user.id, email: user.email, name: user.name }, token: session.token });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getTokenFromRequest(req);
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.patch("/api/auth/me", requireAuth, (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : null;
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (email) {
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(email, req.user?.id) as { id: number } | undefined;
    if (existing) {
      res.status(409).json({ error: "email_in_use" });
      return;
    }
  }

  db.prepare("UPDATE users SET name = ?, email = COALESCE(?, email) WHERE id = ?").run(
    name,
    email || null,
    req.user?.id
  );

  const updated = db
    .prepare("SELECT id, email, name FROM users WHERE id = ?")
    .get(req.user?.id) as AuthUser;
  res.json({ user: updated });
});

app.get("/api/profile", requireAuth, (req, res) => {
  const userId = req.user?.id;
  const user = db
    .prepare("SELECT id, email, name FROM users WHERE id = ?")
    .get(userId) as AuthUser;

  const profile = db
    .prepare(
      "SELECT phone, team, role, timezone, phones, emails, addresses, comments FROM user_profiles WHERE user_id = ?"
    )
    .get(userId) as
    | {
        phone: string | null;
        team: string | null;
        role: string | null;
        timezone: string | null;
        phones: string | null;
        emails: string | null;
        addresses: string | null;
        comments: string | null;
      }
    | undefined;

  const preferences = db
    .prepare(
      "SELECT email_notifications, single_session, module_pipeline, module_finance, module_contacts, module_calendar, language, notify_mentions, notify_pipeline_updates, notify_finance_alerts, notify_weekly_summary, notify_product_updates FROM user_preferences WHERE user_id = ?"
    )
    .get(userId) as
    | {
        email_notifications: number;
        single_session: number;
        module_pipeline: number;
        module_finance: number;
        module_contacts: number;
        module_calendar: number;
        language: string | null;
        notify_mentions: number;
        notify_pipeline_updates: number;
        notify_finance_alerts: number;
        notify_weekly_summary: number;
        notify_product_updates: number;
      }
    | undefined;

  const parseStringList = (value: string | null | undefined) => {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const phones = profile?.phones ? parseStringList(profile.phones) : [];
  const emails = profile?.emails ? parseStringList(profile.emails) : [];
  const addresses = profile?.addresses ? parseStringList(profile.addresses) : [];
  const comments = profile?.comments ? parseStringList(profile.comments) : [];

  res.json({
    user,
    profile: {
      phone: profile?.phone || "",
      team: profile?.team || "",
      role: profile?.role || "",
      timezone: profile?.timezone || "",
      phones: phones.length ? phones : profile?.phone ? [profile.phone] : [],
      emails,
      addresses,
      comments,
    },
    preferences: {
      emailNotifications: preferences ? Boolean(preferences.email_notifications) : true,
      singleSession: preferences ? Boolean(preferences.single_session) : false,
      modulePipeline: preferences ? Boolean(preferences.module_pipeline) : true,
      moduleFinance: preferences ? Boolean(preferences.module_finance) : true,
      moduleContacts: preferences ? Boolean(preferences.module_contacts) : true,
      moduleCalendar: preferences ? Boolean(preferences.module_calendar) : true,
      language: preferences?.language || "pt-BR",
      notifyMentions: preferences ? Boolean(preferences.notify_mentions) : true,
      notifyPipelineUpdates: preferences ? Boolean(preferences.notify_pipeline_updates) : true,
      notifyFinanceAlerts: preferences ? Boolean(preferences.notify_finance_alerts) : true,
      notifyWeeklySummary: preferences ? Boolean(preferences.notify_weekly_summary) : true,
      notifyProductUpdates: preferences ? Boolean(preferences.notify_product_updates) : true,
    },
  });
});

app.put("/api/profile", requireAuth, (req, res) => {
  const userId = req.user?.id;
  const name = typeof req.body.name === "string" ? req.body.name.trim() : null;
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (!email) {
    res.status(400).json({ error: "email_required" });
    return;
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
    .get(email, userId) as { id: number } | undefined;
  if (existing) {
    res.status(409).json({ error: "email_in_use" });
    return;
  }

  db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(
    name,
    email,
    userId
  );

  const normalizeStringList = (value: unknown) => {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const phones = normalizeStringList(req.body.phones);
  const emails = normalizeStringList(req.body.emails);
  const addresses = normalizeStringList(req.body.addresses);
  const comments = normalizeStringList(req.body.comments);
  const phone =
    typeof req.body.phone === "string" ? req.body.phone.trim() : phones[0] || "";
  const team = typeof req.body.team === "string" ? req.body.team.trim() : "";
  const role = typeof req.body.role === "string" ? req.body.role.trim() : "";
  const timezone =
    typeof req.body.timezone === "string" ? req.body.timezone.trim() : "";
  const emailNotifications = Boolean(req.body.preferences?.emailNotifications);
  const singleSession = Boolean(req.body.preferences?.singleSession);
  const modulePipeline = Boolean(req.body.preferences?.modulePipeline);
  const moduleFinance = Boolean(req.body.preferences?.moduleFinance);
  const moduleContacts = Boolean(req.body.preferences?.moduleContacts);
  const moduleCalendar = Boolean(req.body.preferences?.moduleCalendar);
  const language =
    typeof req.body.preferences?.language === "string"
      ? req.body.preferences.language.trim()
      : "pt-BR";
  const notifyMentions = Boolean(req.body.preferences?.notifyMentions);
  const notifyPipelineUpdates = Boolean(req.body.preferences?.notifyPipelineUpdates);
  const notifyFinanceAlerts = Boolean(req.body.preferences?.notifyFinanceAlerts);
  const notifyWeeklySummary = Boolean(req.body.preferences?.notifyWeeklySummary);
  const notifyProductUpdates = Boolean(req.body.preferences?.notifyProductUpdates);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO user_profiles (user_id, phone, team, role, timezone, phones, emails, addresses, comments, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       phone = excluded.phone,
       team = excluded.team,
       role = excluded.role,
       timezone = excluded.timezone,
       phones = excluded.phones,
       emails = excluded.emails,
       addresses = excluded.addresses,
       comments = excluded.comments,
       updated_at = excluded.updated_at`
  ).run(
    userId,
    phone,
    team,
    role,
    timezone,
    JSON.stringify(phones),
    JSON.stringify(emails),
    JSON.stringify(addresses),
    JSON.stringify(comments),
    now,
    now
  );

  db.prepare(
    `INSERT INTO user_preferences (
      user_id,
      email_notifications,
      single_session,
      module_pipeline,
      module_finance,
      module_contacts,
      module_calendar,
      language,
      notify_mentions,
      notify_pipeline_updates,
      notify_finance_alerts,
      notify_weekly_summary,
      notify_product_updates,
      created_at,
      updated_at
    )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       email_notifications = excluded.email_notifications,
       single_session = excluded.single_session,
       module_pipeline = excluded.module_pipeline,
       module_finance = excluded.module_finance,
       module_contacts = excluded.module_contacts,
       module_calendar = excluded.module_calendar,
       language = excluded.language,
       notify_mentions = excluded.notify_mentions,
       notify_pipeline_updates = excluded.notify_pipeline_updates,
       notify_finance_alerts = excluded.notify_finance_alerts,
       notify_weekly_summary = excluded.notify_weekly_summary,
       notify_product_updates = excluded.notify_product_updates,
       updated_at = excluded.updated_at`
  ).run(
    userId,
    emailNotifications ? 1 : 0,
    singleSession ? 1 : 0,
    modulePipeline ? 1 : 0,
    moduleFinance ? 1 : 0,
    moduleContacts ? 1 : 0,
    moduleCalendar ? 1 : 0,
    language || "pt-BR",
    notifyMentions ? 1 : 0,
    notifyPipelineUpdates ? 1 : 0,
    notifyFinanceAlerts ? 1 : 0,
    notifyWeeklySummary ? 1 : 0,
    notifyProductUpdates ? 1 : 0,
    now,
    now
  );

  const updated = db
    .prepare("SELECT id, email, name FROM users WHERE id = ?")
    .get(userId) as AuthUser;

  res.json({
    user: updated,
    profile: { phone, team, role, timezone, phones, emails, addresses, comments },
    preferences: {
      emailNotifications,
      singleSession,
      modulePipeline,
      moduleFinance,
      moduleContacts,
      moduleCalendar,
      language: language || "pt-BR",
      notifyMentions,
      notifyPipelineUpdates,
      notifyFinanceAlerts,
      notifyWeeklySummary,
      notifyProductUpdates,
    },
  });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  const user = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email) as { id: number } | undefined;

  if (!user) {
    res.json({ ok: true });
    return;
  }

  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  db.prepare(
    "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
  ).run(user.id, tokenHash, expires);

  res.json({ ok: true, resetToken: token });
});

app.post("/api/auth/reset-password", (req, res) => {
  const token = typeof req.body.token === "string" ? req.body.token.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!token || !password) {
    res.status(400).json({ error: "token_and_password_required" });
    return;
  }

  const tokenHash = hashToken(token);
  const reset = db
    .prepare(
      "SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?"
    )
    .get(tokenHash) as
    | { id: number; user_id: number; expires_at: string; used_at: string | null }
    | undefined;

  if (!reset || reset.used_at || new Date(reset.expires_at) < new Date()) {
    res.status(400).json({ error: "invalid_token" });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    reset.user_id
  );
  db.prepare("UPDATE password_resets SET used_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    reset.id
  );
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(reset.user_id);

  res.json({ ok: true });
});

app.get("/api/access/roles", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT roles.id, roles.name, COUNT(user_roles.user_id) as members
       FROM roles
       LEFT JOIN user_roles ON roles.id = user_roles.role_id
       GROUP BY roles.id
       ORDER BY roles.id`
    )
    .all() as { id: number; name: string; members: number }[];
  res.json({ roles: rows });
});

app.post("/api/access/roles", requireAuth, (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    res.status(400).json({ error: "name_required" });
    return;
  }
  const result = db.prepare("INSERT INTO roles (name) VALUES (?)").run(name);
  res.json({ id: Number(result.lastInsertRowid), name, members: 0 });
});

app.patch("/api/access/roles/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!id || !name) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  db.prepare("UPDATE roles SET name = ? WHERE id = ?").run(name, id);
  res.json({ id, name });
});

app.delete("/api/access/roles/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  db.prepare("DELETE FROM user_roles WHERE role_id = ?").run(id);
  db.prepare("DELETE FROM roles WHERE id = ?").run(id);
  res.json({ ok: true });
});

app.get("/api/access/modules", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT id, name, description, enabled FROM modules ORDER BY id")
    .all() as { id: number; name: string; description: string; enabled: number }[];
  res.json({
    modules: rows.map((module) => ({
      ...module,
      enabled: Boolean(module.enabled),
    })),
  });
});

app.patch("/api/access/modules/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const enabled = Boolean(req.body.enabled);
  if (!id) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  db.prepare("UPDATE modules SET enabled = ? WHERE id = ?").run(enabled ? 1 : 0, id);
  const updated = db
    .prepare("SELECT id, name, description, enabled FROM modules WHERE id = ?")
    .get(id) as { id: number; name: string; description: string; enabled: number };
  res.json({ module: { ...updated, enabled: Boolean(updated.enabled) } });
});

app.get("/api/access/users", requireAuth, (_req, res) => {
  const rows = db
    .prepare("SELECT id, name, email FROM users ORDER BY id")
    .all() as { id: number; name: string | null; email: string }[];
  res.json({ users: rows });
});

app.get("/api/pipeline/board", requireAuth, (req, res) => {
  const row = db
    .prepare("SELECT data_json FROM pipeline_state WHERE id = 1")
    .get() as { data_json: string } | undefined;
  if (!row) {
    res.json({ pipeline: null });
    return;
  }
  try {
    res.json({ pipeline: JSON.parse(row.data_json) });
  } catch {
    res.json({ pipeline: null });
  }
});

app.put("/api/pipeline/board", requireAuth, (req, res) => {
  const payload = req.body?.data ?? req.body;
  const pipeline = payload?.columns ? payload : { columns: payload };
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO pipeline_state (id, data_json, updated_at)
     VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       data_json = excluded.data_json,
       updated_at = excluded.updated_at`
  ).run(JSON.stringify(pipeline ?? []), now);
  res.json({ ok: true });
});

app.get("/api/pipeline/data", requireAuth, (req, res) => {
  const row = db
    .prepare("SELECT data_json FROM pipeline_data WHERE user_id = ?")
    .get(req.user?.id) as { data_json: string } | undefined;
  if (!row) {
    res.json({ data: null });
    return;
  }
  try {
    res.json({ data: JSON.parse(row.data_json) });
  } catch {
    res.json({ data: null });
  }
});

app.put("/api/pipeline/data", requireAuth, (req, res) => {
  const data = req.body?.data ?? req.body;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO pipeline_data (user_id, data_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       data_json = excluded.data_json,
       updated_at = excluded.updated_at`
  ).run(req.user?.id, JSON.stringify(data ?? {}), now);
  res.json({ ok: true });
});

app.get("/api/finance/data", requireAuth, (req, res) => {
  const row = db
    .prepare("SELECT data_json FROM finance_data WHERE user_id = ?")
    .get(req.user?.id) as { data_json: string } | undefined;
  if (!row) {
    res.json({ data: null });
    return;
  }
  try {
    res.json({ data: JSON.parse(row.data_json) });
  } catch {
    res.json({ data: null });
  }
});

app.put("/api/finance/data", requireAuth, (req, res) => {
  const data = req.body?.data ?? req.body;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO finance_data (user_id, data_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       data_json = excluded.data_json,
       updated_at = excluded.updated_at`
  ).run(req.user?.id, JSON.stringify(data ?? {}), now);
  res.json({ ok: true });
});

app.get("/api/access/invites", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT invites.id, invites.email, invites.status, invites.created_at,
        roles.id as role_id, roles.name as role_name
       FROM invites
       LEFT JOIN roles ON roles.id = invites.role_id
       ORDER BY invites.id DESC`
    )
    .all() as {
    id: number;
    email: string;
    status: string;
    created_at: string;
    role_id: number | null;
    role_name: string | null;
  }[];
  res.json({ invites: rows });
});

app.post("/api/access/invites", requireAuth, (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const roleId = Number(req.body.roleId) || null;
  if (!email) {
    res.status(400).json({ error: "email_required" });
    return;
  }
  const createdAt = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO invites (email, role_id, status, created_at) VALUES (?, ?, ?, ?)")
    .run(email, roleId, "Pendente", createdAt);
  res.json({
    invite: {
      id: Number(result.lastInsertRowid),
      email,
      roleId,
      status: "Pendente",
      createdAt,
    },
  });
});

app.patch("/api/access/invites/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const status = typeof req.body.status === "string" ? req.body.status.trim() : "";
  if (!id || !status) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  db.prepare("UPDATE invites SET status = ? WHERE id = ?").run(status, id);
  res.json({ ok: true });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
