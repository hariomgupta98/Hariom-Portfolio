const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);
const sessions = new Map();
const attempts = new Map();
const ttl = 4 * 60 * 60 * 1000;
const equal = (a, b) =>
	typeof a === "string" &&
	typeof b === "string" &&
	Buffer.byteLength(a) === Buffer.byteLength(b) &&
	crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const timer = setInterval(() => {
	const now = Date.now();
	for (const [key, value] of sessions)
		if (value.expires <= now) sessions.delete(key);
	for (const [key, value] of attempts)
		if (value.expires <= now) attempts.delete(key);
}, 60000);
timer.unref();
function middleware(req, res, next) {
	const cookie = (req.headers.cookie || "")
		.split(";")
		.map((s) => s.trim())
		.find((s) => s.startsWith("portfolio_admin="));
	req.sessionId = cookie ? cookie.slice("portfolio_admin=".length) : "";
	const session = sessions.get(req.sessionId);
	req.adminSession = session && session.expires > Date.now() ? session : null;
	res.set("Cache-Control", "private, no-store");
	res.locals.isAdmin = !!req.adminSession?.admin;
	res.locals.csrf = req.adminSession?.csrf || "";
	next();
}
function create(req, res, admin) {
	if (req.sessionId) sessions.delete(req.sessionId);
	const id = crypto.randomBytes(32).toString("hex");
	const session = {
		admin,
		csrf: crypto.randomBytes(32).toString("hex"),
		expires: Date.now() + ttl,
	};
	sessions.set(id, session);
	req.adminSession = session;
	req.sessionId = id;
	res.locals.csrf = session.csrf;
	res.locals.isAdmin = admin;
	res.cookie("portfolio_admin", id, {
		httpOnly: true,
		sameSite: "strict",
		secure: process.env.NODE_ENV === "production",
		maxAge: ttl,
		path: "/",
	});
}
function required(req, res, next) {
	if (!req.adminSession?.admin) return res.redirect(303, "/admin/login");
	res.set("Cache-Control", "no-store");
	next();
}
function csrf(req, res, next) {
	if (!req.adminSession || !equal(req.body._csrf, req.adminSession.csrf))
		return res
			.status(403)
			.send("Invalid form token. Reload the page and try again.");
	next();
}
async function login(req, res, next) {
	try {
		const key = req.socket.remoteAddress;
		let entry = attempts.get(key);
		if (!entry || entry.expires <= Date.now()) {
			entry = { count: 0, expires: Date.now() + 15 * 60 * 1000 };
			attempts.set(key, entry);
		}
		if (entry.count >= 10)
			return res
				.status(429)
				.send("Too many attempts. Try again in 15 minutes.");
		entry.count++;
		const encoded = process.env.ADMIN_PASSWORD_HASH || "";
		const [salt, stored] = encoded.split(":");
		if (
			!/^[a-f0-9]{32}$/.test(salt || "") ||
			!/^[a-f0-9]{128}$/.test(stored || "")
		)
			return res
				.status(503)
				.render("admin/login", {
					title: "Admin setup",
					error: "Run npm run setup-admin in your project terminal first.",
				});
		const password =
			typeof req.body.password === "string" ? req.body.password : "";
		const hash = (await scrypt(password.slice(0, 1024), salt, 64)).toString(
			"hex",
		);
		if (
			!equal(req.body.username, process.env.ADMIN_USERNAME || "admin") ||
			!equal(hash, stored)
		)
			return res
				.status(401)
				.render("admin/login", {
					title: "Admin login",
					error: "Incorrect username or password.",
				});
		attempts.delete(key);
		create(req, res, true);
		res.redirect(303, "/admin/projects");
	} catch (error) {
		next(error);
	}
}
function logout(req, res) {
	sessions.delete(req.sessionId);
	res.clearCookie("portfolio_admin", { path: "/" });
	res.redirect(303, "/");
}
module.exports = { middleware, create, required, csrf, login, logout };
