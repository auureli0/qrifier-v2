import { pgTable, text, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
			
export const user = pgTable("user", {
					id: text("id").primaryKey(),
					name: text('name').notNull(),
 email: text('email').notNull().unique(),
 emailVerified: boolean('email_verified').notNull(),
 image: text('image'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull()
				});

export const session = pgTable("session", {
					id: text("id").primaryKey(),
					expiresAt: timestamp('expires_at').notNull(),
 token: text('token').notNull().unique(),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull(),
 ipAddress: text('ip_address'),
 userAgent: text('user_agent'),
 userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
				});

export const account = pgTable("account", {
					id: text("id").primaryKey(),
					accountId: text('account_id').notNull(),
 providerId: text('provider_id').notNull(),
 userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
 accessToken: text('access_token'),
 refreshToken: text('refresh_token'),
 idToken: text('id_token'),
 accessTokenExpiresAt: timestamp('access_token_expires_at'),
 refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
 scope: text('scope'),
 password: text('password'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull()
				});

export const verification = pgTable("verification", {
					id: text("id").primaryKey(),
					identifier: text('identifier').notNull(),
 value: text('value').notNull(),
 expiresAt: timestamp('expires_at').notNull(),
 createdAt: timestamp('created_at'),
 updatedAt: timestamp('updated_at')
				});

export const qrCode = pgTable("qr_code", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  formId: text("form_id").references(() => form.id, { onDelete: "set null" }),
  color: text("color").notNull().default("#000000"),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  size: integer("size").notNull().default(200),
  logoUrl: text("logo_url"),
  scans: integer("scans").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
});

export const form = pgTable("form", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'feedback' oder 'complaint'
  components: json("components").notNull(),
  active: boolean("active").notNull().default(true),
  responses: integer("responses").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
});

export const formResponse = pgTable("form_response", {
  id: text("id").primaryKey(),
  formId: text("form_id").notNull().references(() => form.id, { onDelete: "cascade" }),
  qrCodeId: text("qr_code_id").references(() => qrCode.id, { onDelete: "set null" }),
  data: json("data").notNull(),
  createdAt: timestamp("created_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent")
});
