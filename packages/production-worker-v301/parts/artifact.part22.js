ws.</p>
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
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/entitlements") {
      try {
        const db = env2.DB;
        const userId = url.searchParams.get("userId");
        if (!userId) {
          response = new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const entitlements = await getUserEntitlements(db, userId);
          response = new Response(JSON.stringify({ userId, ...entitlements }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/durham/status") {
      try {
        const status = await fetchDurhamProvider();
        response = new Response(JSON.stringify(status), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/henrico/status") {
      try {
        const status = await fetchHenricoProvider();
        response = new Response(JSON.stringify(status), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else if (path === "/api/v1/alerts/test") {
      try {
        const db = env2.DB;
        const eventId = url.searchParams.get("eventId");
        if (!eventId) {
          response = new Response(JSON.stringify({ error: "eventId required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
        } else {
          const { results } = await d1Query(db, "SELECT * FROM kestovar_canonical_events WHERE canonicalId = ? AND provenance = 'LIVE'", [eventId]);
          if (!results || results.length === 0) {
            response = new Response(JSON.stringify({ error: "Event not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          } else {
            const event = results[0];
            const matches = await matchAlerts(db, event);
            const generated = [];
            for (const config of matches) {
              const alert = await generateAlert(db, event, config);
              const delivery = await deliverAlert(alert, env2);
              generated.push({ alert, delivery });
            }
            response = new Response(JSON.stringify({ eventId, matches: matches.length, generated }), { headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
          }
        }
      } catch (e) {
        response = new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
      }
    } else {
      response = new Response(JSON.stringify({ error: "Not found", path }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
    }
  } catch (err) {
    console.error("[ERROR] " + err.message + ":", err.stack);
    response = new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again later." }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders(origin, env2) } });
  }
  if (response.headers && !response.headers.has("Access-Control-Allow-Origin")) {
    response = mergeHeaders(response, corsHeaders(origin, env2));
  }
  response = mergeHeaders(response, securityHeaders());
  const latency = Date.now() - start;
  console.log(JSON.stringify({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    requestId,
    route: path,
    method: req.method,
    status: response.status,
    latency,
    ip: clientIP,
    userAgent: req.headers.get("User-Agent")?.substring(0, 100) || ""
  }));
  const nh = new Headers(response.headers);
  for (const [k, v] of Object.entries(securityHeaders())) {
    if (!nh.has(k)) nh.set(k, v);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: nh });
}
__name(handleRequest, "handleRequest");
__name2(handleRequest, "handleRequest");
var buildsignal_worker_phase8_default = {
  async fetch(req, env2, ctx) {
    try {
      return await handleRequest(req, env2, ctx);
    } catch (err) {
      console.error("[FATAL] " + err.message + ":", err.stack);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json", ...securityHeaders() } });
    }
  },
  async scheduled(event, env2, ctx) {
    const cronTimestamp = event.scheduledTime || Date.now();
    console.log(`[CRON] Scheduler triggered at ${new Date(cronTimestamp).toISOString()}`);
    try {
      const db = env2.DB;
      const result = await runSchedulerCron(db, cronTimes