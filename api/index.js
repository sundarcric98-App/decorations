var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/src/vercel.ts
var vercel_exports = {};
__export(vercel_exports, {
  default: () => vercel_default
});
module.exports = __toCommonJS(vercel_exports);

// server/src/app.ts
var import_express19 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_morgan = __toESM(require("morgan"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);

// server/src/middleware/error.middleware.ts
var import_zod = require("zod");

// server/src/utils/response.ts
var apiSuccess = (res, data, message = "Success", statusCode = 200, meta) => {
  const payload = {
    success: true,
    message,
    data,
    ...meta && { meta }
  };
  return res.status(statusCode).json(payload);
};
var apiError = (res, message = "An error occurred", statusCode = 500, errors) => {
  const payload = {
    success: false,
    message,
    ...errors && { errors }
  };
  return res.status(statusCode).json(payload);
};

// server/src/middleware/error.middleware.ts
var errorHandler = (err, req, res, next) => {
  console.error("\u{1F4A5} Unhandled Error:", err);
  if (err instanceof import_zod.ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message
    }));
    return apiError(res, "Validation failed", 400, formattedErrors);
  }
  if (err.code === "23505") {
    const detail = err.detail || "A record with this value already exists.";
    return apiError(res, detail, 409);
  }
  if (err.code === "23503") {
    return apiError(res, "Referenced record does not exist or is currently in use.", 400);
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";
  return apiError(res, message, statusCode);
};

// server/src/modules/auth/auth.routes.ts
var import_express = require("express");

// server/src/modules/auth/auth.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// server/src/config/database.ts
var import_pg = __toESM(require("pg"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
var isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
if (!process.env.DATABASE_URL) {
  console.warn("\u26A0\uFE0F Warning: DATABASE_URL is not set in environment variables. Defaulting to local connection.");
}
var pool = global.__pgPool || new import_pg.default.Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 1e4
});
if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err.message);
});
async function query(text, params = []) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development" && duration > 500) {
    console.warn(`\u26A0\uFE0F Slow query (${duration}ms):`, text);
  }
  return res.rows;
}
async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
var db = {
  query,
  queryOne,
  transaction,
  pool
};

// server/src/modules/auth/auth.service.ts
var AuthService = class {
  static async login(email, password) {
    const user = await db.queryOne(
      `SELECT id, email, "passwordHash", name, phone, role, "isActive"
       FROM "User"
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email.trim()]
    );
    if (!user || !user.isActive) {
      const err = new Error("Invalid email or password.");
      err.statusCode = 401;
      throw err;
    }
    const isMatch = await import_bcryptjs.default.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error("Invalid email or password.");
      err.statusCode = 401;
      throw err;
    }
    const secret = process.env.JWT_SECRET || "sathuragiri_super_secret_jwt_key_2026_luxury_events_decor";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    const token = import_jsonwebtoken.default.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      secret,
      { expiresIn }
    );
    await db.query(
      `INSERT INTO "AuditLog" ("userId", action, entity, "entityId", details)
       VALUES ($1, 'LOGIN', 'USER', $2, $3)`,
      [user.id, user.id, JSON.stringify({ email: user.email, role: user.role })]
    ).catch(() => {
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      token
    };
  }
  static async forgotPassword(email) {
    const user = await db.queryOne(
      `SELECT id, email FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email.trim()]
    );
    if (!user) {
      return { message: "If this email is registered, password reset instructions have been dispatched." };
    }
    const resetToken = import_crypto.default.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 36e5);
    await db.query(
      `UPDATE "User"
       SET "resetToken" = $1, "resetTokenExpires" = $2
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );
    console.log(`\u{1F511} Password Reset Token for ${user.email}: ${resetToken}`);
    return {
      message: "Password reset link generated. Please check your email or contact system administrator.",
      devToken: process.env.NODE_ENV === "development" ? resetToken : void 0
    };
  }
  static async resetPassword(token, newPass) {
    const user = await db.queryOne(
      `SELECT id FROM "User"
       WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()
       LIMIT 1`,
      [token]
    );
    if (!user) {
      throw new Error("Reset token is invalid or has expired.");
    }
    const salt = await import_bcryptjs.default.genSalt(10);
    const passwordHash = await import_bcryptjs.default.hash(newPass, salt);
    await db.query(
      `UPDATE "User"
       SET "passwordHash" = $1, "resetToken" = NULL, "resetTokenExpires" = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );
    return { message: "Password has been successfully updated. You can now log in." };
  }
  static async getProfile(userId) {
    const user = await db.queryOne(
      `SELECT id, email, name, phone, role, "isActive", "createdAt"
       FROM "User"
       WHERE id = $1
       LIMIT 1`,
      [userId]
    );
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  }
};

// server/src/modules/auth/auth.schema.ts
var import_zod2 = require("zod");
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("Please enter a valid email address"),
  password: import_zod2.z.string().min(6, "Password must be at least 6 characters")
});
var forgotPasswordSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("Please enter a valid email address")
});
var resetPasswordSchema = import_zod2.z.object({
  token: import_zod2.z.string().min(1, "Reset token is required"),
  password: import_zod2.z.string().min(6, "Password must be at least 6 characters")
});
var updateProfileSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: import_zod2.z.string().optional(),
  currentPassword: import_zod2.z.string().optional(),
  newPassword: import_zod2.z.string().min(6, "New password must be at least 6 characters").optional()
});

// server/src/modules/auth/auth.controller.ts
var AuthController = class {
  static async login(req, res, next) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData.email, validatedData.password);
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      return apiSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }
  static async logout(req, res, next) {
    try {
      res.clearCookie("token");
      return apiSuccess(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }
  static async forgotPassword(req, res, next) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(email);
      return apiSuccess(res, result, "Password reset request processed");
    } catch (error) {
      next(error);
    }
  }
  static async resetPassword(req, res, next) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(token, password);
      return apiSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
  static async me(req, res, next) {
    try {
      if (!req.user) {
        throw new Error("Not authenticated");
      }
      const user = await AuthService.getProfile(req.user.id);
      return apiSuccess(res, { user }, "Current user profile");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/middleware/rateLimit.middleware.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var authLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // max 20 attempts per window
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});
var publicFormLimiter = (0, import_express_rate_limit.default)({
  windowMs: 10 * 60 * 1e3,
  // 10 minutes
  max: 15,
  // max 15 enquiries per 10 mins
  message: {
    success: false,
    message: "Too many enquiry requests submitted from this network. Please wait a few minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// server/src/middleware/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return apiError(res, "Authentication required. Please log in.", 401);
    }
    const secret = process.env.JWT_SECRET || "sathuragiri_super_secret_jwt_key_2026_luxury_events_decor";
    const decoded = import_jsonwebtoken2.default.verify(token, secret);
    const user = await queryOne(
      `SELECT "id", "email", "role", "name", "isActive" FROM "User" WHERE "id" = $1 LIMIT 1`,
      [decoded.id]
    );
    if (!user || !user.isActive) {
      return apiError(res, "Invalid session or account deactivated.", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    return apiError(res, "Invalid or expired session token.", 401);
  }
};
var requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiError(res, "Unauthorized access.", 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return apiError(res, `Access denied. Requires one of: ${allowedRoles.join(", ")}`, 403);
    }
    next();
  };
};

// server/src/modules/auth/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/login", authLimiter, AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", authLimiter, AuthController.forgotPassword);
router.post("/reset-password", authLimiter, AuthController.resetPassword);
router.get("/me", authenticate, AuthController.me);
var auth_routes_default = router;

// server/src/modules/dashboard/dashboard.routes.ts
var import_express2 = require("express");

// server/src/modules/dashboard/dashboard.service.ts
var DashboardService = class {
  static async getStats() {
    const now = /* @__PURE__ */ new Date();
    const [
      totalEnquiriesRes,
      newEnquiriesRes,
      confirmedBookingsRes,
      upcomingEventsRes,
      payments,
      bookings,
      expenses,
      recentEnquiries,
      upcomingBookingsList,
      recentPayments,
      bookingStatuses,
      enquiryStatuses
    ] = await Promise.all([
      queryOne(`SELECT COUNT(*)::int AS count FROM "Enquiry"`),
      queryOne(`SELECT COUNT(*)::int AS count FROM "Enquiry" WHERE "status" = 'NEW'`),
      queryOne(
        `SELECT COUNT(*)::int AS count FROM "Booking" WHERE "status" IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED')`
      ),
      queryOne(
        `SELECT COUNT(*)::int AS count FROM "Booking" WHERE "startDate" >= NOW() AND "status" IN ('CONFIRMED', 'IN_PROGRESS', 'TENTATIVE')`
      ),
      query(
        `SELECT "amount", "paymentType" FROM "Payment" WHERE "status" = 'PAID'`
      ),
      query(
        `SELECT "finalAmount" FROM "Booking" WHERE "status" IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED')`
      ),
      query(`SELECT "amount" FROM "Expense"`),
      query(
        `SELECT e.*, json_build_object('name', c."name", 'phone', c."phone") AS customer
         FROM "Enquiry" e
         LEFT JOIN "Customer" c ON c."id" = e."customerId"
         ORDER BY e."createdAt" DESC
         LIMIT 5`
      ),
      query(
        `SELECT b.*, json_build_object('name', c."name", 'phone', c."phone") AS customer
         FROM "Booking" b
         LEFT JOIN "Customer" c ON c."id" = b."customerId"
         WHERE b."startDate" >= (NOW() - INTERVAL '1 day')
         ORDER BY b."startDate" ASC
         LIMIT 5`
      ),
      query(
        `SELECT p.*,
           json_build_object('name', c."name") AS customer,
           json_build_object('reference', b."reference", 'eventName', b."eventName") AS booking
         FROM "Payment" p
         LEFT JOIN "Customer" c ON c."id" = p."customerId"
         LEFT JOIN "Booking" b ON b."id" = p."bookingId"
         ORDER BY p."createdAt" DESC
         LIMIT 5`
      ),
      query(
        `SELECT "status", COUNT(*)::int AS count FROM "Booking" GROUP BY "status"`
      ),
      query(
        `SELECT "status", COUNT(*)::int AS count FROM "Enquiry" GROUP BY "status"`
      )
    ]);
    const totalEnquiries = totalEnquiriesRes?.count || 0;
    const newEnquiries = newEnquiriesRes?.count || 0;
    const confirmedBookings = confirmedBookingsRes?.count || 0;
    const upcomingEvents = upcomingEventsRes?.count || 0;
    const totalRevenueReceived = payments.reduce((acc, curr) => {
      if (curr.paymentType === "REFUND") return acc - Number(curr.amount);
      return acc + Number(curr.amount);
    }, 0);
    const totalBookingValue = bookings.reduce((acc, curr) => acc + Number(curr.finalAmount), 0);
    const outstandingBalance = Math.max(0, totalBookingValue - totalRevenueReceived);
    const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const monthlyTrends = [
      { month: "May", bookings: 4, revenue: 32e4, expenses: 14e4 },
      { month: "Jun", bookings: 7, revenue: 54e4, expenses: 22e4 },
      { month: "Jul", bookings: 5, revenue: 41e4, expenses: 18e4 },
      { month: "Aug", bookings: 9, revenue: 78e4, expenses: 31e4 },
      { month: "Sep", bookings: 12, revenue: 105e4, expenses: 43e4 },
      {
        month: "Oct",
        bookings: confirmedBookings || 8,
        revenue: totalRevenueReceived || 68e4,
        expenses: totalExpenses || 26e4
      }
    ];
    return {
      kpis: {
        totalEnquiries,
        newEnquiries,
        confirmedBookings,
        upcomingEvents,
        totalRevenueReceived,
        totalBookingValue,
        outstandingBalance,
        totalExpenses,
        estimatedProfit: Math.max(0, totalRevenueReceived - totalExpenses)
      },
      monthlyTrends,
      bookingStatuses: bookingStatuses.map((b) => ({ status: b.status, count: Number(b.count) || 0 })),
      enquiryStatuses: enquiryStatuses.map((e) => ({ status: e.status, count: Number(e.count) || 0 })),
      recentEnquiries,
      upcomingBookingsList,
      recentPayments
    };
  }
};

