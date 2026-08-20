e LIKE ? OR workClass LIKE ? OR eventType LIKE ? OR status LIKE ? OR providerId LIKE ?) " + (provFilter ? "AND provenance = ?" : "AND provenance = 'LIVE'"), countProvParams);
        totalEvents = countRes.results?.[0]?.cnt || 0;
      } catch (ee) {
        console.error("[search.events]", ee.message);
      }
    }
    if (tl.includes("patterns")) {
      try {
        const { results } = await d1Query(db, "SELECT id, patternType, name, description, county, state, confidence, firstDetectedAt as createdAt FROM signalcore_patterns WHERE provenance = 'LIVE' AND (name LIKE ? OR description LIKE ? OR county LIKE ?) ORDER BY firstDetectedAt DESC LIMIT ? OFFSET ?", [q, q, q, lim, off]);
        all.push(...(results || []).map((r) => ({ ...r, _type: "patterns" })));
        const countRes = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_patterns WHERE provenance = 'LIVE' AND (name LIKE ? OR description LIKE ? OR county LIKE ?)", [q, q, q]);
        totalPatterns = countRes.results?.[0]?.cnt || 0;
      } catch (ee) {
        console.error("[search.patterns]", ee.message);
      }
    }
    if (tl.includes("recommendations")) {
      try {
        const { results } = await d1Query(db, "SELECT id, targetProduct, jurisdiction, confidenceScore, summary, rationale, generatedAt as createdAt FROM signalcore_recommendations WHERE provenance = 'LIVE' AND (targetProduct LIKE ? OR summary LIKE ? OR jurisdiction LIKE ?) ORDER BY generatedAt DESC LIMIT ? OFFSET ?", [q, q, q, lim, off]);
        all.push(...(results || []).map((r) => ({ ...r, _type: "recommendations" })));
        const countRes = await d1Query(db, "SELECT COUNT(*) as cnt FROM signalcore_recommendations WHERE provenance = 'LIVE' AND (targetProduct LIKE ? OR summary LIKE ? OR jurisdiction LIKE ?)", [q, q, q]);
        totalRecs = countRes.results?.[0]?.cnt || 0;
      } catch (ee) {
        console.error("[search.recommendations]", ee.message);
      }
    }
    if (tl.includes("counties")) {
      try {
        const { results } = await d1Query(db, "SELECT id, county, state, healthStatus, coveragePercentage, createdAt FROM counties WHERE county LIKE ? OR state LIKE ? ORDER BY coveragePercentage DESC LIMIT ? OFFSET ?", [q, q, lim, off]);
        all.push(...(results || []).map((r) => ({ ...r, _type: "counties" })));
        const countRes = await d1Query(db, "SELECT COUNT(*) as cnt FROM counties WHERE county LIKE ? OR state LIKE ?", [q, q]);
        totalCounties = countRes.results?.[0]?.cnt || 0;
      } catch (ee) {
        console.error("[search.counties]", ee.message);
      }
    }
    const totals = { events: totalEvents, patterns: totalPatterns, recommendations: totalRecs, counties: totalCounties };
    return trpcResult({ results: all.slice(0, lim), total: all.length, query, types: tl, offset: off, limit: lim, totals, hasMore: off + all.length < totalEvents + totalPatterns + totalRecs + totalCounties });
  } catch (e) {
    console.error("[search.search]", e.message);
    return trpcResult({ results: [], total: 0, query: input.query || "", types: input.types || [] });
  }
}
__name(handleSearchSearch, "handleSearchSearch");
__name2(handleSearchSearch, "handleSearchSearch");
async function handleSearchRecent(db, uid, input) {
  try {
    const { results } = await d1Query(db, "SELECT * FROM search_history WHERE userId=? ORDER BY createdAt DESC LIMIT ?", [uid, (input || {}).limit || 10]);
    return trpcResult(results || []);
  } catch (e) {
    console.error("[search.recent]", e.message);
    return trpcResult([]);
  }
}
__name(handleSearchRecent, "handleSearchRecent");
__name2(handleSearchRecent, "handleSearchRecent");
async function handleSearchFacets(db) {
  try {
    const { results: states } = await d1Query(db, "SELECT state, COUNT(*) as count FROM counties GROUP BY state");
    const { results: eventTypes } = await d1Query(db, "SELECT eventType as type, COUNT(*) as count FROM kestovar_canonical_events GROUP BY eventType");
    const { results: patternTypes } = await d1Query(db, "SELECT patternType as type, COUNT(*) as count FROM signalcore_patterns WHERE provenance = 'LIVE' GROUP BY patternType");
    return trpcResult({ states: states || [], eventTypes: eventTypes || [], patternTypes: patternTypes || [] });
  } catch (e) {
    console.error("[search.facets]", e.message);
    return trpcResult({ states: [], eventTypes: [], patternTypes: [] });
  }
}
__name(handleSearchFacets, "handleSearchFacets");
__name2(handleSearchFacets, "handleSearchFacets");
async function handleBriefToday(db) {
  try {
    const { results: opportunities } = await d1Query(db, "SELECT id, name as label, patternType as type, county, state, confidence as value, description as detail FROM signalcore_patterns WHERE provenance = 'LIVE' AND status='active' ORDER BY confidence DESC LIMIT 5");
    const { results: counties } = await d1Query(db, "SELECT id, county as label, state, healthStatus, coveragePercentage as value, totalEvents as detail FROM counties WHERE healthStatus IN ('active','partial') ORDER BY totalEvents DESC LIMIT 5");
    const { results: providers } = await d1Query(db, "SELECT providerName as label, providerType as type, validationStatus, healthScore as value, lastSync as detail FROM providers ORDER BY healthScore DESC LIMIT 5");
    return trpcResult({ date: (/* @__PURE__ */ new Date()).toISOString(), sections: { opportunities: opportunities || [], counties: counties || [], providers: providers || [], trends: [], meetings: [] } });
  } catch (e) {
    console.error("[brief.today]", e.message);
    return trpcResult({ date: (/* @__PURE__ */ new Date()).toISOString(), sections: { opportunities: [], counties: [], providers: [], trends: [], meetings: [] } });
  }
}
__name(handleBriefToday, "handleBriefToday");
__name2(handleBriefToday, "handleBriefToday");
async function handleAnalyticsHealth(db) {
  try {
    const { results: pr } = await d1Query(db, "SELECT AVG(healthScore) as avg FROM providers");
    const { results: cr } = await d1Query(db, "SELECT AVG(coveragePercentage) as avg FROM counties");
    const ph = Math.round(pr[0].avg || 0);
    const ch = Math.round(cr[0].avg || 0);
    const o = Math.round((ph + ch) / 2);
    return trpcResult({ overall: o, providerHealth: ph, coverageHealth: ch, errorHealth: 0, apiLatency: 45, uptime: 99.9, status: o >= 80 ? "healthy" : o >= 50 ? "degraded" : "critical" });
  } catch (e) {
    console.error("[analytics.health]", e.message);
    return trpcResult({ overall: 0, providerHealth: 0, coverageHealth: 0, errorHealth: 0, apiLatency: 0, uptime: 0, status: "unknown" });
  }
}
__name(handleAnalyticsHealth, "handleAnalyticsHealth");
__name2(handleAnalyticsHealth, "handleAnalyticsHealth");
async function handleBillingConfig() {
  return trpcResult({
    plans: [
        {
          id: "starter",
          name: "Scout",
          description: "Perfect for individual investors",
          price: 99,
          interval: "month",
          features: ["1 County", "3 Alerts/Day", "30-Day History", "Email Support"],
          cta: "Start Free Trial",
          popular: false
        },
        {
          id: "professional",
          name: "Pro",
          description: "For serious investors & small teams",
          price: 249,
          interval: "month",
          features: ["10 Counties", "50 Alerts/Day", "Watchlists", "Basic Analytics", "Priority Support"],
          cta: "Start Free Trial",
          popular: true
        },
        {
          id: "business",
          name: "Business",
          description: "For teams & organizations",
          price: 599,
          interval: "month",
          features: ["All Counties", "Unlimited Alerts", "Advanced Analytics", "SSO", "Dedicated Support"],
          cta: "Contact Sales",
          popular: false
        },
        {
          id: "enterprise",
          name: "Enterprise",
          description: "Custom solutions for large organizations",
          price: 599,
          interval: "month",
          features: ["Custom Coverage", "SLA", "White-Glove Onboarding", "Dedicated Account Manager"],
          cta: "Contact Sales",
          popular: false
        }
      ],
      annual: { framing: "2 months free", monthsFree: 2 },
    trial: { days: 14, noCreditCard: true, cancelAnytime: true },
    payments: { processor: "Stripe" },
    currency: "USD"
  });
}
__name(handleBillingConfig, "handleBillingConfig");
__name2(handleBillingConfig, "handleBillingConfig");
async function handleStripeGetSubscription(env2, input, db, userId) {
  try {
    if (!env2.STRIPE_SECRET_KEY) return trpcResult({ status: "inactive" });
    const cid = input?.customerId;
    if (!cid) return trpcResult({ status: "inactive" });
    if (db && userId) {
      const { results: orgCheck } = await d1Query(db, "SELECT id FROM organizations WHERE ownerUnionId = (SELECT unionId FROM users WHERE id = ?) AND stripeCustomerId = ?", [userId, cid]);
      if (!orgCheck || orgCheck.length === 0) {
        return trpcError("Unauthorized: customer does not belong to user", "UNAUTHORIZED");
      }
    }
    const url = "https://api.stripe.com/v1/customers/" + cid + "/subscriptions?status=all&limit=1";
    const resp = await fetch(url, { headers: { "Authorization": "Bearer " + env2.STRIPE_SECRET_KEY } });
    const data = await resp.json();
    const sub = data.data?.[0];
    const priceId = sub?.items?.data?.[0]?.price?.id;
    const lookupKey = sub?.items?.data?.[0]?.price?.lookup_key;
    const plan = resolvePlanFromPrice(priceId, lookupKey) || null;
    return trpcResult({ status: sub?.status || "inactive", currentPeriodEnd: sub?.current_period_end, cancelAtPeriodEnd: sub?.cancel_at_period_end, plan });
  } catch (e) {
    console.error("[stripe.getSubscription]", e.message);
    return trpcResult({ status: "ina