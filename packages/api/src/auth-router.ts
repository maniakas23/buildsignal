/**
 * BuildSignal Authentication Router
 * Kimi OAuth 2.0 + session-based authentication
 */

import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { authenticateRequest } from "./kimi/auth";

export const authRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) {
      throw new Error("Not authenticated");
    }
    return {
      id: user.id,
      unionId: user.unionId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      plan: user.plan,
      organizationId: user.orgId,
      workspaceId: user.workspaceId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    // Session is cookie-based; logout is handled client-side by clearing cookie
    return { success: true };
  }),
});