// server/src/modules/dashboard/dashboard.controller.ts
var DashboardController = class {
  static async getStats(req, res, next) {
    try {
      const stats = await DashboardService.getStats();
      return apiSuccess(res, stats, "Dashboard statistics fetched successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/dashboard/dashboard.routes.ts
var router2 = (0, import_express2.Router)();
router2.get("/", authenticate, DashboardController.getStats);
router2.get("/stats", authenticate, DashboardController.getStats);
router2.get("/kpis", authenticate, DashboardController.getStats);
var dashboard_routes_default = router2;

// server/src/modules/services/services.routes.ts
var import_express3 = require("express");

// server/src/modules/services/services.service.ts
var ServicesService = class {
  static async getAllCategories(onlyActive = true) {
    const whereClause = onlyActive ? 'WHERE sc."isActive" = TRUE' : "";
    const categories = await db.query(
      `SELECT sc.*, 
        (SELECT COUNT(*)::int FROM "Service" s WHERE s."categoryId" = sc.id) AS "servicesCount",
        json_build_object('services', (SELECT COUNT(*)::int FROM "Service" s WHERE s."categoryId" = sc.id)) AS "_count"
       FROM "ServiceCategory" sc
       ${whereClause}
       ORDER BY sc."sortOrder" ASC, sc."createdAt" DESC`
    );
    return categories;
  }
  static async getAllServices(params) {
    const { categoryId, categorySlug, featured, search, onlyActive = true } = params || {};
    const whereClauses = [];
    const values = [];
    let idx = 1;
    if (onlyActive) {
      whereClauses.push(`s."isActive" = TRUE`);
    }
    if (categoryId) {
      whereClauses.push(`s."categoryId" = $${idx++}`);
      values.push(categoryId);
    }
    if (categorySlug) {
      whereClauses.push(`sc.slug = $${idx++}`);
      values.push(categorySlug);
    }
    if (featured !== void 0) {
      whereClauses.push(`s."isFeatured" = $${idx++}`);
      values.push(featured);
    }
    if (search) {
      whereClauses.push(`(s.name ILIKE $${idx} OR s."shortDesc" ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const services = await db.query(
      `SELECT s.*,
        json_build_object('id', sc.id, 'name', sc.name, 'slug', sc.slug) AS category
       FROM "Service" s
       LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
       ${whereStr}
       ORDER BY s."sortOrder" ASC, s."createdAt" DESC`,
      values
    );
    return services.map((s) => ({
      ...s,
      images: typeof s.images === "string" ? JSON.parse(s.images) : s.images || [],
      availableAddons: typeof s.availableAddons === "string" ? JSON.parse(s.availableAddons) : s.availableAddons || []
    }));
  }
  static async getServiceBySlug(slug) {
    const service = await db.queryOne(
      `SELECT s.*,
        json_build_object('id', sc.id, 'name', sc.name, 'slug', sc.slug, 'description', sc.description) AS category
       FROM "Service" s
       LEFT JOIN "ServiceCategory" sc ON s."categoryId" = sc.id
       WHERE s.slug = $1
       LIMIT 1`,
      [slug]
    );
    if (!service) {
      throw new Error("Service not found");
    }
    return {
      ...service,
      images: typeof service.images === "string" ? JSON.parse(service.images) : service.images || [],
      availableAddons: typeof service.availableAddons === "string" ? JSON.parse(service.availableAddons) : service.availableAddons || []
    };
  }
  static async createService(data) {
    const {
      categoryId,
      name,
      slug,
      shortDesc,
      detailedDesc,
      coverImage,
      images,
      startingPrice,
      pricingMethod = "Starting price",
      availableAddons,
      isFeatured = false,
      isActive = true,
      sortOrder = 0
    } = data;
    const service = await db.queryOne(
      `INSERT INTO "Service" (
        "categoryId", name, slug, "shortDesc", "detailedDesc", "coverImage",
        images, "startingPrice", "pricingMethod", "availableAddons", "isFeatured", "isActive", "sortOrder"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        categoryId,
        name,
        slug,
        shortDesc,
        detailedDesc || null,
        coverImage,
        images ? JSON.stringify(images) : null,
        startingPrice ? Number(startingPrice) : null,
        pricingMethod,
        availableAddons ? JSON.stringify(availableAddons) : null,
        Boolean(isFeatured),
        Boolean(isActive),
        Number(sortOrder) || 0
      ]
    );
    return service;
  }
  static async updateService(id, data) {
    const existing = await db.queryOne(`SELECT * FROM "Service" WHERE id = $1`, [id]);
    if (!existing) throw new Error("Service not found");
    const fields = [];
    const values = [];
    let idx = 1;
    const allowed = [
      "categoryId",
      "name",
      "slug",
      "shortDesc",
      "detailedDesc",
      "coverImage",
      "startingPrice",
      "pricingMethod",
      "isFeatured",
      "isActive",
      "sortOrder"
    ];
    for (const key of allowed) {
      if (data[key] !== void 0) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (data.images !== void 0) {
      fields.push(`images = $${idx++}`);
      values.push(data.images ? JSON.stringify(data.images) : null);
    }
    if (data.availableAddons !== void 0) {
      fields.push(`"availableAddons" = $${idx++}`);
      values.push(data.availableAddons ? JSON.stringify(data.availableAddons) : null);
    }
    if (fields.length === 0) return existing;
    values.push(id);
    const updated = await db.queryOne(
      `UPDATE "Service"
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
    return updated;
  }
  static async deleteService(id) {
    const bookingUsage = await db.queryOne(
      `SELECT COUNT(*)::int as count FROM "BookingService" WHERE "serviceId" = $1`,
      [id]
    );
    if (bookingUsage && bookingUsage.count > 0) {
      return db.queryOne(`UPDATE "Service" SET "isActive" = FALSE WHERE id = $1 RETURNING *`, [id]);
    }
    return db.queryOne(`DELETE FROM "Service" WHERE id = $1 RETURNING *`, [id]);
  }
  static async createCategory(data) {
    const { name, slug, description, image, sortOrder = 0, isActive = true } = data;
    return db.queryOne(
      `INSERT INTO "ServiceCategory" (name, slug, description, image, "sortOrder", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, slug, description || null, image || null, Number(sortOrder) || 0, Boolean(isActive)]
    );
  }
  static async updateCategory(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of ["name", "slug", "description", "image", "sortOrder", "isActive"]) {
      if (data[key] !== void 0) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) {
      return db.queryOne(`SELECT * FROM "ServiceCategory" WHERE id = $1`, [id]);
    }
    values.push(id);
    return db.queryOne(
      `UPDATE "ServiceCategory"
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
  }
  static async deleteCategory(id) {
    return db.queryOne(`DELETE FROM "ServiceCategory" WHERE id = $1 RETURNING *`, [id]);
  }
};

// server/src/modules/services/services.schema.ts
var import_zod3 = require("zod");
var createServiceSchema = import_zod3.z.object({
  categoryId: import_zod3.z.string().min(1, "Category is required"),
  name: import_zod3.z.string().min(2, "Service name must be at least 2 characters"),
  slug: import_zod3.z.string().min(2, "Slug is required"),
  shortDesc: import_zod3.z.string().min(5, "Short description is required"),
  detailedDesc: import_zod3.z.string().optional(),
  coverImage: import_zod3.z.string().min(1, "Cover image URL is required"),
  images: import_zod3.z.array(import_zod3.z.string()).optional(),
  startingPrice: import_zod3.z.number().optional().nullable(),
  pricingMethod: import_zod3.z.string().default("Starting price"),
  availableAddons: import_zod3.z.array(import_zod3.z.string()).optional(),
  isFeatured: import_zod3.z.boolean().default(false),
  isActive: import_zod3.z.boolean().default(true),
  sortOrder: import_zod3.z.number().default(0)
});
var updateServiceSchema = createServiceSchema.partial();
var createCategorySchema = import_zod3.z.object({
  name: import_zod3.z.string().min(2, "Category name is required"),
  slug: import_zod3.z.string().min(2, "Slug is required"),
  description: import_zod3.z.string().optional(),
  image: import_zod3.z.string().optional(),
  sortOrder: import_zod3.z.number().default(0),
  isActive: import_zod3.z.boolean().default(true)
});

// server/src/modules/services/services.controller.ts
var ServicesController = class {
  static async getCategories(req, res, next) {
    try {
      const onlyActive = req.query.all !== "true";
      const categories = await ServicesService.getAllCategories(onlyActive);
      return apiSuccess(res, categories, "Categories fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async getServices(req, res, next) {
    try {
      const { categoryId, categorySlug, featured, search, all } = req.query;
      const services = await ServicesService.getAllServices({
        categoryId,
        categorySlug,
        featured: featured === "true" ? true : featured === "false" ? false : void 0,
        search,
        onlyActive: all !== "true"
      });
      return apiSuccess(res, services, "Services fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async getServiceBySlug(req, res, next) {
    try {
      const service = await ServicesService.getServiceBySlug(req.params.slug);
      return apiSuccess(res, service, "Service fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async createService(req, res, next) {
    try {
      const validatedData = createServiceSchema.parse(req.body);
      const service = await ServicesService.createService(validatedData);
      return apiSuccess(res, service, "Service created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async updateService(req, res, next) {
    try {
      const validatedData = updateServiceSchema.parse(req.body);
      const service = await ServicesService.updateService(req.params.id, validatedData);
      return apiSuccess(res, service, "Service updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async deleteService(req, res, next) {
    try {
      await ServicesService.deleteService(req.params.id);
      return apiSuccess(res, null, "Service deleted or deactivated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async createCategory(req, res, next) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await ServicesService.createCategory(validatedData);
      return apiSuccess(res, category, "Category created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async updateCategory(req, res, next) {
    try {
      const category = await ServicesService.updateCategory(req.params.id, req.body);
      return apiSuccess(res, category, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async deleteCategory(req, res, next) {
    try {
      await ServicesService.deleteCategory(req.params.id);
      return apiSuccess(res, null, "Category deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/services/services.routes.ts
var router3 = (0, import_express3.Router)();
router3.get("/categories", ServicesController.getCategories);
router3.get("/", ServicesController.getServices);
router3.get("/:slug", ServicesController.getServiceBySlug);
router3.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), ServicesController.createService);
router3.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), ServicesController.updateService);
router3.delete("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), ServicesController.deleteService);
router3.post("/categories", authenticate, requireRole(["OWNER", "MANAGER"]), ServicesController.createCategory);
router3.patch("/categories/:id", authenticate, requireRole(["OWNER", "MANAGER"]), ServicesController.updateCategory);
router3.delete("/categories/:id", authenticate, requireRole(["OWNER", "MANAGER"]), ServicesController.deleteCategory);
var services_routes_default = router3;

// server/src/modules/packages/packages.routes.ts
var import_express4 = require("express");

// server/src/modules/packages/packages.service.ts
var PackagesService = class {
  static async getAllPackages(onlyActive = true) {
    const whereClause = onlyActive ? 'WHERE "isActive" = TRUE' : "";
    const packages = await db.query(
      `SELECT * FROM "Package"
       ${whereClause}
       ORDER BY "sortOrder" ASC, "createdAt" DESC`
    );
    return packages.map((p) => ({
      ...p,
      includedServices: typeof p.includedServices === "string" ? JSON.parse(p.includedServices) : p.includedServices || [],
      optionalExtras: typeof p.optionalExtras === "string" ? JSON.parse(p.optionalExtras) : p.optionalExtras || []
    }));
  }
  static async getPackageBySlug(slug) {
    const pkg = await db.queryOne(
      `SELECT * FROM "Package" WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (!pkg) {
      throw new Error("Package not found");
    }
    return {
      ...pkg,
      includedServices: typeof pkg.includedServices === "string" ? JSON.parse(pkg.includedServices) : pkg.includedServices || [],
      optionalExtras: typeof pkg.optionalExtras === "string" ? JSON.parse(pkg.optionalExtras) : pkg.optionalExtras || []
    };
  }
  static async createPackage(data) {
    const {
      name,
      slug,
      description,
      includedServices,
      packagePrice,
      pricingType = "Starting price",
      optionalExtras,
      terms,
      isActive = true,
      isFeatured = false,
      sortOrder = 0
    } = data;
    const pkg = await db.queryOne(
      `INSERT INTO "Package" (
        name, slug, description, "includedServices", "packagePrice",
        "pricingType", "optionalExtras", terms, "isActive", "isFeatured", "sortOrder"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        slug,
        description,
        JSON.stringify(includedServices || []),
        packagePrice ? Number(packagePrice) : null,
        pricingType,
        optionalExtras ? JSON.stringify(optionalExtras) : null,
        terms || null,
        Boolean(isActive),
        Boolean(isFeatured),
        Number(sortOrder) || 0
      ]
    );
    return pkg;
  }
  static async updatePackage(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    const allowed = ["name", "slug", "description", "packagePrice", "pricingType", "terms", "isActive", "isFeatured", "sortOrder"];
    for (const key of allowed) {
      if (data[key] !== void 0) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (data.includedServices !== void 0) {
      fields.push(`"includedServices" = $${idx++}`);
      values.push(JSON.stringify(data.includedServices || []));
    }
    if (data.optionalExtras !== void 0) {
      fields.push(`"optionalExtras" = $${idx++}`);
      values.push(data.optionalExtras ? JSON.stringify(data.optionalExtras) : null);
    }
    if (fields.length === 0) {
      return db.queryOne(`SELECT * FROM "Package" WHERE id = $1`, [id]);
    }
    values.push(id);
    return db.queryOne(
      `UPDATE "Package"
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
  }
  static async deletePackage(id) {
    return db.queryOne(`DELETE FROM "Package" WHERE id = $1 RETURNING *`, [id]);
  }
};

// server/src/modules/packages/packages.schema.ts
var import_zod4 = require("zod");
var createPackageSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(2, "Package name is required"),
  slug: import_zod4.z.string().min(2, "Slug is required"),
  description: import_zod4.z.string().min(5, "Description is required"),
  includedServices: import_zod4.z.array(import_zod4.z.string()).min(1, "At least one included service is required"),
  packagePrice: import_zod4.z.number().optional().nullable(),
  pricingType: import_zod4.z.string().default("Starting price"),
  optionalExtras: import_zod4.z.array(import_zod4.z.string()).optional(),
  terms: import_zod4.z.string().optional(),
  isActive: import_zod4.z.boolean().default(true),
  isFeatured: import_zod4.z.boolean().default(false),
  sortOrder: import_zod4.z.number().default(0)
});
var updatePackageSchema = createPackageSchema.partial();

// server/src/modules/packages/packages.controller.ts
var PackagesController = class {
  static async getPackages(req, res, next) {
    try {
      const onlyActive = req.query.all !== "true";
      const packages = await PackagesService.getAllPackages(onlyActive);
      return apiSuccess(res, packages, "Packages fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async getPackageBySlug(req, res, next) {
    try {
      const pkg = await PackagesService.getPackageBySlug(req.params.slug);
      return apiSuccess(res, pkg, "Package fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async createPackage(req, res, next) {
    try {
      const validatedData = createPackageSchema.parse(req.body);
      const pkg = await PackagesService.createPackage(validatedData);
      return apiSuccess(res, pkg, "Package created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async updatePackage(req, res, next) {
    try {
      const validatedData = updatePackageSchema.parse(req.body);
      const pkg = await PackagesService.updatePackage(req.params.id, validatedData);
      return apiSuccess(res, pkg, "Package updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async deletePackage(req, res, next) {
    try {
      await PackagesService.deletePackage(req.params.id);
      return apiSuccess(res, null, "Package deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/packages/packages.routes.ts
var router4 = (0, import_express4.Router)();
router4.get("/", PackagesController.getPackages);
router4.get("/:slug", PackagesController.getPackageBySlug);
router4.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), PackagesController.createPackage);
router4.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), PackagesController.updatePackage);
router4.delete("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), PackagesController.deletePackage);
var packages_routes_default = router4;

// server/src/modules/portfolio/portfolio.routes.ts
var import_express5 = require("express");

// server/src/modules/portfolio/portfolio.service.ts
var PortfolioService = class {
  static async getAllProjects(params) {
    const { category, featured, search, onlyPublished = true } = params || {};
    const whereClauses = [];
    const values = [];
    let idx = 1;
    if (onlyPublished) {
      whereClauses.push(`"isPublished" = TRUE`);
    }
    if (category && category !== "All") {
      whereClauses.push(`category = $${idx++}`);
      values.push(category);
    }
    if (featured !== void 0) {
      whereClauses.push(`"isFeatured" = $${idx++}`);
      values.push(featured);
    }
    if (search) {
      whereClauses.push(`(title ILIKE $${idx} OR description ILIKE $${idx} OR location ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const projects = await db.query(
      `SELECT * FROM "PortfolioProject"
       ${whereStr}
       ORDER BY "sortOrder" ASC, "eventDate" DESC NULLS LAST, "createdAt" DESC`,
      values
    );
    return projects.map((p) => ({
      ...p,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images || []
    }));
  }
  static async getProjectBySlug(slug) {
    const project = await db.queryOne(
      `SELECT * FROM "PortfolioProject" WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (!project) {
      throw new Error("Project not found");
    }
    return {
      ...project,
      images: typeof project.images === "string" ? JSON.parse(project.images) : project.images || []
    };
  }
  static async createProject(data) {
    const {
      title,
      slug,
      category,
      description,
      clientName,
      location,
      eventDate,
      coverImage,
      images,
      isFeatured = false,
      isPublished = true,
      sortOrder = 0
    } = data;
    const project = await db.queryOne(
      `INSERT INTO "PortfolioProject" (
        title, slug, category, description, "clientName", location,
        "eventDate", "coverImage", images, "isFeatured", "isPublished", "sortOrder"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        title,
        slug,
        category,
        description,
        clientName || null,
        location || null,
        eventDate ? new Date(eventDate) : null,
        coverImage,
        images ? JSON.stringify(images) : null,
        Boolean(isFeatured),
        Boolean(isPublished),
        Number(sortOrder) || 0
      ]
    );
    return project;
  }
  static async updateProject(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    const allowed = ["title", "slug", "category", "description", "clientName", "location", "coverImage", "isFeatured", "isPublished", "sortOrder"];
    for (const key of allowed) {
      if (data[key] !== void 0) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (data.eventDate !== void 0) {
      fields.push(`"eventDate" = $${idx++}`);
      values.push(data.eventDate ? new Date(data.eventDate) : null);
    }
    if (data.images !== void 0) {
      fields.push(`images = $${idx++}`);
      values.push(data.images ? JSON.stringify(data.images) : null);
    }
    if (fields.length === 0) {
      return db.queryOne(`SELECT * FROM "PortfolioProject" WHERE id = $1`, [id]);
    }
    values.push(id);
    return db.queryOne(
      `UPDATE "PortfolioProject"
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
  }
  static async deleteProject(id) {
    return db.queryOne(`DELETE FROM "PortfolioProject" WHERE id = $1 RETURNING *`, [id]);
  }
};

// server/src/modules/portfolio/portfolio.schema.ts
var import_zod5 = require("zod");
var createPortfolioSchema = import_zod5.z.object({
  title: import_zod5.z.string().min(2, "Project title is required"),
  slug: import_zod5.z.string().min(2, "Slug is required"),
  category: import_zod5.z.string().min(2, "Category is required"),
  description: import_zod5.z.string().min(5, "Description is required"),
  clientName: import_zod5.z.string().optional(),
  location: import_zod5.z.string().optional(),
  eventDate: import_zod5.z.string().or(import_zod5.z.date()).optional(),
  coverImage: import_zod5.z.string().min(1, "Cover image URL is required"),
  images: import_zod5.z.array(import_zod5.z.string()).optional(),
  isFeatured: import_zod5.z.boolean().default(false),
  isPublished: import_zod5.z.boolean().default(true),
  sortOrder: import_zod5.z.number().default(0)
});
var updatePortfolioSchema = createPortfolioSchema.partial();

// server/src/modules/portfolio/portfolio.controller.ts
var PortfolioController = class {
  static async getProjects(req, res, next) {
    try {
      const { category, featured, search, all } = req.query;
      const projects = await PortfolioService.getAllProjects({
        category,
        featured: featured === "true" ? true : featured === "false" ? false : void 0,
        search,
        onlyPublished: all !== "true"
      });
      return apiSuccess(res, projects, "Portfolio projects fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async getProjectBySlug(req, res, next) {
    try {
      const project = await PortfolioService.getProjectBySlug(req.params.slug);
      return apiSuccess(res, project, "Project details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async createProject(req, res, next) {
    try {
      const validatedData = createPortfolioSchema.parse(req.body);
      const project = await PortfolioService.createProject(validatedData);
      return apiSuccess(res, project, "Portfolio project created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async updateProject(req, res, next) {
    try {
      const validatedData = updatePortfolioSchema.parse(req.body);
      const project = await PortfolioService.updateProject(req.params.id, validatedData);
      return apiSuccess(res, project, "Portfolio project updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async deleteProject(req, res, next) {
    try {
      await PortfolioService.deleteProject(req.params.id);
      return apiSuccess(res, null, "Portfolio project deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/portfolio/portfolio.routes.ts
var router5 = (0, import_express5.Router)();
router5.get("/", PortfolioController.getProjects);
router5.get("/:slug", PortfolioController.getProjectBySlug);
router5.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), PortfolioController.createProject);
router5.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), PortfolioController.updateProject);
router5.delete("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), PortfolioController.deleteProject);
var portfolio_routes_default = router5;

// server/src/modules/enquiries/enquiries.routes.ts
var import_express6 = require("express");

// server/src/modules/enquiries/enquiries.service.ts
var EnquiriesService = class {
  static async generateReference() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const countRes = await db.queryOne(`SELECT COUNT(*)::int AS count FROM "Enquiry"`);
    const count = countRes ? countRes.count : 0;
    const sequence = String(count + 1).padStart(4, "0");
    return `ENQ-${year}-${sequence}`;
  }
  static async createEnquiry(data) {
    const {
      name,
      phone,
      email,
      preferredContactMethod,
      eventType,
      eventTitle,
      eventDate,
      endDate,
      venueName,
      venueAddress,
      venueCity,
      guestCount,
      isOutdoor,
      selectedServiceIds,
      selectedPackageId,
      customRequirements,
      inspirationImages,
      budgetRange,
      consultationTime,
      additionalNotes
    } = data;
    let customer = await db.queryOne(`SELECT * FROM "Customer" WHERE phone = $1 LIMIT 1`, [phone.trim()]);
    if (!customer) {
      customer = await db.queryOne(
        `INSERT INTO "Customer" (name, phone, email)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name.trim(), phone.trim(), email ? email.trim().toLowerCase() : null]
      );
    } else if (email && !customer.email) {
      customer = await db.queryOne(
        `UPDATE "Customer" SET email = $1 WHERE id = $2 RETURNING *`,
        [email.trim().toLowerCase(), customer.id]
      );
    }
    const reference = await this.generateReference();
    const enquiry = await db.queryOne(
      `INSERT INTO "Enquiry" (
        reference, "customerId", "eventType", "eventTitle", "eventDate", "endDate",
        "venueName", "venueAddress", "venueCity", "guestCount", "isOutdoor",
        "selectedServiceIds", "selectedPackageId", "customRequirements",
        "inspirationImages", "budgetRange", "preferredContactMethod",
        "consultationTime", "additionalNotes", status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'NEW')
      RETURNING *`,
      [
        reference,
        customer.id,
        eventType,
        eventTitle || `${eventType} for ${name}`,
        new Date(eventDate),
        endDate ? new Date(endDate) : null,
        venueName || null,
        venueAddress || null,
        venueCity || null,
        guestCount ? Number(guestCount) : null,
        Boolean(isOutdoor),
        selectedServiceIds ? JSON.stringify(selectedServiceIds) : null,
        selectedPackageId || null,
        customRequirements || null,
        inspirationImages ? JSON.stringify(inspirationImages) : null,
        budgetRange || null,
        preferredContactMethod || "Phone",
        consultationTime || null,
        additionalNotes || null
      ]
    );
    await db.query(
      `INSERT INTO "Notification" (title, message, type, link)
       VALUES ($1, $2, 'ENQUIRY', '/admin/enquiries')`,
      ["New Event Enquiry Received", `${name} requested a quote for ${eventType} (${reference})`]
    ).catch(() => {
    });
    return {
      ...enquiry,
      customer,
      selectedServiceIds: typeof enquiry.selectedServiceIds === "string" ? JSON.parse(enquiry.selectedServiceIds) : enquiry.selectedServiceIds || [],
      inspirationImages: typeof enquiry.inspirationImages === "string" ? JSON.parse(enquiry.inspirationImages) : enquiry.inspirationImages || []
    };
  }
  static async getAllEnquiries(params) {
    const { status, eventType, search, startDate, endDate, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;
    const whereClauses = [];
    const values = [];
    let idx = 1;
    if (status && status !== "ALL") {
      whereClauses.push(`e.status = $${idx++}`);
      values.push(status);
    }
    if (eventType && eventType !== "ALL") {
      whereClauses.push(`e."eventType" = $${idx++}`);
      values.push(eventType);
    }
    if (startDate) {
      whereClauses.push(`e."eventDate" >= $${idx++}`);
      values.push(new Date(startDate));
    }
    if (endDate) {
      whereClauses.push(`e."eventDate" <= $${idx++}`);
      values.push(new Date(endDate));
    }
    if (search) {
      whereClauses.push(`(e.reference ILIKE $${idx} OR e."eventTitle" ILIKE $${idx} OR e."venueName" ILIKE $${idx} OR c.name ILIKE $${idx} OR c.phone ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const countRes = await db.queryOne(
      `SELECT COUNT(*)::int AS total
       FROM "Enquiry" e
       LEFT JOIN "Customer" c ON e."customerId" = c.id
       ${whereStr}`,
      values
    );
    const total = countRes ? countRes.total : 0;
    const queryValues = [...values, limit, offset];
    const enquiries = await db.query(
      `SELECT e.*,
        row_to_json(c) AS customer,
        (
          SELECT json_agg(row_to_json(n))
          FROM (
            SELECT * FROM "EnquiryNote" WHERE "enquiryId" = e.id ORDER BY "createdAt" DESC LIMIT 1
          ) n
        ) AS notes
       FROM "Enquiry" e
       LEFT JOIN "Customer" c ON e."customerId" = c.id
       ${whereStr}
       ORDER BY e."createdAt" DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      queryValues
    );
    const formatted = enquiries.map((e) => ({
      ...e,
      notes: e.notes || [],
      selectedServiceIds: typeof e.selectedServiceIds === "string" ? JSON.parse(e.selectedServiceIds) : e.selectedServiceIds || [],
      inspirationImages: typeof e.inspirationImages === "string" ? JSON.parse(e.inspirationImages) : e.inspirationImages || []
    }));
    return {
      enquiries: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getEnquiryById(id) {
    const enquiry = await db.queryOne(
      `SELECT e.*,
        row_to_json(c) AS customer,
        (
          SELECT json_agg(
            json_build_object(
              'id', n.id,
              'enquiryId', n."enquiryId",
              'note', n.note,
              'followUpDate', n."followUpDate",
              'createdAt', n."createdAt",
              'user', (SELECT json_build_object('id', u.id, 'name', u.name, 'role', u.role) FROM "User" u WHERE u.id = n."userId")
            )
          )
          FROM "EnquiryNote" n
          WHERE n."enquiryId" = e.id
        ) AS notes,
        (
          SELECT json_agg(row_to_json(b))
          FROM "Booking" b
          WHERE b."enquiryId" = e.id
        ) AS bookings,
        (
          SELECT json_agg(row_to_json(q))
          FROM "Quotation" q
          WHERE q."enquiryId" = e.id
        ) AS quotations
       FROM "Enquiry" e
       LEFT JOIN "Customer" c ON e."customerId" = c.id
       WHERE e.id = $1 OR e.reference = $1
       LIMIT 1`,
      [id]
    );
    if (!enquiry) {
      throw new Error("Enquiry not found");
    }
    return {
      ...enquiry,
      notes: enquiry.notes || [],
      bookings: enquiry.bookings || [],
      quotations: enquiry.quotations || [],
      selectedServiceIds: typeof enquiry.selectedServiceIds === "string" ? JSON.parse(enquiry.selectedServiceIds) : enquiry.selectedServiceIds || [],
      inspirationImages: typeof enquiry.inspirationImages === "string" ? JSON.parse(enquiry.inspirationImages) : enquiry.inspirationImages || []
    };
  }
  static async updateEnquiry(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    const allowed = [
      "eventType",
      "eventTitle",
      "venueName",
      "venueAddress",
      "venueCity",
      "guestCount",
      "isOutdoor",
      "selectedPackageId",
      "customRequirements",
      "budgetRange",
      "preferredContactMethod",
      "consultationTime",
      "additionalNotes",
      "status",
      "assignedToUserId"
    ];
    for (const key of allowed) {
      if (data[key] !== void 0) {
        fields.push(`"${key}" = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (data.eventDate) {
      fields.push(`"eventDate" = $${idx++}`);
      values.push(new Date(data.eventDate));
    }
    if (data.endDate !== void 0) {
      fields.push(`"endDate" = $${idx++}`);
      values.push(data.endDate ? new Date(data.endDate) : null);
    }
    if (data.selectedServiceIds !== void 0) {
      fields.push(`"selectedServiceIds" = $${idx++}`);
      values.push(JSON.stringify(data.selectedServiceIds));
    }
    if (fields.length === 0) {
      return this.getEnquiryById(id);
    }
    values.push(id);
    await db.query(
      `UPDATE "Enquiry"
       SET ${fields.join(", ")}
       WHERE id = $${idx}`,
      values
    );
    return this.getEnquiryById(id);
  }
  static async addNote(enquiryId, userId, note, followUpDate) {
    const newNote = await db.queryOne(
      `INSERT INTO "EnquiryNote" ("enquiryId", "userId", note, "followUpDate")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [enquiryId, userId || null, note, followUpDate ? new Date(followUpDate) : null]
    );
    if (followUpDate) {
      await db.query(
        `INSERT INTO "Notification" (title, message, type, link)
         VALUES ($1, $2, 'FOLLOWUP', $3)`,
        ["Follow-up Scheduled", `Follow-up set for note on enquiry (${enquiryId})`, `/admin/enquiries/${enquiryId}`]
      ).catch(() => {
      });
    }
    const user = userId ? await db.queryOne(`SELECT id, name, role FROM "User" WHERE id = $1`, [userId]) : null;
    return {
      ...newNote,
      user
    };
  }
  static async convertToBooking(enquiryId, data, userId) {
    const enquiry = await db.queryOne(
      `SELECT * FROM "Enquiry" WHERE id = $1 LIMIT 1`,
      [enquiryId]
    );
    if (!enquiry) {
      throw new Error("Enquiry not found");
    }
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const countRes = await db.queryOne(`SELECT COUNT(*)::int AS count FROM "Booking"`);
    const count = countRes ? countRes.count : 0;
    const reference = `BKG-${year}-${String(count + 1).padStart(4, "0")}`;
    return db.transaction(async (client) => {
      const bookingRes = await client.query(
        `INSERT INTO "Booking" (
          reference, "customerId", "enquiryId", "eventName", "eventType",
          "startDate", "endDate", "venueName", "venueAddress", "venueCity",
          "guestCount", status, "totalAmount", "discountAmount", "taxAmount",
          "finalAmount", "internalNotes"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'CONFIRMED', $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          reference,
          enquiry.customerId,
          enquiry.id,
          data.eventName || enquiry.eventTitle || `${enquiry.eventType} Celebration`,
          enquiry.eventType,
          new Date(data.startDate || enquiry.eventDate),
          data.endDate ? new Date(data.endDate) : enquiry.endDate,
          data.venueName || enquiry.venueName,
          data.venueAddress || enquiry.venueAddress,
          data.venueCity || enquiry.venueCity,
          data.guestCount || enquiry.guestCount,
          data.totalAmount || 0,
          data.discountAmount || 0,
          data.taxAmount || 0,
          data.finalAmount || data.totalAmount || 0,
          data.internalNotes || enquiry.additionalNotes
        ]
      );
      const booking = bookingRes.rows[0];
      if (data.selectedServices && Array.isArray(data.selectedServices) && data.selectedServices.length > 0) {
        for (const item of data.selectedServices) {
          await client.query(
            `INSERT INTO "BookingService" ("bookingId", "serviceId", "serviceName", quantity, "unitPrice", notes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [booking.id, item.serviceId || null, item.serviceName, item.quantity || 1, item.unitPrice || 0, item.notes || null]
          );
        }
      }
      await client.query(`UPDATE "Enquiry" SET status = 'CONVERTED' WHERE id = $1`, [enquiryId]);
      await client.query(
        `INSERT INTO "EnquiryNote" ("enquiryId", "userId", note) VALUES ($1, $2, $3)`,
        [enquiryId, userId || null, `Converted enquiry into confirmed Booking ${reference}`]
      );
      await client.query(
        `INSERT INTO "AuditLog" ("userId", action, entity, "entityId", details) VALUES ($1, 'CONVERT', 'ENQUIRY', $2, $3)`,
        [userId || null, enquiryId, JSON.stringify({ bookingId: booking.id, reference })]
      );
      return booking;
    });
  }
};

// server/src/modules/enquiries/enquiries.schema.ts
var import_zod6 = require("zod");
var createEnquirySchema = import_zod6.z.object({
  // Customer details
  name: import_zod6.z.string().min(2, "Name must be at least 2 characters"),
  phone: import_zod6.z.string().min(10, "Please enter a valid phone number (at least 10 digits)"),
  email: import_zod6.z.string().email("Please enter a valid email address").optional().or(import_zod6.z.literal("")),
  preferredContactMethod: import_zod6.z.enum(["Phone", "WhatsApp", "Email"]).default("Phone"),
  // Event details
  eventType: import_zod6.z.string().min(2, "Event type is required"),
  eventTitle: import_zod6.z.string().optional(),
  eventDate: import_zod6.z.string().or(import_zod6.z.date()),
  endDate: import_zod6.z.string().or(import_zod6.z.date()).optional().nullable(),
  venueName: import_zod6.z.string().optional(),
  venueAddress: import_zod6.z.string().optional(),
  venueCity: import_zod6.z.string().optional(),
  guestCount: import_zod6.z.number().or(import_zod6.z.string().regex(/^\d+$/).transform(Number)).optional().nullable(),
  isOutdoor: import_zod6.z.boolean().default(false),
  // Services & Budget
  selectedServiceIds: import_zod6.z.array(import_zod6.z.string()).optional(),
  selectedPackageId: import_zod6.z.string().optional().nullable(),
  customRequirements: import_zod6.z.string().optional(),
  inspirationImages: import_zod6.z.array(import_zod6.z.string()).optional(),
  budgetRange: import_zod6.z.string().optional(),
  consultationTime: import_zod6.z.string().optional(),
  additionalNotes: import_zod6.z.string().optional()
});
var updateEnquirySchema = import_zod6.z.object({
  eventType: import_zod6.z.string().optional(),
  eventTitle: import_zod6.z.string().optional(),
  eventDate: import_zod6.z.string().or(import_zod6.z.date()).optional(),
  endDate: import_zod6.z.string().or(import_zod6.z.date()).optional().nullable(),
  venueName: import_zod6.z.string().optional(),
  venueAddress: import_zod6.z.string().optional(),
  venueCity: import_zod6.z.string().optional(),
  guestCount: import_zod6.z.number().optional().nullable(),
  isOutdoor: import_zod6.z.boolean().optional(),
  selectedServiceIds: import_zod6.z.array(import_zod6.z.string()).optional(),
  selectedPackageId: import_zod6.z.string().optional().nullable(),
  customRequirements: import_zod6.z.string().optional(),
  budgetRange: import_zod6.z.string().optional(),
  preferredContactMethod: import_zod6.z.string().optional(),
  consultationTime: import_zod6.z.string().optional(),
  additionalNotes: import_zod6.z.string().optional(),
  status: import_zod6.z.enum([
    "NEW",
    "CONTACTED",
    "CONSULTATION_SCHEDULED",
    "QUOTATION_SENT",
    "NEGOTIATION",
    "CONVERTED",
    "LOST",
    "ARCHIVED"
  ]).optional(),
  assignedToUserId: import_zod6.z.string().optional().nullable()
});
var addEnquiryNoteSchema = import_zod6.z.object({
  note: import_zod6.z.string().min(2, "Note is required"),
  followUpDate: import_zod6.z.string().or(import_zod6.z.date()).optional().nullable()
});
var convertToBookingSchema = import_zod6.z.object({
  eventName: import_zod6.z.string().min(2, "Event name is required"),
  startDate: import_zod6.z.string().or(import_zod6.z.date()),
  endDate: import_zod6.z.string().or(import_zod6.z.date()).optional().nullable(),
  venueName: import_zod6.z.string().optional(),
  venueAddress: import_zod6.z.string().optional(),
  venueCity: import_zod6.z.string().optional(),
  guestCount: import_zod6.z.number().optional().nullable(),
  totalAmount: import_zod6.z.number().default(0),
  discountAmount: import_zod6.z.number().default(0),
  taxAmount: import_zod6.z.number().default(0),
  finalAmount: import_zod6.z.number().default(0),
  internalNotes: import_zod6.z.string().optional(),
  selectedServices: import_zod6.z.array(
    import_zod6.z.object({
      serviceId: import_zod6.z.string().optional(),
      serviceName: import_zod6.z.string(),
      quantity: import_zod6.z.number().default(1),
      unitPrice: import_zod6.z.number().default(0),
      notes: import_zod6.z.string().optional()
    })
  ).optional()
});

// server/src/modules/enquiries/enquiries.controller.ts
var EnquiriesController = class {
  static async createPublicEnquiry(req, res, next) {
    try {
      const validatedData = createEnquirySchema.parse(req.body);
      const enquiry = await EnquiriesService.createEnquiry(validatedData);
      return apiSuccess(
        res,
        {
          id: enquiry.id,
          reference: enquiry.reference,
          eventType: enquiry.eventType,
          customerName: enquiry.customer.name,
          status: enquiry.status
        },
        "Thank you! Your event enquiry has been received. Our team will contact you shortly.",
        201
      );
    } catch (error) {
      next(error);
    }
  }
  static async getAll(req, res, next) {
    try {
      const { status, eventType, search, startDate, endDate, page, limit } = req.query;
      const result = await EnquiriesService.getAllEnquiries({
        status,
        eventType,
        search,
        startDate,
        endDate,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });
      return apiSuccess(res, result.enquiries, "Enquiries fetched successfully", 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const enquiry = await EnquiriesService.getEnquiryById(req.params.id);
      return apiSuccess(res, enquiry, "Enquiry details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const validatedData = updateEnquirySchema.parse(req.body);
      const enquiry = await EnquiriesService.updateEnquiry(req.params.id, validatedData);
      return apiSuccess(res, enquiry, "Enquiry updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async addNote(req, res, next) {
    try {
      const { note, followUpDate } = addEnquiryNoteSchema.parse(req.body);
      const newNote = await EnquiriesService.addNote(req.params.id, req.user?.id, note, followUpDate);
      return apiSuccess(res, newNote, "Follow-up note added successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async convertToBooking(req, res, next) {
    try {
      const validatedData = convertToBookingSchema.parse(req.body);
      const booking = await EnquiriesService.convertToBooking(req.params.id, validatedData, req.user?.id);
      return apiSuccess(res, booking, "Enquiry converted to booking successfully", 201);
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/enquiries/enquiries.routes.ts
var router6 = (0, import_express6.Router)();
router6.post("/", publicFormLimiter, EnquiriesController.createPublicEnquiry);
router6.post("/public", publicFormLimiter, EnquiriesController.createPublicEnquiry);
router6.get("/", authenticate, EnquiriesController.getAll);
router6.get("/:id", authenticate, EnquiriesController.getById);
router6.patch("/:id", authenticate, EnquiriesController.update);
router6.post("/:id/notes", authenticate, EnquiriesController.addNote);
router6.post("/:id/convert", authenticate, requireRole(["OWNER", "MANAGER"]), EnquiriesController.convertToBooking);
var enquiries_routes_default = router6;

// server/src/modules/bookings/bookings.routes.ts
var import_express7 = require("express");

// server/src/modules/bookings/bookings.service.ts
var BookingsService = class _BookingsService {
  static async generateReference() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const countRes = await queryOne(`SELECT COUNT(*)::int AS count FROM "Booking"`);
    const count = countRes?.count || 0;
    return `BKG-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  static async checkOverlap(startDate, endDate, venueName, excludeBookingId) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1e3);
    const conditions = [
      `b."status" IN ('CONFIRMED', 'IN_PROGRESS', 'TENTATIVE')`,
      `((b."startDate" <= $2 AND b."endDate" >= $1) OR (b."startDate" >= $1 AND b."startDate" <= $2))`
    ];
    const values = [start, end];
    if (excludeBookingId) {
      values.push(excludeBookingId);
      conditions.push(`b."id" != $${values.length}`);
    }
    const sql = `
      SELECT 
        b.*,
        json_build_object('name', c."name") AS customer
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      WHERE ${conditions.join(" AND ")}
    `;
    const overlappingBookings = await query(sql, values);
    const venueConflicts = venueName ? overlappingBookings.filter(
      (b) => b.venueName && b.venueName.toLowerCase().trim() === venueName.toLowerCase().trim()
    ) : [];
    return {
      hasOverlap: overlappingBookings.length > 0,
      overlappingCount: overlappingBookings.length,
      overlappingBookings,
      hasVenueConflict: venueConflicts.length > 0,
      venueConflicts
    };
  }
  static async createBooking(data, userId) {
    const { services, ...rest } = data;
    const reference = await this.generateReference();
    const startDate = new Date(rest.startDate);
    const endDate = rest.endDate ? new Date(rest.endDate) : null;
    return transaction(async (client) => {
      const bRes = await client.query(
        `INSERT INTO "Booking" (
          "reference", "customerId", "enquiryId", "eventName", "eventType",
          "startDate", "endDate", "venueName", "venueAddress", "venueCity",
          "guestCount", "status", "totalAmount", "discountAmount", "taxAmount",
          "finalAmount", "internalNotes", "termsAndConditions"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          reference,
          rest.customerId,
          rest.enquiryId || null,
          rest.eventName,
          rest.eventType,
          startDate,
          endDate,
          rest.venueName || null,
          rest.venueAddress || null,
          rest.venueCity || null,
          rest.guestCount || null,
          rest.status || "CONFIRMED",
          Number(rest.totalAmount) || 0,
          Number(rest.discountAmount) || 0,
          Number(rest.taxAmount) || 0,
          Number(rest.finalAmount) || 0,
          rest.internalNotes || null,
          rest.termsAndConditions || null
        ]
      );
      const booking = bRes.rows[0];
      if (services && Array.isArray(services) && services.length > 0) {
        for (const item of services) {
          await client.query(
            `INSERT INTO "BookingService" (
              "bookingId", "serviceId", "serviceName", "quantity", "unitPrice", "notes"
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              booking.id,
              item.serviceId || null,
              item.serviceName,
              item.quantity || 1,
              item.unitPrice || 0,
              item.notes || null
            ]
          );
        }
      }
      await client.query(
        `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
        [
          userId || null,
          "CREATE",
          "BOOKING",
          booking.id,
          JSON.stringify({ reference, eventName: booking.eventName })
        ]
      );
      return booking;
    });
  }
  static async getAllBookings(params) {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    if (status && status !== "ALL") {
      values.push(status);
      conditions.push(`b."status" = $${values.length}`);
    }
    if (startDate) {
      values.push(new Date(startDate));
      conditions.push(`b."startDate" >= $${values.length}`);
    }
    if (endDate) {
      values.push(new Date(endDate));
      conditions.push(`b."startDate" <= $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(b."reference" ILIKE $${sIdx} OR b."eventName" ILIKE $${sIdx} OR b."venueName" ILIKE $${sIdx} OR b."venueCity" ILIKE $${sIdx} OR c."name" ILIKE $${sIdx} OR c."phone" ILIKE $${sIdx})`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countRes = await queryOne(
      `SELECT COUNT(*)::int AS count 
       FROM "Booking" b
       LEFT JOIN "Customer" c ON c."id" = b."customerId"
       ${whereClause}`,
      values
    );
    const total = countRes?.count || 0;
    const dataParams = [...values];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;
    const sql = `
      SELECT 
        b.*,
        row_to_json(c.*) AS customer,
        COALESCE(
          (
            SELECT json_agg(json_build_object('amount', p."amount", 'status', p."status", 'paymentType', p."paymentType"))
            FROM "Payment" p WHERE p."bookingId" = b."id"
          ),
          '[]'::json
        ) AS payments,
        (SELECT COUNT(*)::int FROM "BookingService" bs WHERE bs."bookingId" = b."id") AS "servicesCount",
        (SELECT COUNT(*)::int FROM "BookingAssignment" ba WHERE ba."bookingId" = b."id") AS "assignmentsCount",
        (SELECT COUNT(*)::int FROM "Quotation" q WHERE q."bookingId" = b."id") AS "quotationsCount"
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      ${whereClause}
      ORDER BY b."startDate" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
    const rows = await query(sql, dataParams);
    const formatted = rows.map((b) => {
      const payments = Array.isArray(b.payments) ? b.payments : [];
      const totalPaid = payments.filter((p) => p.status === "PAID").reduce((sum, p) => p.paymentType === "REFUND" ? sum - Number(p.amount) : sum + Number(p.amount), 0);
      const balance = Math.max(0, Number(b.finalAmount) - totalPaid);
      return {
        ...b,
        totalPaid,
        balance,
        _count: {
          services: b.servicesCount || 0,
          assignments: b.assignmentsCount || 0,
          quotations: b.quotationsCount || 0
        }
      };
    });
    return {
      bookings: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getBookingById(id) {
    const bookingSql = `
      SELECT 
        b.*,
        row_to_json(c.*) AS customer,
        CASE WHEN e."id" IS NOT NULL THEN row_to_json(e.*) ELSE NULL END AS enquiry,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', bs."id",
                'bookingId', bs."bookingId",
                'serviceId', bs."serviceId",
                'serviceName', bs."serviceName",
                'quantity', bs."quantity",
                'unitPrice', bs."unitPrice",
                'notes', bs."notes",
                'service', CASE WHEN s."id" IS NOT NULL THEN row_to_json(s.*) ELSE NULL END
              )
            )
            FROM "BookingService" bs
            LEFT JOIN "Service" s ON s."id" = bs."serviceId"
            WHERE bs."bookingId" = b."id"
          ),
          '[]'::json
        ) AS services,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ba."id",
                'bookingId', ba."bookingId",
                'staffId', ba."staffId",
                'vendorId', ba."vendorId",
                'role', ba."role",
                'notes', ba."notes",
                'assignedAt', ba."assignedAt",
                'staff', CASE WHEN sp."id" IS NOT NULL THEN row_to_json(sp.*) ELSE NULL END,
                'vendor', CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END
              )
            )
            FROM "BookingAssignment" ba
            LEFT JOIN "StaffProfile" sp ON sp."id" = ba."staffId"
            LEFT JOIN "Vendor" v ON v."id" = ba."vendorId"
            WHERE ba."bookingId" = b."id"
          ),
          '[]'::json
        ) AS assignments,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', q."id",
                'quotationNumber', q."quotationNumber",
                'grandTotal', q."grandTotal",
                'status', q."status",
                'createdAt', q."createdAt",
                'items', (SELECT json_agg(qi.*) FROM "QuotationItem" qi WHERE qi."quotationId" = q."id")
              ) ORDER BY q."createdAt" DESC
            )
            FROM "Quotation" q
            WHERE q."bookingId" = b."id"
          ),
          '[]'::json
        ) AS quotations,
        COALESCE(
          (
            SELECT json_agg(p.* ORDER BY p."paymentDate" DESC)
            FROM "Payment" p
            WHERE p."bookingId" = b."id"
          ),
          '[]'::json
        ) AS payments,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ex."id",
                'category', ex."category",
                'description', ex."description",
                'amount', ex."amount",
                'expenseDate', ex."expenseDate",
                'paymentMethod', ex."paymentMethod",
                'vendor', CASE WHEN ev."id" IS NOT NULL THEN row_to_json(ev.*) ELSE NULL END
              ) ORDER BY ex."expenseDate" DESC
            )
            FROM "Expense" ex
            LEFT JOIN "Vendor" ev ON ev."id" = ex."vendorId"
            WHERE ex."bookingId" = b."id"
          ),
          '[]'::json
        ) AS expenses
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      LEFT JOIN "Enquiry" e ON e."id" = b."enquiryId"
      WHERE b."id" = $1 OR b."reference" = $1
    `;
    const booking = await queryOne(bookingSql, [id]);
    if (!booking) {
      throw new Error("Booking not found");
    }
    const payments = Array.isArray(booking.payments) ? booking.payments : [];
    const expenses = Array.isArray(booking.expenses) ? booking.expenses : [];
    const totalPaid = payments.filter((p) => p.status === "PAID").reduce((sum, p) => p.paymentType === "REFUND" ? sum - Number(p.amount) : sum + Number(p.amount), 0);
    const balance = Math.max(0, Number(booking.finalAmount) - totalPaid);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const estimatedProfit = totalPaid - totalExpenses;
    return {
      ...booking,
      totalPaid,
      balance,
      totalExpenses,
      estimatedProfit
    };
  }
  static async updateBooking(id, data, userId) {
    const { services, startDate, endDate, ...rest } = data;
    const allowedFields = [
      "customerId",
      "enquiryId",
      "eventName",
      "eventType",
      "startDate",
      "endDate",
      "venueName",
      "venueAddress",
      "venueCity",
      "guestCount",
      "status",
      "totalAmount",
      "discountAmount",
      "taxAmount",
      "finalAmount",
      "internalNotes",
      "termsAndConditions"
    ];
    const fieldsToUpdate = { ...rest };
    if (startDate) fieldsToUpdate.startDate = new Date(startDate);
    if (endDate !== void 0) fieldsToUpdate.endDate = endDate ? new Date(endDate) : null;
    return transaction(async (client) => {
      const setClauses = [];
      const vals = [];
      allowedFields.forEach((f) => {
        if (fieldsToUpdate[f] !== void 0) {
          vals.push(fieldsToUpdate[f]);
          setClauses.push(`"${f}" = $${vals.length}`);
        }
      });
      if (setClauses.length > 0) {
        vals.push(id);
        await client.query(`UPDATE "Booking" SET ${setClauses.join(", ")} WHERE "id" = $${vals.length}`, vals);
      }
      if (services && Array.isArray(services)) {
        await client.query(`DELETE FROM "BookingService" WHERE "bookingId" = $1`, [id]);
        for (const item of services) {
          await client.query(
            `INSERT INTO "BookingService" (
              "bookingId", "serviceId", "serviceName", "quantity", "unitPrice", "notes"
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id,
              item.serviceId || null,
              item.serviceName,
              item.quantity || 1,
              item.unitPrice || 0,
              item.notes || null
            ]
          );
        }
      }
      if (userId) {
        await client.query(
          `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            "UPDATE",
            "BOOKING",
            id,
            JSON.stringify({ changes: Object.keys(data) })
          ]
        );
      }
      return _BookingsService.getBookingById(id);
    });
  }
  static async assignStaffOrVendor(bookingId, data) {
    const res = await queryOne(
      `INSERT INTO "BookingAssignment" ("bookingId", "staffId", "vendorId", "role", "notes")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [bookingId, data.staffId || null, data.vendorId || null, data.role, data.notes || null]
    );
    if (!res) throw new Error("Failed to create assignment");
    const assignmentSql = `
      SELECT 
        ba.*,
        CASE WHEN sp."id" IS NOT NULL THEN row_to_json(sp.*) ELSE NULL END AS staff,
        CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END AS vendor
      FROM "BookingAssignment" ba
      LEFT JOIN "StaffProfile" sp ON sp."id" = ba."staffId"
      LEFT JOIN "Vendor" v ON v."id" = ba."vendorId"
      WHERE ba."id" = $1
    `;
    return queryOne(assignmentSql, [res.id]);
  }
  static async removeAssignment(assignmentId) {
    const deleted = await queryOne(`DELETE FROM "BookingAssignment" WHERE "id" = $1 RETURNING *`, [assignmentId]);
    if (!deleted) {
      throw new Error("Assignment not found");
    }
    return deleted;
  }
  static async deleteBooking(id) {
    const deleted = await queryOne(`DELETE FROM "Booking" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error("Booking not found");
    }
    return deleted;
  }
};

// server/src/modules/bookings/bookings.schema.ts
var import_zod7 = require("zod");
var createBookingSchema = import_zod7.z.object({
  customerId: import_zod7.z.string().min(1, "Customer ID is required"),
  enquiryId: import_zod7.z.string().optional().nullable(),
  eventName: import_zod7.z.string().min(2, "Event name is required"),
  eventType: import_zod7.z.string().min(2, "Event type is required"),
  startDate: import_zod7.z.string().or(import_zod7.z.date()),
  endDate: import_zod7.z.string().or(import_zod7.z.date()).optional().nullable(),
  venueName: import_zod7.z.string().optional(),
  venueAddress: import_zod7.z.string().optional(),
  venueCity: import_zod7.z.string().optional(),
  guestCount: import_zod7.z.number().optional().nullable(),
  status: import_zod7.z.enum(["DRAFT", "TENTATIVE", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("CONFIRMED"),
  totalAmount: import_zod7.z.number().default(0),
  discountAmount: import_zod7.z.number().default(0),
  taxAmount: import_zod7.z.number().default(0),
  finalAmount: import_zod7.z.number().default(0),
  internalNotes: import_zod7.z.string().optional(),
  termsAndConditions: import_zod7.z.string().optional(),
  services: import_zod7.z.array(
    import_zod7.z.object({
      serviceId: import_zod7.z.string().optional().nullable(),
      serviceName: import_zod7.z.string(),
      quantity: import_zod7.z.number().default(1),
      unitPrice: import_zod7.z.number().default(0),
      notes: import_zod7.z.string().optional().nullable()
    })
  ).optional()
});
var updateBookingSchema = createBookingSchema.partial();
var assignBookingStaffSchema = import_zod7.z.object({
  staffId: import_zod7.z.string().optional().nullable(),
  vendorId: import_zod7.z.string().optional().nullable(),
  role: import_zod7.z.string().min(2, "Role is required"),
  notes: import_zod7.z.string().optional().nullable()
});

// server/src/modules/bookings/bookings.controller.ts
var BookingsController = class {
  static async checkOverlap(req, res, next) {
    try {
      const { startDate, endDate, venueName, excludeBookingId } = req.query;
      if (!startDate) {
        throw new Error("startDate query parameter is required");
      }
      const result = await BookingsService.checkOverlap(
        new Date(startDate),
        endDate ? new Date(endDate) : null,
        venueName,
        excludeBookingId
      );
      return apiSuccess(res, result, "Overlap check completed");
    } catch (error) {
      next(error);
    }
  }
  static async getAll(req, res, next) {
    try {
      const { status, search, startDate, endDate, page, limit } = req.query;
      const result = await BookingsService.getAllBookings({
        status,
        search,
        startDate,
        endDate,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });
      return apiSuccess(res, result.bookings, "Bookings fetched successfully", 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const booking = await BookingsService.getBookingById(req.params.id);
      return apiSuccess(res, booking, "Booking details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const validatedData = createBookingSchema.parse(req.body);
      const booking = await BookingsService.createBooking(validatedData, req.user?.id);
      return apiSuccess(res, booking, "Booking created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const validatedData = updateBookingSchema.parse(req.body);
      const booking = await BookingsService.updateBooking(req.params.id, validatedData, req.user?.id);
      return apiSuccess(res, booking, "Booking updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async assignStaffOrVendor(req, res, next) {
    try {
      const validatedData = assignBookingStaffSchema.parse(req.body);
      const assignment = await BookingsService.assignStaffOrVendor(req.params.id, validatedData);
      return apiSuccess(res, assignment, "Staff/Vendor assigned successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async removeAssignment(req, res, next) {
    try {
      await BookingsService.removeAssignment(req.params.assignmentId);
      return apiSuccess(res, null, "Assignment removed successfully");
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      await BookingsService.deleteBooking(req.params.id);
      return apiSuccess(res, null, "Booking deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/bookings/bookings.routes.ts
var router7 = (0, import_express7.Router)();
router7.get("/check-overlap", authenticate, BookingsController.checkOverlap);
router7.get("/", authenticate, BookingsController.getAll);
router7.get("/:id", authenticate, BookingsController.getById);
router7.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), BookingsController.create);
router7.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), BookingsController.update);
router7.delete("/:id", authenticate, requireRole(["OWNER"]), BookingsController.delete);
router7.post("/:id/assignments", authenticate, requireRole(["OWNER", "MANAGER"]), BookingsController.assignStaffOrVendor);
router7.delete("/:id/assignments/:assignmentId", authenticate, requireRole(["OWNER", "MANAGER"]), BookingsController.removeAssignment);
var bookings_routes_default = router7;

// server/src/modules/quotations/quotations.routes.ts
var import_express8 = require("express");

// server/src/modules/quotations/quotations.service.ts
var QuotationsService = class _QuotationsService {
  static async generateQuotationNumber() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const countRes = await queryOne(`SELECT COUNT(*)::int AS count FROM "Quotation"`);
    const count = countRes?.count || 0;
    return `QTN-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  static async createQuotation(data, userId) {
    const { items = [], overallDiscount = 0, taxRate = 18, ...rest } = data;
    let calculatedSubtotal = 0;
    const computedItems = items.map((item) => {
      const lineQty = Number(item.quantity) || 1;
      const lineUnitPrice = Number(item.unitPrice) || 0;
      const lineDiscount = Number(item.discount) || 0;
      const lineTotal = Math.max(0, lineQty * lineUnitPrice - lineDiscount);
      calculatedSubtotal += lineTotal;
      return {
        serviceId: item.serviceId || null,
        name: item.name,
        description: item.description || null,
        quantity: lineQty,
        unit: item.unit || "Set",
        unitPrice: lineUnitPrice,
        discount: lineDiscount,
        total: lineTotal
      };
    });
    const discount = Math.min(calculatedSubtotal, Number(overallDiscount) || 0);
    const taxableAmount = Math.max(0, calculatedSubtotal - discount);
    const taxAmount = taxableAmount * (Number(taxRate) || 0) / 100;
    const grandTotal = Math.round(taxableAmount + taxAmount);
    const quotationNumber = await this.generateQuotationNumber();
    return transaction(async (client) => {
      const qRes = await client.query(
        `INSERT INTO "Quotation" (
          "quotationNumber", "customerId", "bookingId", "enquiryId", "validUntil",
          "subtotal", "discount", "taxRate", "taxAmount", "grandTotal",
          "terms", "exclusions", "paymentSchedule", "status", "notes"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          quotationNumber,
          rest.customerId,
          rest.bookingId || null,
          rest.enquiryId || null,
          new Date(rest.validUntil),
          calculatedSubtotal,
          discount,
          Number(taxRate) || 0,
          taxAmount,
          grandTotal,
          rest.terms || null,
          rest.exclusions || null,
          rest.paymentSchedule || null,
          rest.status || "DRAFT",
          rest.notes || null
        ]
      );
      const quotation = qRes.rows[0];
      for (const item of computedItems) {
        await client.query(
          `INSERT INTO "QuotationItem" (
            "quotationId", "serviceId", "name", "description", "quantity", "unit", "unitPrice", "discount", "total"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            quotation.id,
            item.serviceId,
            item.name,
            item.description,
            item.quantity,
            item.unit,
            item.unitPrice,
            item.discount,
            item.total
          ]
        );
      }
      if (rest.bookingId && rest.status === "ACCEPTED") {
        await client.query(
          `UPDATE "Booking" SET
            "totalAmount" = $1,
            "discountAmount" = $2,
            "taxAmount" = $3,
            "finalAmount" = $4
          WHERE "id" = $5`,
          [calculatedSubtotal, discount, taxAmount, grandTotal, rest.bookingId]
        );
      }
      if (userId) {
        await client.query(
          `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
          [userId, "CREATE", "QUOTATION", quotation.id, JSON.stringify({ quotationNumber, grandTotal })]
        );
      }
      return _QuotationsService.getQuotationById(quotation.id);
    });
  }
  static async getAllQuotations(params) {
    const { status, search, customerId, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    if (status && status !== "ALL") {
      values.push(status);
      conditions.push(`q."status" = $${values.length}`);
    }
    if (customerId) {
      values.push(customerId);
      conditions.push(`q."customerId" = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(q."quotationNumber" ILIKE $${sIdx} OR c."name" ILIKE $${sIdx} OR c."phone" ILIKE $${sIdx})`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countRes = await queryOne(
      `SELECT COUNT(*)::int AS count 
       FROM "Quotation" q
       LEFT JOIN "Customer" c ON c."id" = q."customerId"
       ${whereClause}`,
      values
    );
    const total = countRes?.count || 0;
    const dataParams = [...values];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;
    const sql = `
      SELECT 
        q.*,
        json_build_object('id', c."id", 'name', c."name", 'phone', c."phone") AS customer,
        CASE WHEN b."id" IS NOT NULL THEN json_build_object('id', b."id", 'reference', b."reference", 'eventName', b."eventName") ELSE NULL END AS booking,
        (SELECT COUNT(*)::int FROM "QuotationItem" qi WHERE qi."quotationId" = q."id") AS "itemsCount"
      FROM "Quotation" q
      LEFT JOIN "Customer" c ON c."id" = q."customerId"
      LEFT JOIN "Booking" b ON b."id" = q."bookingId"
      ${whereClause}
      ORDER BY q."createdAt" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
    const rows = await query(sql, dataParams);
    const quotations = rows.map((r) => ({
      ...r,
      _count: { items: r.itemsCount || 0 }
    }));
    return {
      quotations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getQuotationById(id) {
    const sql = `
      SELECT 
        q.*,
        json_build_object('id', c."id", 'name', c."name", 'phone', c."phone", 'email', c."email", 'address', c."address") AS customer,
        CASE WHEN b."id" IS NOT NULL THEN row_to_json(b.*) ELSE NULL END AS booking,
        CASE WHEN e."id" IS NOT NULL THEN row_to_json(e.*) ELSE NULL END AS enquiry,
        COALESCE(
          json_agg(qi.*) FILTER (WHERE qi."id" IS NOT NULL),
          '[]'::json
        ) AS items
      FROM "Quotation" q
      LEFT JOIN "Customer" c ON c."id" = q."customerId"
      LEFT JOIN "Booking" b ON b."id" = q."bookingId"
      LEFT JOIN "Enquiry" e ON e."id" = q."enquiryId"
      LEFT JOIN "QuotationItem" qi ON qi."quotationId" = q."id"
      WHERE q."id" = $1 OR q."quotationNumber" = $1
      GROUP BY q."id", c."id", b."id", e."id"
    `;
    const quotation = await queryOne(sql, [id]);
    if (!quotation) {
      throw new Error("Quotation not found");
    }
    return quotation;
  }
  static async updateQuotation(id, data, userId) {
    const existing = await this.getQuotationById(id);
    const { items, overallDiscount, taxRate, validUntil, ...rest } = data;
    const currentTaxRate = taxRate !== void 0 ? Number(taxRate) : existing.taxRate;
    const currentDiscount = overallDiscount !== void 0 ? Number(overallDiscount) : existing.discount;
    return transaction(async (client) => {
      let calculatedSubtotal = existing.subtotal;
      if (items && Array.isArray(items)) {
        await client.query(`DELETE FROM "QuotationItem" WHERE "quotationId" = $1`, [id]);
        calculatedSubtotal = 0;
        for (const item of items) {
          const lineQty = Number(item.quantity) || 1;
          const lineUnitPrice = Number(item.unitPrice) || 0;
          const lineDiscount = Number(item.discount) || 0;
          const lineTotal = Math.max(0, lineQty * lineUnitPrice - lineDiscount);
          calculatedSubtotal += lineTotal;
          await client.query(
            `INSERT INTO "QuotationItem" (
              "quotationId", "serviceId", "name", "description", "quantity", "unit", "unitPrice", "discount", "total"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              id,
              item.serviceId || null,
              item.name,
              item.description || null,
              lineQty,
              item.unit || "Set",
              lineUnitPrice,
              lineDiscount,
              lineTotal
            ]
          );
        }
      }
      const discount = Math.min(calculatedSubtotal, currentDiscount);
      const taxableAmount = Math.max(0, calculatedSubtotal - discount);
      const taxAmount = taxableAmount * currentTaxRate / 100;
      const grandTotal = Math.round(taxableAmount + taxAmount);
      const fields = {
        ...rest,
        subtotal: calculatedSubtotal,
        discount,
        taxRate: currentTaxRate,
        taxAmount,
        grandTotal
      };
      if (validUntil) {
        fields.validUntil = new Date(validUntil);
      }
      const setClauses = [];
      const vals = [];
      const allowedCols = ["customerId", "bookingId", "enquiryId", "validUntil", "subtotal", "discount", "taxRate", "taxAmount", "grandTotal", "terms", "exclusions", "paymentSchedule", "status", "notes"];
      allowedCols.forEach((col) => {
        if (fields[col] !== void 0) {
          vals.push(fields[col]);
          setClauses.push(`"${col}" = $${vals.length}`);
        }
      });
      if (setClauses.length > 0) {
        vals.push(id);
        await client.query(`UPDATE "Quotation" SET ${setClauses.join(", ")} WHERE "id" = $${vals.length}`, vals);
      }
      if (rest.status === "ACCEPTED" && existing.bookingId) {
        await client.query(
          `UPDATE "Booking" SET
            "totalAmount" = $1,
            "discountAmount" = $2,
            "taxAmount" = $3,
            "finalAmount" = $4
          WHERE "id" = $5`,
          [calculatedSubtotal, discount, taxAmount, grandTotal, existing.bookingId]
        );
      }
      if (userId) {
        await client.query(
          `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
          [userId, "UPDATE", "QUOTATION", id, JSON.stringify({ grandTotal, status: rest.status })]
        );
      }
      return _QuotationsService.getQuotationById(id);
    });
  }
  static async deleteQuotation(id) {
    const deleted = await queryOne(`DELETE FROM "Quotation" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error("Quotation not found");
    }
    return deleted;
  }
};

// server/src/modules/quotations/quotations.schema.ts
var import_zod8 = require("zod");
var createQuotationSchema = import_zod8.z.object({
  customerId: import_zod8.z.string().min(1, "Customer ID is required"),
  bookingId: import_zod8.z.string().optional().nullable(),
  enquiryId: import_zod8.z.string().optional().nullable(),
  validUntil: import_zod8.z.string().or(import_zod8.z.date()),
  taxRate: import_zod8.z.number().min(0).default(18),
  overallDiscount: import_zod8.z.number().min(0).default(0),
  terms: import_zod8.z.string().optional().nullable(),
  exclusions: import_zod8.z.string().optional().nullable(),
  paymentSchedule: import_zod8.z.string().optional().nullable(),
  notes: import_zod8.z.string().optional().nullable(),
  status: import_zod8.z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).default("DRAFT"),
  items: import_zod8.z.array(
    import_zod8.z.object({
      serviceId: import_zod8.z.string().optional().nullable(),
      name: import_zod8.z.string().min(1, "Item name is required"),
      description: import_zod8.z.string().optional().nullable(),
      quantity: import_zod8.z.number().min(0.1).default(1),
      unit: import_zod8.z.string().default("Set"),
      unitPrice: import_zod8.z.number().min(0).default(0),
      discount: import_zod8.z.number().min(0).default(0)
    })
  ).min(1, "At least one line item is required in the quotation")
});
var updateQuotationSchema = createQuotationSchema.partial();

// server/src/utils/pdf.ts
var import_jspdf = require("jspdf");
var import_jspdf_autotable = __toESM(require("jspdf-autotable"), 1);
var PdfGenerator = class {
  static generateQuotationPdf(quotation, settings) {
    const doc = new import_jspdf.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    const primaryColor = [184, 149, 90];
    const charcoalColor = [36, 33, 31];
    const businessName = settings?.businessName || "Sathuragiri Decoration";
    const tagline = settings?.tagline || "Every Celebration, Beautifully Crafted.";
    const phone = settings?.phone || "+91 98421 87654";
    const email = settings?.email || "contact@sathuragiridecoration.com";
    const address = settings?.address || "Plot No. 45, Temple View Avenue, Madurai - 625009";
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text(businessName.toUpperCase(), 14, 22);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(119, 113, 107);
    doc.text(tagline, 14, 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...charcoalColor);
    doc.text(`${address} | Phone: ${phone} | Email: ${email}`, 14, 34);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...charcoalColor);
    doc.text("OFFICIAL EVENT QUOTATION", 14, 46);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Quotation #: ${quotation.quotationNumber}`, 140, 44);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString("en-IN")}`, 140, 49);
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString("en-IN")}`, 140, 54);
    doc.text(`Status: ${quotation.status}`, 140, 59);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENT DETAILS:", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${quotation.customer?.name || "Valued Client"}`, 14, 60);
    doc.text(`Phone: ${quotation.customer?.phone || "N/A"}`, 14, 65);
    if (quotation.customer?.email) {
      doc.text(`Email: ${quotation.customer.email}`, 14, 70);
    }
    if (quotation.booking?.eventName) {
      doc.text(`Event: ${quotation.booking.eventName}`, 14, 75);
    }
    const startY = quotation.booking?.eventName ? 82 : 78;
    const tableData = quotation.items.map((item, index) => [
      String(index + 1),
      `${item.name}${item.description ? `
${item.description}` : ""}`,
      `${item.quantity} ${item.unit || ""}`,
      `\u20B9${Number(item.unitPrice).toLocaleString("en-IN")}`,
      item.discount > 0 ? `\u20B9${Number(item.discount).toLocaleString("en-IN")}` : "-",
      `\u20B9${Number(item.total).toLocaleString("en-IN")}`
    ]);
    const runAutoTable = (docInstance, options) => {
      const at = import_jspdf_autotable.default;
      if (typeof at === "function") {
        at(docInstance, options);
      } else if (typeof at?.default === "function") {
        at.default(docInstance, options);
      } else if (typeof docInstance.autoTable === "function") {
        docInstance.autoTable(options);
      }
    };
    runAutoTable(doc, {
      startY,
      head: [["#", "Item Description", "Qty", "Unit Price", "Discount", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: charcoalColor
      },
      alternateRowStyles: {
        fillColor: [250, 247, 242]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: 25, halign: "right" }
      }
    });
    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`\u20B9${Number(quotation.subtotal).toLocaleString("en-IN")}`, 196, finalY, { align: "right" });
    if (quotation.discount > 0) {
      doc.text(`Overall Discount:`, 140, finalY + 5);
      doc.text(`- \u20B9${Number(quotation.discount).toLocaleString("en-IN")}`, 196, finalY + 5, { align: "right" });
    }
    doc.text(`GST / Tax (${quotation.taxRate}%):`, 140, finalY + 10);
    doc.text(`\u20B9${Number(quotation.taxAmount).toLocaleString("en-IN")}`, 196, finalY + 10, { align: "right" });
    doc.setLineWidth(0.3);
    doc.setDrawColor(...primaryColor);
    doc.line(140, finalY + 13, 196, finalY + 13);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(`Grand Total:`, 140, finalY + 19);
    doc.text(`\u20B9${Number(quotation.grandTotal).toLocaleString("en-IN")}`, 196, finalY + 19, { align: "right" });
    doc.setTextColor(...charcoalColor);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT SCHEDULE & TERMS:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const terms = quotation.terms || settings?.termsDefault || "1. 30% advance on booking.\n2. 50% prior to event setup.\n3. 20% on completion.";
    doc.text(terms, 14, finalY + 5, { maxWidth: 115 });
    doc.setFillColor(250, 247, 242);
    doc.rect(0, 282, 210, 15, "F");
    doc.setFontSize(8);
    doc.setTextColor(119, 113, 107);
    doc.text("Thank you for choosing Sathuragiri Decoration. We craft your special moments into timeless memories.", 105, 290, { align: "center" });
    return Buffer.from(doc.output("arraybuffer"));
  }
  static generateReceiptPdf(payment, settings) {
    const doc = new import_jspdf.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5"
      // A5 compact for receipts
    });
    const primaryColor = [184, 149, 90];
    const charcoalColor = [36, 33, 31];
    const businessName = settings?.businessName || "Sathuragiri Decoration";
    const phone = settings?.phone || "+91 98421 87654";
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 148, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text(businessName.toUpperCase(), 12, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(119, 113, 107);
    doc.text(`Official Payment Acknowledgement Receipt | Phone: ${phone}`, 12, 23);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...primaryColor);
    doc.line(12, 27, 136, 27);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...charcoalColor);
    doc.text("PAYMENT RECEIPT", 12, 35);
    doc.setFontSize(9);
    doc.text(`Receipt #: ${payment.receiptNumber}`, 85, 35);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString("en-IN")}`, 85, 40);
    doc.text(`Payment Mode: ${payment.paymentMethod}`, 85, 45);
    doc.text(`Received from: ${payment.customer?.name || "Customer"}`, 12, 45);
    doc.text(`Phone: ${payment.customer?.phone || "N/A"}`, 12, 50);
    doc.text(`Booking Ref: ${payment.booking?.reference || "N/A"}`, 12, 55);
    doc.text(`Event: ${payment.booking?.eventName || "Event"}`, 12, 60);
    if (payment.reference) {
      doc.text(`Txn Ref: ${payment.reference}`, 12, 65);
    }
    doc.setFillColor(250, 247, 242);
    doc.roundedRect(12, 72, 124, 20, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...charcoalColor);
    doc.text(`Amount Received (${payment.paymentType}):`, 18, 84);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(`\u20B9${Number(payment.amount).toLocaleString("en-IN")}`, 130, 84, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(119, 113, 107);
    doc.text("This is a computer-generated receipt for Sathuragiri Decoration services.", 12, 102);
    return Buffer.from(doc.output("arraybuffer"));
  }
};

// server/src/modules/settings/settings.service.ts
var SettingsService = class {
  static async getSettings() {
    let settings = await db.queryOne(`SELECT * FROM "BusinessSettings" LIMIT 1`);
    if (!settings) {
      settings = await db.queryOne(
        `INSERT INTO "BusinessSettings" (
          id, "businessName", tagline, phone, "whatsappNumber", email, address, city, state, pincode
        ) VALUES (
          'default-settings', 'Sathuragiri Decoration', 'Every Celebration, Beautifully Crafted.',
          '+91 98421 87654', '+919842187654', 'contact@sathuragiridecoration.com',
          'Plot No. 45, Temple View Avenue, Near Ring Road, Madurai', 'Madurai', 'Tamil Nadu', '625009'
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING *`
      );
      if (!settings) {
        settings = await db.queryOne(`SELECT * FROM "BusinessSettings" LIMIT 1`);
      }
    }
    return settings;
  }
  static async updateSettings(data) {
    const settings = await this.getSettings();
    const allowedKeys = [
      "businessName",
      "tagline",
      "logoUrl",
      "phone",
      "alternatePhone",
      "whatsappNumber",
      "email",
      "address",
      "city",
      "state",
      "pincode",
      "mapsEmbedUrl",
      "primaryGold",
      "gstNumber",
      "advancePercentageDefault",
      "currencySymbol",
      "termsDefault",
      "socialInstagram",
      "socialFacebook",
      "socialYoutube"
    ];
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowedKeys) {
      if (data[key] !== void 0) {
        fields.push(`"${key}" = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }
    if (fields.length === 0) {
      return settings;
    }
    values.push(settings.id);
    const updated = await db.queryOne(
      `UPDATE "BusinessSettings"
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
    return updated;
  }
};

// server/src/modules/quotations/quotations.controller.ts
var QuotationsController = class {
  static async getAll(req, res, next) {
    try {
      const { status, search, customerId, page, limit } = req.query;
      const result = await QuotationsService.getAllQuotations({
        status,
        search,
        customerId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });
      return apiSuccess(res, result.quotations, "Quotations fetched successfully", 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const quotation = await QuotationsService.getQuotationById(req.params.id);
      return apiSuccess(res, quotation, "Quotation details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const validatedData = createQuotationSchema.parse(req.body);
      const quotation = await QuotationsService.createQuotation(validatedData, req.user?.id);
      return apiSuccess(res, quotation, "Quotation created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const validatedData = updateQuotationSchema.parse(req.body);
      const quotation = await QuotationsService.updateQuotation(req.params.id, validatedData, req.user?.id);
      return apiSuccess(res, quotation, "Quotation updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async downloadPdf(req, res, next) {
    try {
      const quotation = await QuotationsService.getQuotationById(req.params.id);
      const settings = await SettingsService.getSettings();
      const pdfBuffer = PdfGenerator.generateQuotationPdf(quotation, settings);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${quotation.quotationNumber}-${quotation.customer.name.replace(/\s+/g, "_")}.pdf"`
      );
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      await QuotationsService.deleteQuotation(req.params.id);
      return apiSuccess(res, null, "Quotation deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/quotations/quotations.routes.ts
var router8 = (0, import_express8.Router)();
router8.get("/", authenticate, QuotationsController.getAll);
router8.get("/:id", authenticate, QuotationsController.getById);
router8.get("/:id/pdf", authenticate, QuotationsController.downloadPdf);
router8.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), QuotationsController.create);
router8.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), QuotationsController.update);
router8.delete("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), QuotationsController.delete);
var quotations_routes_default = router8;

// server/src/modules/payments/payments.routes.ts
var import_express9 = require("express");

// server/src/modules/payments/payments.service.ts
var PaymentsService = class _PaymentsService {
  static async generateReceiptNumber() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const countRes = await queryOne(`SELECT COUNT(*)::int AS count FROM "Payment"`);
    const count = countRes?.count || 0;
    return `RCT-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  static async createPayment(data, userId) {
    const receiptNumber = await this.generateReceiptNumber();
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : /* @__PURE__ */ new Date();
    return transaction(async (client) => {
      const pRes = await client.query(
        `INSERT INTO "Payment" (
          "receiptNumber", "bookingId", "customerId", "amount", "paymentMethod",
          "paymentType", "reference", "paymentDate", "notes", "status", "recordedByUserId"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          receiptNumber,
          data.bookingId,
          data.customerId,
          Number(data.amount),
          data.paymentMethod || "UPI",
          data.paymentType || "ADVANCE",
          data.reference || null,
          paymentDate,
          data.notes || null,
          data.status || "PAID",
          userId || null
        ]
      );
      const payment = pRes.rows[0];
      const custRes = await client.query(`SELECT "name" FROM "Customer" WHERE "id" = $1`, [data.customerId]);
      const customerName = custRes.rows[0]?.name || "Customer";
      await client.query(
        `INSERT INTO "Notification" ("title", "message", "type", "link") VALUES ($1, $2, $3, $4)`,
        [
          "Payment Received",
          `\u20B9${Number(payment.amount).toLocaleString("en-IN")} received from ${customerName} (${receiptNumber})`,
          "PAYMENT",
          "/admin/payments"
        ]
      );
      await client.query(
        `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
        [
          userId || null,
          "CREATE",
          "PAYMENT",
          payment.id,
          JSON.stringify({ receiptNumber, amount: payment.amount, method: payment.paymentMethod })
        ]
      );
      return _PaymentsService.getPaymentById(payment.id);
    });
  }
  static async getAllPayments(params) {
    const { bookingId, customerId, paymentMethod, search, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    if (bookingId) {
      values.push(bookingId);
      conditions.push(`p."bookingId" = $${values.length}`);
    }
    if (customerId) {
      values.push(customerId);
      conditions.push(`p."customerId" = $${values.length}`);
    }
    if (paymentMethod && paymentMethod !== "ALL") {
      values.push(paymentMethod);
      conditions.push(`p."paymentMethod" = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(p."receiptNumber" ILIKE $${sIdx} OR p."reference" ILIKE $${sIdx} OR c."name" ILIKE $${sIdx} OR b."reference" ILIKE $${sIdx})`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countRes = await queryOne(
      `SELECT COUNT(*)::int AS count 
       FROM "Payment" p
       LEFT JOIN "Customer" c ON c."id" = p."customerId"
       LEFT JOIN "Booking" b ON b."id" = p."bookingId"
       ${whereClause}`,
      values
    );
    const total = countRes?.count || 0;
    const dataParams = [...values];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;
    const sql = `
      SELECT 
        p.*,
        json_build_object('id', c."id", 'name', c."name", 'phone', c."phone") AS customer,
        json_build_object('id', b."id", 'reference', b."reference", 'eventName', b."eventName", 'finalAmount', b."finalAmount") AS booking,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Payment" p
      LEFT JOIN "Customer" c ON c."id" = p."customerId"
      LEFT JOIN "Booking" b ON b."id" = p."bookingId"
      LEFT JOIN "User" u ON u."id" = p."recordedByUserId"
      ${whereClause}
      ORDER BY p."paymentDate" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
    const payments = await query(sql, dataParams);
    return {
      payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getPaymentById(id) {
    const sql = `
      SELECT 
        p.*,
        row_to_json(c.*) AS customer,
        row_to_json(b.*) AS booking,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Payment" p
      LEFT JOIN "Customer" c ON c."id" = p."customerId"
      LEFT JOIN "Booking" b ON b."id" = p."bookingId"
      LEFT JOIN "User" u ON u."id" = p."recordedByUserId"
      WHERE p."id" = $1 OR p."receiptNumber" = $1
    `;
    const payment = await queryOne(sql, [id]);
    if (!payment) {
      throw new Error("Payment record not found");
    }
    return payment;
  }
  static async deletePayment(id, userId) {
    return transaction(async (client) => {
      const pRes = await client.query(`SELECT * FROM "Payment" WHERE "id" = $1`, [id]);
      const payment = pRes.rows[0];
      if (!payment) throw new Error("Payment not found");
      await client.query(
        `INSERT INTO "AuditLog" ("userId", "action", "entity", "entityId", "details") VALUES ($1, $2, $3, $4, $5)`,
        [
          userId || null,
          "DELETE",
          "PAYMENT",
          id,
          JSON.stringify({ receiptNumber: payment.receiptNumber, amount: payment.amount })
        ]
      );
      const delRes = await client.query(`DELETE FROM "Payment" WHERE "id" = $1 RETURNING *`, [id]);
      return delRes.rows[0];
    });
  }
};

// server/src/modules/payments/payments.schema.ts
var import_zod9 = require("zod");
var createPaymentSchema = import_zod9.z.object({
  bookingId: import_zod9.z.string().min(1, "Booking ID is required"),
  customerId: import_zod9.z.string().min(1, "Customer ID is required"),
  amount: import_zod9.z.number().positive("Amount must be greater than zero"),
  paymentMethod: import_zod9.z.enum(["CASH", "BANK_TRANSFER", "UPI", "CARD", "OTHER"]).default("UPI"),
  paymentType: import_zod9.z.enum(["ADVANCE", "PARTIAL", "FINAL_SETTLEMENT", "REFUND"]).default("ADVANCE"),
  reference: import_zod9.z.string().optional().nullable(),
  paymentDate: import_zod9.z.string().or(import_zod9.z.date()).optional(),
  notes: import_zod9.z.string().optional().nullable(),
  status: import_zod9.z.enum(["PAID", "PENDING", "REFUNDED"]).default("PAID")
});
var updatePaymentSchema = createPaymentSchema.partial();

// server/src/modules/payments/payments.controller.ts
var PaymentsController = class {
  static async getAll(req, res, next) {
    try {
      const { bookingId, customerId, paymentMethod, search, page, limit } = req.query;
      const result = await PaymentsService.getAllPayments({
        bookingId,
        customerId,
        paymentMethod,
        search,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });
      return apiSuccess(res, result.payments, "Payments fetched successfully", 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const payment = await PaymentsService.getPaymentById(req.params.id);
      return apiSuccess(res, payment, "Payment record fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      const payment = await PaymentsService.createPayment(validatedData, req.user?.id);
      return apiSuccess(res, payment, "Payment recorded successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async downloadReceiptPdf(req, res, next) {
    try {
      const payment = await PaymentsService.getPaymentById(req.params.id);
      const settings = await SettingsService.getSettings();
      const pdfBuffer = PdfGenerator.generateReceiptPdf(payment, settings);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${payment.receiptNumber}-${payment.customer.name.replace(/\s+/g, "_")}.pdf"`
      );
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      await PaymentsService.deletePayment(req.params.id, req.user?.id);
      return apiSuccess(res, null, "Payment deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/payments/payments.routes.ts
var router9 = (0, import_express9.Router)();
router9.get("/", authenticate, PaymentsController.getAll);
router9.get("/:id", authenticate, PaymentsController.getById);
router9.get("/:id/receipt-pdf", authenticate, PaymentsController.downloadReceiptPdf);
router9.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), PaymentsController.create);
router9.delete("/:id", authenticate, requireRole(["OWNER"]), PaymentsController.delete);
var payments_routes_default = router9;

// server/src/modules/customers/customers.routes.ts
var import_express10 = require("express");

// server/src/modules/customers/customers.service.ts
var CustomersService = class {
  static async getAllCustomers(params) {
    const { search, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;
    let whereClause = "";
    const queryParams = [];
    if (search) {
      queryParams.push(`%${search}%`);
      whereClause = `WHERE ("name" ILIKE $1 OR "phone" ILIKE $1 OR "email" ILIKE $1 OR "address" ILIKE $1)`;
    }
    const countSql = `SELECT COUNT(*)::int AS count FROM "Customer" ${whereClause}`;
    const countRes = await queryOne(countSql, queryParams);
    const total = countRes?.count || 0;
    const dataParams = [...queryParams];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;
    const sql = `
      SELECT c.*,
        (SELECT COUNT(*)::int FROM "Enquiry" e WHERE e."customerId" = c."id") AS "enquiriesCount",
        (SELECT COUNT(*)::int FROM "Booking" b WHERE b."customerId" = c."id") AS "bookingsCount",
        (SELECT COUNT(*)::int FROM "Quotation" q WHERE q."customerId" = c."id") AS "quotationsCount",
        (SELECT COUNT(*)::int FROM "Payment" p WHERE p."customerId" = c."id") AS "paymentsCount"
      FROM "Customer" c
      ${whereClause}
      ORDER BY c."createdAt" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
    const rows = await query(sql, dataParams);
    const customers = rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      address: r.address,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      _count: {
        enquiries: r.enquiriesCount || 0,
        bookings: r.bookingsCount || 0,
        quotations: r.quotationsCount || 0,
        payments: r.paymentsCount || 0
      }
    }));
    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getCustomerById(id) {
    const customer = await queryOne(`SELECT * FROM "Customer" WHERE "id" = $1`, [id]);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const enquiries = await query(
      `SELECT * FROM "Enquiry" WHERE "customerId" = $1 ORDER BY "createdAt" DESC`,
      [id]
    );
    const bookings = await query(
      `SELECT * FROM "Booking" WHERE "customerId" = $1 ORDER BY "startDate" DESC`,
      [id]
    );
    const payments = await query(
      `SELECT * FROM "Payment" WHERE "customerId" = $1 ORDER BY "paymentDate" DESC`,
      [id]
    );
    const quotations = await query(
      `SELECT * FROM "Quotation" WHERE "customerId" = $1 ORDER BY "createdAt" DESC`,
      [id]
    );
    const bookingsWithPayments = bookings.map((b) => ({
      ...b,
      payments: payments.filter((p) => p.bookingId === b.id)
    }));
    return {
      ...customer,
      enquiries,
      bookings: bookingsWithPayments,
      quotations,
      payments
    };
  }
  static async createCustomer(data) {
    const fields = ["name", "phone", "email", "address", "notes"];
    const setCols = [];
    const values = [];
    fields.forEach((f) => {
      if (data[f] !== void 0) {
        setCols.push(`"${f}"`);
        values.push(data[f]);
      }
    });
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO "Customer" (${setCols.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    return queryOne(sql, values);
  }
  static async updateCustomer(id, data) {
    const fields = ["name", "phone", "email", "address", "notes"];
    const setClauses = [];
    const values = [];
    fields.forEach((f) => {
      if (data[f] !== void 0) {
        values.push(data[f]);
        setClauses.push(`"${f}" = $${values.length}`);
      }
    });
    if (setClauses.length === 0) {
      return this.getCustomerById(id);
    }
    values.push(id);
    const sql = `UPDATE "Customer" SET ${setClauses.join(", ")} WHERE "id" = $${values.length} RETURNING *`;
    const updated = await queryOne(sql, values);
    if (!updated) {
      throw new Error("Customer not found");
    }
    return updated;
  }
  static async deleteCustomer(id) {
    const deleted = await queryOne(`DELETE FROM "Customer" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error("Customer not found");
    }
    return deleted;
  }
};

// server/src/modules/customers/customers.controller.ts
var CustomersController = class {
  static async getAll(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await CustomersService.getAllCustomers({
        search,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });
      return apiSuccess(res, result.customers, "Customers fetched successfully", 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const customer = await CustomersService.getCustomerById(req.params.id);
      return apiSuccess(res, customer, "Customer details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const customer = await CustomersService.createCustomer(req.body);
      return apiSuccess(res, customer, "Customer created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const customer = await CustomersService.updateCustomer(req.params.id, req.body);
      return apiSuccess(res, customer, "Customer updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      await CustomersService.deleteCustomer(req.params.id);
      return apiSuccess(res, null, "Customer deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/customers/customers.routes.ts
var router10 = (0, import_express10.Router)();
router10.get("/", authenticate, CustomersController.getAll);
router10.get("/:id", authenticate, CustomersController.getById);
router10.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), CustomersController.create);
router10.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), CustomersController.update);
router10.delete("/:id", authenticate, requireRole(["OWNER"]), CustomersController.delete);
var customers_routes_default = router10;

// server/src/modules/staff/staff.routes.ts
var import_express11 = require("express");

// server/src/modules/staff/staff.service.ts
var StaffService = class {
  static async getAllStaff(onlyActive = false) {
    const whereClause = onlyActive ? `WHERE s."isActive" = true` : ``;
    const sql = `
      SELECT 
        s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a."id",
              'bookingId', a."bookingId",
              'staffId', a."staffId",
              'role', a."role",
              'notes', a."notes",
              'assignedAt', a."assignedAt",
              'booking', json_build_object(
                'id', b."id",
                'reference', b."reference",
                'eventName', b."eventName",
                'startDate', b."startDate",
                'status', b."status"
              )
            )
          ) FILTER (WHERE a."id" IS NOT NULL),
          '[]'::json
        ) AS assignments
      FROM "StaffProfile" s
      LEFT JOIN "BookingAssignment" a ON a."staffId" = s."id"
      LEFT JOIN "Booking" b ON b."id" = a."bookingId"
      ${whereClause}
      GROUP BY s."id"
      ORDER BY s."name" ASC
    `;
    return query(sql);
  }
  static async getStaffById(id) {
    const sql = `
      SELECT 
        s.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a."id",
              'bookingId', a."bookingId",
              'staffId', a."staffId",
              'role', a."role",
              'notes', a."notes",
              'assignedAt', a."assignedAt",
              'booking', json_build_object(
                'id', b."id",
                'reference', b."reference",
                'eventName', b."eventName",
                'startDate', b."startDate",
                'status', b."status",
                'customer', json_build_object(
                  'id', c."id",
                  'name', c."name",
                  'phone', c."phone",
                  'email', c."email"
                )
              )
            )
          ) FILTER (WHERE a."id" IS NOT NULL),
          '[]'::json
        ) AS assignments
      FROM "StaffProfile" s
      LEFT JOIN "BookingAssignment" a ON a."staffId" = s."id"
      LEFT JOIN "Booking" b ON b."id" = a."bookingId"
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      WHERE s."id" = $1
      GROUP BY s."id"
    `;
    const staff = await queryOne(sql, [id]);
    if (!staff) {
      throw new Error("Staff profile not found");
    }
    return staff;
  }
  static async createStaff(data) {
    const fields = ["userId", "name", "phone", "email", "roleTitle", "skills", "availabilityStatus", "isActive"];
    const cols = [];
    const vals = [];
    fields.forEach((f) => {
      if (data[f] !== void 0) {
        cols.push(`"${f}"`);
        vals.push(data[f]);
      }
    });
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO "StaffProfile" (${cols.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    return queryOne(sql, vals);
  }
  static async updateStaff(id, data) {
    const fields = ["userId", "name", "phone", "email", "roleTitle", "skills", "availabilityStatus", "isActive"];
    const setClauses = [];
    const vals = [];
    fields.forEach((f) => {
      if (data[f] !== void 0) {
        vals.push(data[f]);
        setClauses.push(`"${f}" = $${vals.length}`);
      }
    });
    if (setClauses.length === 0) {
      return this.getStaffById(id);
    }
    vals.push(id);
    const sql = `UPDATE "StaffProfile" SET ${setClauses.join(", ")} WHERE "id" = $${vals.length} RETURNING *`;
    const updated = await queryOne(sql, vals);
    if (!updated) {
      throw new Error("Staff profile not found");
    }
    return updated;
  }
  static async deleteStaff(id) {
    const deleted = await queryOne(`DELETE FROM "StaffProfile" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error("Staff profile not found");
    }
    return deleted;
  }
};

// server/src/modules/staff/staff.controller.ts
var StaffController = class {
  static async getAll(req, res, next) {
    try {
      const onlyActive = req.query.active === "true";
      const staff = await StaffService.getAllStaff(onlyActive);
      return apiSuccess(res, staff, "Staff profiles fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const staff = await StaffService.getStaffById(req.params.id);
      return apiSuccess(res, staff, "Staff details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const staff = await StaffService.createStaff(req.body);
      return apiSuccess(res, staff, "Staff profile created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const staff = await StaffService.updateStaff(req.params.id, req.body);
      return apiSuccess(res, staff, "Staff profile updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      await StaffService.deleteStaff(req.params.id);
      return apiSuccess(res, null, "Staff profile deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/staff/staff.routes.ts
var router11 = (0, import_express11.Router)();
router11.get("/", authenticate, StaffController.getAll);
router11.get("/:id", authenticate, StaffController.getById);
router11.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), StaffController.create);
router11.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), StaffController.update);
router11.delete("/:id", authenticate, requireRole(["OWNER"]), StaffController.delete);
var staff_routes_default = router11;

// server/src/modules/vendors/vendors.routes.ts
var import_express12 = require("express");

// server/src/modules/vendors/vendors.service.ts
var VendorsService = class {
  static async getAllVendors(params) {
    const { category, search, onlyActive } = params || {};
    const conditions = [];
    const values = [];
    if (onlyActive) {
      conditions.push(`v."isActive" = true`);
    }
    if (category && category !== "ALL") {
      values.push(category);
      conditions.push(`v."category" = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      const sIdx = values.length;
      conditions.push(`(v."businessName" ILIKE $${sIdx} OR v."contactPerson" ILIKE $${sIdx} OR v."phone" ILIKE $${sIdx})`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT 
        v.*,
        (SELECT COUNT(*)::int FROM "BookingAssignment" a WHERE a."vendorId" = v."id") AS "assignmentsCount",
        (SELECT COUNT(*)::int FROM "Expense" e WHERE e."vendorId" = v."id") AS "expensesCount"
      FROM "Vendor" v
      ${whereClause}
      ORDER BY v."businessName" ASC
    `;
    const rows = await query(sql, values);
    return rows.map((r) => ({
      ...r,
      _count: {
        assignments: r.assignmentsCount || 0,
        expenses: r.expensesCount || 0
      }
    }));
  }
  static async getVendorById(id) {
    const vendor = await queryOne(`SELECT * FROM "Vendor" WHERE "id" = $1`, [id]);
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    const assignmentsSql = `
      SELECT 
        a.*,
        json_build_object(
          'id', b."id",
          'reference', b."reference",
          'eventName', b."eventName",
          'startDate', b."startDate",
          'status', b."status"
        ) AS booking
      FROM "BookingAssignment" a
      LEFT JOIN "Booking" b ON b."id" = a."bookingId"
      WHERE a."vendorId" = $1
      ORDER BY a."assignedAt" DESC
    `;
    const assignments = await query(assignmentsSql, [id]);
    const expenses = await query(
      `SELECT * FROM "Expense" WHERE "vendorId" = $1 ORDER BY "expenseDate" DESC`,
      [id]
    );
    return {
      ...vendor,
      assignments,
      expenses
    };
  }
  static async createVendor(data) {
    const fields = ["businessName", "contactPerson", "phone", "email", "category", "servicesSupplied", "agreedRates", "notes", "isActive"];
    const cols = [];
    const vals = [];
    fields.forEach((f) => {
      if (data[f] !== void 0) {
        cols.push(`"${f}"`);
        vals.push(data[f]);
      }
    });
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO "Vendor" (${cols.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    return queryOne(sql, vals);
  }
  static async updateVendor(id, data) {
    const fields = ["businessName", "contactPerson", "phone", "email", "category", "servicesSupplied", "agreedRates", "notes", "isActive"];
    const setClauses = [];
    const vals = [];
    fields.forEach((f) => {
      if (data[f] !== void 0) {
        vals.push(data[f]);
        setClauses.push(`"${f}" = $${vals.length}`);
      }
    });
    if (setClauses.length === 0) {
      return this.getVendorById(id);
    }
    vals.push(id);
    const sql = `UPDATE "Vendor" SET ${setClauses.join(", ")} WHERE "id" = $${vals.length} RETURNING *`;
    const updated = await queryOne(sql, vals);
    if (!updated) {
      throw new Error("Vendor not found");
    }
    return updated;
  }
  static async deleteVendor(id) {
    const deleted = await queryOne(`DELETE FROM "Vendor" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error("Vendor not found");
    }
    return deleted;
  }
};

// server/src/modules/vendors/vendors.controller.ts
var VendorsController = class {
  static async getAll(req, res, next) {
    try {
      const { category, search, active } = req.query;
      const vendors = await VendorsService.getAllVendors({
        category,
        search,
        onlyActive: active === "true"
      });
      return apiSuccess(res, vendors, "Vendors fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const vendor = await VendorsService.getVendorById(req.params.id);
      return apiSuccess(res, vendor, "Vendor details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const vendor = await VendorsService.createVendor(req.body);
      return apiSuccess(res, vendor, "Vendor created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const vendor = await VendorsService.updateVendor(req.params.id, req.body);
      return apiSuccess(res, vendor, "Vendor updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      await VendorsService.deleteVendor(req.params.id);
      return apiSuccess(res, null, "Vendor deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/vendors/vendors.routes.ts
var router12 = (0, import_express12.Router)();
router12.get("/", authenticate, VendorsController.getAll);
router12.get("/:id", authenticate, VendorsController.getById);
router12.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), VendorsController.create);
router12.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), VendorsController.update);
router12.delete("/:id", authenticate, requireRole(["OWNER"]), VendorsController.delete);
var vendors_routes_default = router12;

// server/src/modules/expenses/expenses.routes.ts
var import_express13 = require("express");

// server/src/modules/expenses/expenses.service.ts
var ExpensesService = class {
  static async getAllExpenses(params) {
    const { category, bookingId, vendorId, startDate, endDate, page = 1, limit = 20 } = params || {};
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    if (category && category !== "ALL") {
      values.push(category);
      conditions.push(`e."category" = $${values.length}`);
    }
    if (bookingId) {
      values.push(bookingId);
      conditions.push(`e."bookingId" = $${values.length}`);
    }
    if (vendorId) {
      values.push(vendorId);
      conditions.push(`e."vendorId" = $${values.length}`);
    }
    if (startDate) {
      values.push(new Date(startDate));
      conditions.push(`e."expenseDate" >= $${values.length}`);
    }
    if (endDate) {
      values.push(new Date(endDate));
      conditions.push(`e."expenseDate" <= $${values.length}`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countRes = await queryOne(
      `SELECT COUNT(*)::int AS count FROM "Expense" e ${whereClause}`,
      values
    );
    const total = countRes?.count || 0;
    const categoryAggregates = await query(
      `SELECT e."category", COALESCE(SUM(e."amount"), 0)::double precision AS total FROM "Expense" e ${whereClause} GROUP BY e."category"`,
      values
    );
    const totalExpenseAmount = categoryAggregates.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const dataParams = [...values];
    dataParams.push(limit);
    dataParams.push(offset);
    const limitIdx = dataParams.length - 1;
    const offsetIdx = dataParams.length;
    const dataSql = `
      SELECT 
        e.*,
        CASE WHEN b."id" IS NOT NULL THEN json_build_object('id', b."id", 'reference', b."reference", 'eventName', b."eventName") ELSE NULL END AS booking,
        CASE WHEN v."id" IS NOT NULL THEN json_build_object('id', v."id", 'businessName', v."businessName", 'contactPerson', v."contactPerson") ELSE NULL END AS vendor,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Expense" e
      LEFT JOIN "Booking" b ON b."id" = e."bookingId"
      LEFT JOIN "Vendor" v ON v."id" = e."vendorId"
      LEFT JOIN "User" u ON u."id" = e."recordedByUserId"
      ${whereClause}
      ORDER BY e."expenseDate" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
    const expenses = await query(dataSql, dataParams);
    return {
      expenses,
      categoryBreakdown: categoryAggregates.map((c) => ({
        category: c.category,
        total: Number(c.total) || 0
      })),
      totalExpenseAmount,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  static async getExpenseById(id) {
    const sql = `
      SELECT 
        e.*,
        CASE WHEN b."id" IS NOT NULL THEN row_to_json(b.*) ELSE NULL END AS booking,
        CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END AS vendor,
        CASE WHEN u."id" IS NOT NULL THEN json_build_object('id', u."id", 'name', u."name") ELSE NULL END AS "recordedBy"
      FROM "Expense" e
      LEFT JOIN "Booking" b ON b."id" = e."bookingId"
      LEFT JOIN "Vendor" v ON v."id" = e."vendorId"
      LEFT JOIN "User" u ON u."id" = e."recordedByUserId"
      WHERE e."id" = $1
    `;
    const expense = await queryOne(sql, [id]);
    if (!expense) {
      throw new Error("Expense not found");
    }
    return expense;
  }
  static async createExpense(data, userId) {
    const expenseDate = data.expenseDate ? new Date(data.expenseDate) : /* @__PURE__ */ new Date();
    const recordedByUserId = userId || null;
    const fields = ["category", "description", "amount", "expenseDate", "bookingId", "vendorId", "paymentMethod", "receiptUrl", "recordedByUserId"];
    const insertData = {
      ...data,
      expenseDate,
      recordedByUserId
    };
    const cols = [];
    const vals = [];
    fields.forEach((f) => {
      if (insertData[f] !== void 0) {
        cols.push(`"${f}"`);
        vals.push(insertData[f]);
      }
    });
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO "Expense" (${cols.join(", ")}) VALUES (${placeholders}) RETURNING "id"`;
    const created = await queryOne(sql, vals);
    if (!created) throw new Error("Failed to create expense");
    return this.getExpenseById(created.id);
  }
  static async updateExpense(id, data) {
    const fields = ["category", "description", "amount", "expenseDate", "bookingId", "vendorId", "paymentMethod", "receiptUrl"];
    const setClauses = [];
    const vals = [];
    fields.forEach((f) => {
      if (data[f] !== void 0) {
        const val = f === "expenseDate" ? new Date(data[f]) : data[f];
        vals.push(val);
        setClauses.push(`"${f}" = $${vals.length}`);
      }
    });
    if (setClauses.length === 0) {
      return this.getExpenseById(id);
    }
    vals.push(id);
    const sql = `UPDATE "Expense" SET ${setClauses.join(", ")} WHERE "id" = $${vals.length} RETURNING *`;
    const updated = await queryOne(sql, vals);
    if (!updated) {
      throw new Error("Expense not found");
    }
    return updated;
  }
  static async deleteExpense(id) {
    const deleted = await queryOne(`DELETE FROM "Expense" WHERE "id" = $1 RETURNING *`, [id]);
    if (!deleted) {
      throw new Error("Expense not found");
    }
    return deleted;
  }
};

// server/src/modules/expenses/expenses.schema.ts
var import_zod10 = require("zod");
var createExpenseSchema = import_zod10.z.object({
  category: import_zod10.z.enum([
    "DECORATION_MATERIALS",
    "FLOWERS",
    "LIGHTING_SOUND",
    "LABOUR",
    "PHOTOGRAPHY",
    "CATERING",
    "TRANSPORTATION",
    "STALL_SETUP",
    "EQUIPMENT_RENTAL",
    "OTHER"
  ]),
  description: import_zod10.z.string().min(2, "Description is required"),
  amount: import_zod10.z.number().positive("Amount must be positive"),
  expenseDate: import_zod10.z.string().or(import_zod10.z.date()).optional(),
  bookingId: import_zod10.z.string().optional().nullable(),
  vendorId: import_zod10.z.string().optional().nullable(),
  paymentMethod: import_zod10.z.enum(["CASH", "UPI", "BANK_TRANSFER", "OTHER"]).default("CASH"),
  receiptUrl: import_zod10.z.string().optional().nullable()
});
var updateExpenseSchema = createExpenseSchema.partial();

// server/src/modules/expenses/expenses.controller.ts
var ExpensesController = class {
  static async getAll(req, res, next) {
    try {
      const { category, bookingId, vendorId, startDate, endDate, page, limit } = req.query;
      const result = await ExpensesService.getAllExpenses({
        category,
        bookingId,
        vendorId,
        startDate,
        endDate,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });
      return apiSuccess(res, result.expenses, "Expenses fetched successfully", 200, {
        ...result.meta,
        categoryBreakdown: result.categoryBreakdown,
        totalExpenseAmount: result.totalExpenseAmount
      });
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const expense = await ExpensesService.getExpenseById(req.params.id);
      return apiSuccess(res, expense, "Expense details fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const validatedData = createExpenseSchema.parse(req.body);
      const expense = await ExpensesService.createExpense(validatedData, req.user?.id);
      return apiSuccess(res, expense, "Expense recorded successfully", 201);
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const validatedData = updateExpenseSchema.parse(req.body);
      const expense = await ExpensesService.updateExpense(req.params.id, validatedData);
      return apiSuccess(res, expense, "Expense updated successfully");
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      await ExpensesService.deleteExpense(req.params.id);
      return apiSuccess(res, null, "Expense deleted successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/expenses/expenses.routes.ts
var router13 = (0, import_express13.Router)();
router13.get("/", authenticate, ExpensesController.getAll);
router13.get("/:id", authenticate, ExpensesController.getById);
router13.post("/", authenticate, requireRole(["OWNER", "MANAGER"]), ExpensesController.create);
router13.patch("/:id", authenticate, requireRole(["OWNER", "MANAGER"]), ExpensesController.update);
router13.delete("/:id", authenticate, requireRole(["OWNER"]), ExpensesController.delete);
var expenses_routes_default = router13;

// server/src/modules/calendar/calendar.routes.ts
var import_express14 = require("express");

// server/src/modules/calendar/calendar.service.ts
var CalendarService = class {
  static async getEvents(month, year) {
    const currentYear = year || (/* @__PURE__ */ new Date()).getFullYear();
    const currentMonth = month !== void 0 ? month : (/* @__PURE__ */ new Date()).getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const bufferStart = new Date(startOfMonth.getTime() - 7 * 24 * 60 * 60 * 1e3);
    const bufferEnd = new Date(endOfMonth.getTime() + 7 * 24 * 60 * 60 * 1e3);
    const bookingsSql = `
      SELECT 
        b.*,
        json_build_object('name', c."name", 'phone', c."phone") AS customer,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a."id",
              'bookingId', a."bookingId",
              'staffId', a."staffId",
              'vendorId', a."vendorId",
              'role', a."role",
              'notes', a."notes",
              'assignedAt', a."assignedAt",
              'staff', CASE WHEN s."id" IS NOT NULL THEN row_to_json(s.*) ELSE NULL END,
              'vendor', CASE WHEN v."id" IS NOT NULL THEN row_to_json(v.*) ELSE NULL END
            )
          ) FILTER (WHERE a."id" IS NOT NULL),
          '[]'::json
        ) AS assignments
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      LEFT JOIN "BookingAssignment" a ON a."bookingId" = b."id"
      LEFT JOIN "StaffProfile" s ON s."id" = a."staffId"
      LEFT JOIN "Vendor" v ON v."id" = a."vendorId"
      WHERE b."startDate" >= $1 AND b."startDate" <= $2
      GROUP BY b."id", c."name", c."phone"
      ORDER BY b."startDate" ASC
    `;
    const bookings = await query(bookingsSql, [bufferStart, bufferEnd]);
    const followUpsSql = `
      SELECT 
        n.*,
        json_build_object(
          'id', e."id",
          'reference', e."reference",
          'eventType', e."eventType",
          'eventTitle', e."eventTitle",
          'customer', json_build_object('id', c."id", 'name', c."name", 'phone', c."phone")
        ) AS enquiry
      FROM "EnquiryNote" n
      JOIN "Enquiry" e ON e."id" = n."enquiryId"
      JOIN "Customer" c ON c."id" = e."customerId"
      WHERE n."followUpDate" >= $1 AND n."followUpDate" <= $2
      ORDER BY n."followUpDate" ASC
    `;
    const followUps = await query(followUpsSql, [startOfMonth, endOfMonth]);
    const dateMap = {};
    const conflicts = [];
    bookings.forEach((b) => {
      const dateStr = new Date(b.startDate).toISOString().split("T")[0];
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = [];
      }
      dateMap[dateStr].push(b.id);
    });
    Object.entries(dateMap).forEach(([dateStr, bkgIds]) => {
      if (bkgIds.length > 1) {
        const conflictBookings = bookings.filter((b) => bkgIds.includes(b.id));
        conflicts.push({
          date: dateStr,
          bookingIds: bkgIds,
          eventNames: conflictBookings.map((b) => b.eventName)
        });
      }
    });
    return {
      month: currentMonth,
      year: currentYear,
      bookings,
      followUps,
      conflicts
    };
  }
};

// server/src/modules/calendar/calendar.controller.ts
var CalendarController = class {
  static async getEvents(req, res, next) {
    try {
      const { month, year } = req.query;
      const events = await CalendarService.getEvents(
        month !== void 0 ? Number(month) : void 0,
        year !== void 0 ? Number(year) : void 0
      );
      return apiSuccess(res, events, "Calendar events fetched successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/calendar/calendar.routes.ts
var router14 = (0, import_express14.Router)();
router14.get("/events", authenticate, CalendarController.getEvents);
var calendar_routes_default = router14;

// server/src/modules/reports/reports.routes.ts
var import_express15 = require("express");

// server/src/utils/csv.ts
var sanitizeCsvField = (value) => {
  if (value === null || value === void 0) return '""';
  let str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  str = str.replace(/"/g, '""');
  return `"${str}"`;
};
var generateCsv = (headers, rows) => {
  const headerLine = headers.map(sanitizeCsvField).join(",");
  const rowLines = rows.map((row) => row.map(sanitizeCsvField).join(","));
  return [headerLine, ...rowLines].join("\r\n");
};

// server/src/modules/reports/reports.service.ts
var ReportsService = class {
  static async getOverviewReports(startDate, endDate) {
    const values = [];
    let enquiryDateCond = "";
    let bookingDateCond = "";
    let paymentDateCond = "";
    let expenseDateCond = "";
    if (startDate || endDate) {
      if (startDate && endDate) {
        values.push(new Date(startDate), new Date(endDate));
        enquiryDateCond = `AND e."createdAt" >= $1 AND e."createdAt" <= $2`;
        bookingDateCond = `AND b."startDate" >= $1 AND b."startDate" <= $2`;
        paymentDateCond = `AND p."paymentDate" >= $1 AND p."paymentDate" <= $2`;
        expenseDateCond = `AND ex."expenseDate" >= $1 AND ex."expenseDate" <= $2`;
      } else if (startDate) {
        values.push(new Date(startDate));
        enquiryDateCond = `AND e."createdAt" >= $1`;
        bookingDateCond = `AND b."startDate" >= $1`;
        paymentDateCond = `AND p."paymentDate" >= $1`;
        expenseDateCond = `AND ex."expenseDate" >= $1`;
      } else if (endDate) {
        values.push(new Date(endDate));
        enquiryDateCond = `AND e."createdAt" <= $1`;
        bookingDateCond = `AND b."startDate" <= $1`;
        paymentDateCond = `AND p."paymentDate" <= $1`;
        expenseDateCond = `AND ex."expenseDate" <= $1`;
      }
    }
    const [
      totalEnquiriesRes,
      convertedEnquiriesRes,
      totalBookingsRes,
      completedBookingsRes,
      payments,
      expenses,
      categoryPopularity
    ] = await Promise.all([
      queryOne(`SELECT COUNT(*)::int AS count FROM "Enquiry" e WHERE 1=1 ${enquiryDateCond}`, values),
      queryOne(`SELECT COUNT(*)::int AS count FROM "Enquiry" e WHERE e."status" = 'CONVERTED' ${enquiryDateCond}`, values),
      queryOne(`SELECT COUNT(*)::int AS count FROM "Booking" b WHERE 1=1 ${bookingDateCond}`, values),
      queryOne(`SELECT COUNT(*)::int AS count FROM "Booking" b WHERE b."status" = 'COMPLETED' ${bookingDateCond}`, values),
      query(
        `SELECT p."amount", p."paymentType", p."paymentMethod" FROM "Payment" p WHERE p."status" = 'PAID' ${paymentDateCond}`,
        values
      ),
      query(
        `SELECT ex."amount", ex."category" FROM "Expense" ex WHERE 1=1 ${expenseDateCond}`,
        values
      ),
      query(
        `SELECT 
           sc."name",
           (
             SELECT COUNT(*)::int 
             FROM "BookingService" bs 
             JOIN "Service" s ON s."id" = bs."serviceId" 
             WHERE s."categoryId" = sc."id"
           ) AS "bookingsCount"
         FROM "ServiceCategory" sc
         ORDER BY sc."sortOrder" ASC`
      )
    ]);
    const totalEnquiries = totalEnquiriesRes?.count || 0;
    const convertedEnquiries = convertedEnquiriesRes?.count || 0;
    const totalBookings = totalBookingsRes?.count || 0;
    const completedBookings = completedBookingsRes?.count || 0;
    const totalRevenue = payments.reduce(
      (sum, p) => p.paymentType === "REFUND" ? sum - Number(p.amount) : sum + Number(p.amount),
      0
    );
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const conversionRate = totalEnquiries > 0 ? (convertedEnquiries / totalEnquiries * 100).toFixed(1) : "0";
    const paymentMethods = payments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
      return acc;
    }, {});
    const expenseCategories = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});
    return {
      summary: {
        totalEnquiries,
        convertedEnquiries,
        conversionRate: `${conversionRate}%`,
        totalBookings,
        completedBookings,
        totalRevenue,
        totalExpenses,
        netProfit
      },
      paymentMethods,
      expenseCategories,
      categoryPopularity: categoryPopularity.map((c) => ({
        name: c.name,
        bookingsCount: Number(c.bookingsCount) || 0
      }))
    };
  }
  static async exportBookingsCsv() {
    const sql = `
      SELECT 
        b.*,
        json_build_object('name', c."name", 'phone', c."phone") AS customer,
        COALESCE(
          (
            SELECT json_agg(json_build_object('amount', p."amount", 'status', p."status", 'paymentType', p."paymentType"))
            FROM "Payment" p WHERE p."bookingId" = b."id"
          ),
          '[]'::json
        ) AS payments
      FROM "Booking" b
      LEFT JOIN "Customer" c ON c."id" = b."customerId"
      ORDER BY b."startDate" DESC
    `;
    const bookings = await query(sql);
    const headers = [
      "Booking Reference",
      "Event Name",
      "Event Type",
      "Start Date",
      "End Date",
      "Customer Name",
      "Customer Phone",
      "Venue",
      "City",
      "Status",
      "Total Amount (INR)",
      "Paid Amount (INR)",
      "Balance (INR)"
    ];
    const rows = bookings.map((b) => {
      const payments = Array.isArray(b.payments) ? b.payments : [];
      const paid = payments.filter((p) => p.status === "PAID").reduce((sum, p) => p.paymentType === "REFUND" ? sum - Number(p.amount) : sum + Number(p.amount), 0);
      const balance = Math.max(0, Number(b.finalAmount) - paid);
      return [
        b.reference,
        b.eventName,
        b.eventType,
        new Date(b.startDate).toISOString().split("T")[0],
        b.endDate ? new Date(b.endDate).toISOString().split("T")[0] : "",
        b.customer?.name || "",
        b.customer?.phone || "",
        b.venueName || "",
        b.venueCity || "",
        b.status,
        b.finalAmount,
        paid,
        balance
      ];
    });
    return generateCsv(headers, rows);
  }
  static async exportPaymentsCsv() {
    const sql = `
      SELECT 
        p.*,
        json_build_object('name', c."name", 'phone', c."phone") AS customer,
        json_build_object('reference', b."reference", 'eventName', b."eventName") AS booking
      FROM "Payment" p
      LEFT JOIN "Customer" c ON c."id" = p."customerId"
      LEFT JOIN "Booking" b ON b."id" = p."bookingId"
      ORDER BY p."paymentDate" DESC
    `;
    const payments = await query(sql);
    const headers = [
      "Receipt Number",
      "Date",
      "Customer Name",
      "Phone",
      "Booking Reference",
      "Event Name",
      "Payment Type",
      "Payment Method",
      "Transaction Reference",
      "Amount (INR)",
      "Status"
    ];
    const rows = payments.map((p) => [
      p.receiptNumber,
      new Date(p.paymentDate).toISOString().split("T")[0],
      p.customer?.name || "",
      p.customer?.phone || "",
      p.booking?.reference || "",
      p.booking?.eventName || "",
      p.paymentType,
      p.paymentMethod,
      p.reference || "",
      p.amount,
      p.status
    ]);
    return generateCsv(headers, rows);
  }
  static async exportExpensesCsv() {
    const sql = `
      SELECT 
        ex.*,
        json_build_object('reference', b."reference") AS booking,
        json_build_object('businessName', v."businessName") AS vendor
      FROM "Expense" ex
      LEFT JOIN "Booking" b ON b."id" = ex."bookingId"
      LEFT JOIN "Vendor" v ON v."id" = ex."vendorId"
      ORDER BY ex."expenseDate" DESC
    `;
    const expenses = await query(sql);
    const headers = [
      "Expense ID",
      "Date",
      "Category",
      "Description",
      "Amount (INR)",
      "Payment Method",
      "Booking Reference",
      "Vendor Name"
    ];
    const rows = expenses.map((e) => [
      e.id,
      new Date(e.expenseDate).toISOString().split("T")[0],
      e.category,
      e.description,
      e.amount,
      e.paymentMethod,
      e.booking?.reference || "",
      e.vendor?.businessName || ""
    ]);
    return generateCsv(headers, rows);
  }
};

// server/src/modules/reports/reports.controller.ts
var ReportsController = class {
  static async getOverview(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const reports = await ReportsService.getOverviewReports(
        startDate,
        endDate
      );
      return apiSuccess(res, reports, "Reports data fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async exportBookingsCsv(req, res, next) {
    try {
      const csvData = await ReportsService.exportBookingsCsv();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="sathuragiri-bookings-report.csv"');
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
  static async exportPaymentsCsv(req, res, next) {
    try {
      const csvData = await ReportsService.exportPaymentsCsv();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="sathuragiri-payments-report.csv"');
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
  static async exportExpensesCsv(req, res, next) {
    try {
      const csvData = await ReportsService.exportExpensesCsv();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="sathuragiri-expenses-report.csv"');
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/reports/reports.routes.ts
var router15 = (0, import_express15.Router)();
router15.get("/overview", authenticate, requireRole(["OWNER", "MANAGER"]), ReportsController.getOverview);
router15.get("/export/bookings", authenticate, requireRole(["OWNER", "MANAGER"]), ReportsController.exportBookingsCsv);
router15.get("/export/payments", authenticate, requireRole(["OWNER", "MANAGER"]), ReportsController.exportPaymentsCsv);
router15.get("/export/expenses", authenticate, requireRole(["OWNER", "MANAGER"]), ReportsController.exportExpensesCsv);
var reports_routes_default = router15;

// server/src/modules/notifications/notifications.routes.ts
var import_express16 = require("express");

// server/src/modules/notifications/notifications.service.ts
var NotificationsService = class {
  static async getNotifications(limit = 30) {
    const unreadRes = await queryOne(
      `SELECT COUNT(*)::int AS count FROM "Notification" WHERE "isRead" = false`
    );
    const unreadCount = unreadRes?.count || 0;
    const notifications = await query(
      `SELECT * FROM "Notification" ORDER BY "createdAt" DESC LIMIT $1`,
      [limit]
    );
    return {
      unreadCount,
      notifications
    };
  }
  static async markAsRead(id) {
    const updated = await queryOne(
      `UPDATE "Notification" SET "isRead" = true WHERE "id" = $1 RETURNING *`,
      [id]
    );
    return updated;
  }
  static async markAllAsRead() {
    const updated = await query(
      `UPDATE "Notification" SET "isRead" = true WHERE "isRead" = false RETURNING *`
    );
    return { count: updated.length };
  }
};

// server/src/modules/notifications/notifications.controller.ts
var NotificationsController = class {
  static async getAll(req, res, next) {
    try {
      const data = await NotificationsService.getNotifications();
      return apiSuccess(res, data, "Notifications fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async markAsRead(req, res, next) {
    try {
      await NotificationsService.markAsRead(req.params.id);
      return apiSuccess(res, null, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }
  static async markAllAsRead(req, res, next) {
    try {
      await NotificationsService.markAllAsRead();
      return apiSuccess(res, null, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/notifications/notifications.routes.ts
var router16 = (0, import_express16.Router)();
router16.get("/", authenticate, NotificationsController.getAll);
router16.patch("/:id/read", authenticate, NotificationsController.markAsRead);
router16.patch("/read-all", authenticate, NotificationsController.markAllAsRead);
var notifications_routes_default = router16;

// server/src/modules/settings/settings.routes.ts
var import_express17 = require("express");

// server/src/modules/settings/settings.controller.ts
var SettingsController = class {
  static async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.getSettings();
      return apiSuccess(res, settings, "Business settings fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  static async updateSettings(req, res, next) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      return apiSuccess(res, settings, "Business settings updated successfully");
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/settings/settings.routes.ts
var router17 = (0, import_express17.Router)();
router17.get("/", SettingsController.getSettings);
router17.patch("/", authenticate, requireRole(["OWNER"]), SettingsController.updateSettings);
var settings_routes_default = router17;

// server/src/modules/uploads/uploads.routes.ts
var import_express18 = require("express");

// server/src/modules/uploads/uploads.controller.ts
var import_multer = __toESM(require("multer"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var uploadDir = import_path.default.resolve(process.cwd(), "uploads");
if (!import_fs.default.existsSync(uploadDir)) {
  import_fs.default.mkdirSync(uploadDir, { recursive: true });
}
var storage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = import_path.default.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `decor-${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/svg+xml"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP, and SVG image files are allowed."));
  }
};
var upload = (0, import_multer.default)({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB limit
});
var UploadsController = class {
  static async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return apiError(res, "No file uploaded", 400);
      }
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      return apiSuccess(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        "File uploaded successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }
  static async uploadMultiple(req, res, next) {
    try {
      if (!req.files || Array.isArray(req.files) && req.files.length === 0) {
        return apiError(res, "No files uploaded", 400);
      }
      const files = req.files;
      const urls = files.map((file) => ({
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
      return apiSuccess(res, { files: urls }, "Files uploaded successfully", 201);
    } catch (error) {
      next(error);
    }
  }
};

// server/src/modules/uploads/uploads.routes.ts
var router18 = (0, import_express18.Router)();
router18.post("/single", upload.single("image"), UploadsController.uploadSingle);
router18.post("/multiple", authenticate, upload.array("images", 10), UploadsController.uploadMultiple);
var uploads_routes_default = router18;

// server/src/app.ts
import_dotenv2.default.config();
var app = (0, import_express19.default)();
app.use(
  (0, import_helmet.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
var clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  (0, import_cors.default)({
    origin: [
      clientUrl,
      "https://decorations-five.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);
app.use(import_express19.default.json({ limit: "10mb" }));
app.use(import_express19.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, import_cookie_parser.default)());
if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
  app.use((0, import_morgan.default)("dev"));
}
var uploadDir2 = import_path2.default.resolve(process.cwd(), "uploads");
app.use("/uploads", import_express19.default.static(uploadDir2));
app.get(["/health", "/api/health", "/api", "/api/index"], (req, res) => {
  return apiSuccess(
    res,
    {
      status: "UP",
      application: "Sathuragiri Decoration API",
      business: "Sathuragiri Decoration",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    },
    "API is running healthy"
  );
});
var apiV1 = import_express19.default.Router();
apiV1.use("/auth", auth_routes_default);
apiV1.use("/dashboard", dashboard_routes_default);
apiV1.use("/services", services_routes_default);
apiV1.use("/packages", packages_routes_default);
apiV1.use("/portfolio", portfolio_routes_default);
apiV1.use("/enquiries", enquiries_routes_default);
apiV1.use("/bookings", bookings_routes_default);
apiV1.use("/quotations", quotations_routes_default);
apiV1.use("/payments", payments_routes_default);
apiV1.use("/customers", customers_routes_default);
apiV1.use("/staff", staff_routes_default);
apiV1.use("/vendors", vendors_routes_default);
apiV1.use("/expenses", expenses_routes_default);
apiV1.use("/calendar", calendar_routes_default);
apiV1.use("/reports", reports_routes_default);
apiV1.use("/notifications", notifications_routes_default);
apiV1.use("/settings", settings_routes_default);
apiV1.use("/uploads", uploads_routes_default);
app.use("/api/v1", apiV1);
app.use("/v1", apiV1);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found.`
  });
});
app.use(errorHandler);
var app_default = app;

// server/src/vercel.ts
var vercel_default = app_default;
module.exports = app_default;
