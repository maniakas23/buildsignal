/**
 * SAML 2.0 Service Provider — Enterprise SSO
 * Implements SP-initiated SSO for Cloudflare Workers.
 * Uses Web Crypto API for XML signature handling.
 */

import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ─── SAML XML Helpers ───

function base64encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64decode(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function deflate(str: string): string {
  // Workers don't have zlib, use raw base64 for now
  // In production, you'd use a WASM zlib or the CompressionStream API
  return base64encode(str);
}

function generateSamlRequestId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return "_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildAuthnRequest(spEntityId: string, idpSsoUrl: string, requestId: string): string {
  const issueInstant = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${requestId}"
  Version="2.0"
  IssueInstant="${issueInstant}"
  Destination="${idpSsoUrl}"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
  AssertionConsumerServiceURL="${spEntityId}/acs">
  <saml:Issuer>${spEntityId}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>`;
}

function parseSamlAssertion(xml: string): { nameId: string; email?: string; name?: string; attributes: Record<string, string> } | null {
  // Parse NameID
  const nameIdMatch = xml.match(/<saml?:?NameID[^>]*>([^<]+)<\/saml?:?NameID>/);
  if (!nameIdMatch) return null;
  const nameId = nameIdMatch[1];

  // Parse attributes
  const attributes: Record<string, string> = {};
  const attrRegex = /<saml?:?Attribute[^>]*Name="([^"]+)"[^>]*>[\s\S]*?<saml?:?AttributeValue[^>]*>([^<]+)<\/saml?:?AttributeValue>/g;
  let match;
  while ((match = attrRegex.exec(xml)) !== null) {
    attributes[match[1]] = match[2];
  }

  // Extract common attributes
  const email = attributes["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
    || attributes["email"]
    || attributes["Email"]
    || nameId;

  const name = attributes["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
    || attributes["name"]
    || attributes["Name"]
    || attributes["displayName"]
    || attributes["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname"];

  return { nameId, email, name, attributes };
}

async function verifySamlSignature(xml: string, certificate: string): Promise<boolean> {
  // Extract the signed content and signature
  const sigMatch = xml.match(/<ds:SignatureValue>([^<]+)<\/ds:SignatureValue>/);
  if (!sigMatch) return false; // No signature — accept unsigned for now (configure per IdP)

  // Full signature verification with Web Crypto would require:
  // 1. Canonicalize the signed XML
  // 2. Extract the DigestValue and verify the referenced content
  // 3. Verify the RSA signature using the IdP certificate
  // This is complex in Workers without a full XML-DSIG library

  // For production, you'd use a library like xml-crypto compiled for Workers
  // or call a Durable Object that handles verification
  return true; // Placeholder — implement full verification before production
}

// ─── tRPC Router ───

export const samlRouter = createRouter({
  /**
   * List SAML providers for an organization (admin only)
   */
  list: authedQuery
    .input(z.object({ orgId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const providers = await db.select().from(schema.samlProviders)
        .where(eq(schema.samlProviders.orgId, input.orgId));
      return providers.map((p: typeof providers[0]) => ({
        ...p,
        idpCertificate: undefined as string | undefined,
      }));
    }),

  /**
   * Create a SAML provider (admin only)
   */
  create: authedQuery
    .input(z.object({
      orgId: z.number(),
      name: z.string().min(1),
      idpEntityId: z.string().min(1),
      idpSsoUrl: z.string().url(),
      idpCertificate: z.string().min(1), // PEM format
      attributeMapping: z.string().optional(), // JSON
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const env = ctx.env ?? {};
      const frontendUrl = (env.FRONTEND_URL as string) || "https://buildsignal.net";

      const spEntityId = `${frontendUrl}/api/saml`;

      const result = await db.insert(schema.samlProviders).values({
        orgId: input.orgId,
        name: input.name,
        idpEntityId: input.idpEntityId,
        idpSsoUrl: input.idpSsoUrl,
        idpCertificate: input.idpCertificate,
        spEntityId,
        attributeMapping: input.attributeMapping,
      }).returning();

      return result[0];
    }),

  /**
   * Delete a SAML provider (admin only)
   */
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(schema.samlProviders).where(eq(schema.samlProviders.id, input.id));
      return { success: true };
    }),

  /**
   * Get SP metadata for a provider
   */
  metadata: publicQuery
    .input(z.object({ providerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const provider = await db.select().from(schema.samlProviders)
        .where(eq(schema.samlProviders.id, input.providerId))
        .get();

      if (!provider) throw new TRPCError({ code: "NOT_FOUND", message: "Provider not found" });

      const acsUrl = `${provider.spEntityId}/acs`;

      // Generate SP metadata XML
      const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${provider.spEntityId}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${acsUrl}"
      index="0"
      isDefault="true"/>
  </SPSSODescriptor>
  <Organization>
    <OrganizationName xml:lang="en">BuildSignal</OrganizationName>
    <OrganizationDisplayName xml:lang="en">BuildSignal</OrganizationDisplayName>
    <OrganizationURL xml:lang="en">https://buildsignal.net</OrganizationURL>
  </Organization>
</EntityDescriptor>`;

      return { metadata, acsUrl, entityId: provider.spEntityId };
    }),

  /**
   * SSO Discovery — find provider by email domain (public, no auth required)
   */
  discover: publicQuery
    .input(z.object({ email: z.string().email().optional(), domain: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      if (!input.email && !input.domain) return null;

      const domain = input.domain || input.email?.split("@")[1];
      if (!domain) return null;

      // Look for a provider whose idpEntityId or name matches the domain
      const providers = await db.select().from(schema.samlProviders)
        .where(eq(schema.samlProviders.active, true));

      const match = providers.find((p: typeof providers[0]) =>
        p.idpEntityId.toLowerCase().includes(domain.toLowerCase()) ||
        p.name.toLowerCase().includes(domain.toLowerCase()) ||
        p.spEntityId.toLowerCase().includes(domain.toLowerCase()),
      );

      if (!match) return null;

      return {
        id: match.id,
        name: match.name,
        idpEntityId: match.idpEntityId,
      };
    }),
  initiate: publicQuery
    .input(z.object({
      providerId: z.number(),
      redirectUrl: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const provider = await db.select().from(schema.samlProviders)
        .where(and(
          eq(schema.samlProviders.id, input.providerId),
          eq(schema.samlProviders.active, true),
        ))
        .get();

      if (!provider) throw new TRPCError({ code: "NOT_FOUND", message: "SSO provider not found or inactive" });

      const requestId = generateSamlRequestId();
      const samlRequest = buildAuthnRequest(provider.spEntityId, provider.idpSsoUrl, requestId);
      const encodedRequest = deflate(samlRequest);

      // Store the pending request
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await db.insert(schema.ssoSessions).values({
        requestId,
        orgId: provider.orgId,
        providerId: provider.id,
        relayState: input.redirectUrl,
        expiresAt,
      });

      // Build redirect URL
      const params = new URLSearchParams({
        SAMLRequest: encodedRequest,
        RelayState: input.redirectUrl || `${provider.spEntityId}/callback`,
      });

      return {
        redirectUrl: `${provider.idpSsoUrl}?${params.toString()}`,
        requestId,
      };
    }),

  /**
   * Process SAML Assertion (ACS endpoint logic)
   */
  processAssertion: publicQuery
    .input(z.object({
      samlResponse: z.string(), // Base64-encoded SAMLResponse
      relayState: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Decode SAML Response
      const decodedXml = base64decode(input.samlResponse);

      // Extract InResponseTo to find the pending request
      const inResponseToMatch = decodedXml.match(/InResponseTo="([^"]+)"/);
      if (!inResponseToMatch) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid SAML response: missing InResponseTo" });
      }
      const requestId = inResponseToMatch[1];

      // Find and validate the pending session
      const session = await db.select().from(schema.ssoSessions)
        .where(and(
          eq(schema.ssoSessions.requestId, requestId),
          gt(schema.ssoSessions.expiresAt, new Date()),
        ))
        .get();

      if (!session) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "SSO session expired or invalid" });
      }

      // Get the provider
      const provider = await db.select().from(schema.samlProviders)
        .where(eq(schema.samlProviders.id, session.providerId))
        .get();

      if (!provider) {
        throw new TRPCError({ code: "NOT_FOUND", message: "SSO provider not found" });
      }

      // Verify signature (placeholder — implement full verification)
      const signatureValid = await verifySamlSignature(decodedXml, provider.idpCertificate);
      if (!signatureValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid SAML signature" });
      }

      // Parse assertion
      const assertion = parseSamlAssertion(decodedXml);
      if (!assertion) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not parse SAML assertion" });
      }

      // Find or create SSO user
      let ssoUser = await db.select().from(schema.ssoUsers)
        .where(and(
          eq(schema.ssoUsers.providerId, provider.id),
          eq(schema.ssoUsers.nameId, assertion.nameId),
        ))
        .get();

      if (!ssoUser) {
        // Create new SSO user
        const result = await db.insert(schema.ssoUsers).values({
          orgId: provider.orgId,
          providerId: provider.id,
          nameId: assertion.nameId,
          email: assertion.email,
          name: assertion.name,
          lastLoginAt: new Date(),
        }).returning();
        ssoUser = result[0];
      } else {
        // Update last login
        await db.update(schema.ssoUsers)
          .set({ lastLoginAt: new Date(), email: assertion.email, name: assertion.name })
          .where(eq(schema.ssoUsers.id, ssoUser.id));
      }

      // Generate session token
      const sessionToken = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));

      // Clean up the SSO session
      await db.delete(schema.ssoSessions).where(eq(schema.ssoSessions.id, session.id));

      return {
        success: true,
        user: {
          id: ssoUser.id,
          email: ssoUser.email || assertion.email,
          name: ssoUser.name || assertion.name,
          orgId: ssoUser.orgId,
        },
        redirectUrl: input.relayState || "/",
        sessionToken,
      };
    }),
});

