nsecutiveFailures, totalPolls FROM provider_polling_schedule ORDER BY providerId"),
          d1Query(db, "SELECT providerId, status, recordsObserved, recordsCreated, startedAt FROM ingestion_runs ORDER BY startedAt DESC LIMIT 5"),
          d1Query(db, "SELECT event, COUNT(*) as cnt FROM conversion_events WHERE createdAt >= datetime('now', '-7 days') GROUP BY event ORDER BY cnt DESC"),
          d1Query(db, "SELECT plan, COUNT(*) as cnt FROM users GROUP BY plan"),
          d1Query(db, "SELECT trialStatus, COUNT(*) as cnt FROM users WHERE trialStatus IS NOT NULL AND trialStatus <> 'none' GROUP BY trialStatus"),
          d1Query(db, "SELECT event, COUNT(*) as cnt FROM subscription_events WHERE createdAt >= datetime('now', '-30 days') GROUP BY event ORDER BY cnt DESC"),
          d1Query(db, "SELECT COUNT(*) as cnt FROM alert_config")
        ]);
        response = new Response(JSON.stringify({
          data: {
            canonicalEvents: canonicalCount.results?.[0]?.cnt || 0,
            legacyEvents: 135,
            patterns: patternCount.results?.[0]?.cnt || 0,
            opportunities: oppCount.results?.[0]?.cnt || 0,
            recommendations: recCount.results?.[0]?.cnt || 0,
            evidence: evidenceCount.results?.[0]?.cnt || 0
          },
          commercial: {
            usersByPlan: (userPlans.results || []).map((r) => ({ plan: r.plan, count: r.cnt })),
            trials: (trialStats.results || []).map((r) => ({ status: r.trialStatus, count: r.cnt })),
            subscriptions: (subEvents.results || []).map((r) => ({ event: r.event, count: r.cnt })),
            alertConfigs: alertConfigs.results?.[0]?.cnt || 0
          },
          providers: (providerHealth.results || []).map((p) => ({
            providerId: p.providerId,
            status: p.lastPollStatus,
            health: p.consecutiveFailures > 2 ? "suspended" : p.consecutiveFailures > 0 ? "degraded" : "healthy",
            consecutiveSuccesses: p.consecutiveSuccesses,
            consecutiveFailures: p.consecutiveFailures,
            totalPolls: p.totalPolls
          })),
          recentIngestion: recentIngestion.results || [],
          conversion: conversionStats.results || [],
          version: "1.6.0",
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/privacy") {
      const html = `<!DOCTYPE html><html><head><title>Privacy Policy - BuildSignal</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333}h1{color:#111}h2{color:#444;margin-top:30px}</style></head><body>
<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> August 13, 2026</p>
<h2>1. Information We Collect</h2>
<p>BuildSignal collects information you provide directly (name, email, company) and information generated through your use of the service (search queries, watchlists, alert preferences).</p>
<h2>2. How We Use Information</h2>
<p>We use your information to provide construction intelligence services, process payments, send alerts, and improve our platform.</p>
<h2>3. Data Sharing</h2>
<p>We do not sell your personal data. We share data only with service providers necessary to operate the platform (Stripe for payments, Cloudflare for hosting).</p>
<h2>4. Data Retention</h2>
<p>We retain account data for as long as your account is active. You may request deletion by contacting support@buildsignal.net.</p>
<h2>5. Your Rights</h2>
<p>Under GDPR, you have the right to access, rectify, erase, and port your data. Contact us at privacy@buildsignal.net.</p>
<h2>6. Cookies</h2>
<p>We use essential cookies for authentication and optional analytics cookies. You may disable analytics cookies in your browser.</p>
<h2>7. Contact</h2>
<p>BuildSignal, Inc.<br>privacy@buildsignal.net</p>
</body></html>`;
      response = new Response(html, { headers: { "Content-Type": "text/html", ...corsHeaders(origin, env2) } });
    } else if (path === "/terms") {
      const html = `<!DOCTYPE html><html><head><title>Terms of Service - BuildSignal</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333}h1{color:#111}h2{color:#444;margin-top:30px}</style></head><body>
<h1>Terms of Service</h1>
<p><strong>Last updated:</strong> August 13, 2026</p>
<h2>1. Acceptance</h2>
<p>By using BuildSignal, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
<h2>2. Service Description</h2>
<p>BuildSignal provides construction permit intelligence, pattern detection, and market alerts. Data is sourced from public records and third-party providers.</p>
<h2>3. Accounts</h2>
<p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials.</p>
<h2>4. Subscriptions</h2>
<p>Paid subscriptions are billed monthly via Stripe. You may cancel at any time. No refunds for partial months.</p>
<h2>5. Acceptable Use</h2>
<p>You may not use BuildSignal to scrape data at scale, resell raw data, or violate any applicable laws.</p>
<h2>6. Data Accuracy</h2>
<p>BuildSignal sources data from public records. We do not guarantee completeness or accuracy. Verify all data independently before making decisions.</p>
<h2>7. Limitation of Liability</h2>
<p>BuildSignal is not liable for any damages arising from your use of the service. Our liability is limited to the amount you paid in the last 12 months.</p>
<h2>8. Governing Law</h2>
<p>These terms are governed by the laws of the State of North Carolina.</p>
<h2>9. Contact</h2>
<p>BuildSignal, Inc.<br>legal@buildsignal.net</p>
</body></html>`;
      response = new Response(html, { headers: { "Content-Type": "text/html", ...corsHeaders(origin, env2) } });
    } else if (path === "/dpa") {
      const html = `<!DOCTYPE html><html><head><title>Data Processing Agreement - BuildSignal</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333}h1{color:#111}h2{color:#444;margin-top:30px}</style></head><body>
<h1>Data Processing Agreement (DPA)</h1>
<p><strong>Last updated:</strong> August 13, 2026</p>
<h2>1. Parties</h2>
<p>This DPA is between BuildSignal, Inc. ("Processor") and the customer ("Controller").</p>
<h2>2. Scope</h2>
<p>This DPA applies to all personal data processed by BuildSignal on behalf of the Controller in connection with the BuildSignal service.</p>
<h2>3. Data Protection</h2>
<p>BuildSignal implements appropriate technical and organizational measures to protect personal data, including encryption at rest and in transit, access controls, and regular security audits.</p>
<h2>4. Subprocessors</h2>
<p>BuildSignal uses the following subprocessors: Cloudflare (hosting), Stripe (payments), and D1 (database).</p>
<h2>5. Data Subject Rights</h2>
<p>BuildSignal assists the Controller in responding to data subject requests including access, rectification, erasure, and portability.</p>
<h2>6. Breach Notification</h2>
<p>BuildSignal will notify the Controller within 72 hours of becoming aware of any personal data breach.</p>
<h2>7. Contact</h2>
<p>For DPA inquiries: dpa@buildsignal.net</p>
</body></html>`;
      response = new Response(html, { headers: { "Content-Type": "text/html", ...corsHeaders(origin, env2) } });
    } else if (path === "/api/v1/docs") {
      response = await handleApiDocs();
      response = mergeHeaders(response, corsHeaders(origin, env2));
    } else if (path === "/api/v1/trial/start") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const trial = await startTrial(db, userId);
          if (trial.error === "User not found") {
            response = new Response(JSON.stringify({ success: false, error: trial.error }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else if (trial.error) {
            response = new Response(JSON.stringify({ success: false, error: trial.error }), { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            response = new Response(JSON.stringify({ success: true, trial }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/trial/status") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const trial = await getTrialStatus(db, userId);
          const entitlements = await getUserEntitlements(db, userId);
          response = new Response(JSON.stringify({ userId, trial, entitlements }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: