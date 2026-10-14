import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';

export interface Env {
  DB: D1Database; ASSETS: Fetcher; APP_URL: string;
  BETTER_AUTH_SECRET?: string; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string;
}
export function configured(env: Env) { return !!(env.BETTER_AUTH_SECRET && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET); }
export function createAuth(env: Env) {
  return betterAuth({
    database: env.DB,
    baseURL: env.APP_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.APP_URL],
    socialProviders: { google: { clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! } },
    account: { accountLinking: { enabled: false } },
    databaseHooks: { user: { create: { before: async (user) => {
      const invited = await env.DB.prepare('SELECT email FROM admin_invites WHERE email = ?').bind(user.email).first();
      if (!user.emailVerified || !invited) throw new APIError('FORBIDDEN', { message: 'Dieses Google-Konto ist nicht als Admin eingeladen.' });
      return { data: user };
    } } } },
    session: { expiresIn: 60 * 60 * 24, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, window: 60, max: 20 }
  });
}
