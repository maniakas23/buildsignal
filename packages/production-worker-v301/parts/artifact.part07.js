leCountyDetail(db, input);
        break;
      case "pattern.list":
        result = await handlePatternList(db, input);
        break;
      case "notification.history":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleNotificationHistory(db, jwtPayload.sub, input);
        break;
      case "notification.markRead":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleNotificationMarkRead(db, jwtPayload.sub, input);
        break;
      case "notification.markAllRead":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleNotificationMarkAllRead(db, jwtPayload.sub);
        break;
      case "watchlist.list":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleWatchlistList(db, jwtPayload.sub, input);
        break;
      case "watchlist.create":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleWatchlistCreate(db, jwtPayload.sub, input);
        break;
      case "watchlist.delete":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleWatchlistDelete(db, jwtPayload.sub, input);
        break;
      case "search.search":
        result = await handleSearchSearch(db, input);
        break;
      case "search.recentSearches":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleSearchRecent(db, jwtPayload.sub, input);
        break;
      case "search.recent":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleSearchRecent(db, jwtPayload.sub, input);
        break;
      case "search.facets":
        result = await handleSearchFacets(db);
        break;
      case "brief.today":
        result = await handleBriefToday(db);
        break;
      case "analytics.healthScore":
        result = await handleAnalyticsHealth(db);
        break;
      case "billing.config":
        result = await handleBillingConfig();
        break;
      case "recommendation.list":
        result = await handleRecommendationList(db, input);
        break;
      case "recommendation.summary":
        result = await handleRecommendationSummary(db);
        break;
      case "provider.summary":
        result = await handleProviderSummary(db);
        break;
      case "stripe.getSubscription":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleStripeGetSubscription(env2, input, db, jwtPayload.sub);
        break;
      case "stripe.createCheckout":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleStripeCreateCheckout(env2, input, db, jwtPayload.sub);
        break;
      case "billing.createCheckout":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleStripeCreateCheckout(env2, input, db, jwtPayload.sub);
        break;
      case "stripe.createPortal":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleStripeCreatePortal(env2, input, db, jwtPayload.sub);
        break;
      case "auth.me":
        result = await handleAuthMe(db, token, env2.JWT_SECRET);
        break;
      case "auth.register":
        result = await handleAuthRegister(db, env2, input, clientIP);
        break;
      case "auth.login":
        result = await handleAuthLogin(db, env2, input, clientIP);
        break;
      case "trial.start":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        {
          const trialResult = await startTrial(db, jwtPayload.sub);
          if (trialResult.error === "User not found") {
            result = trpcError(trialResult.error, "NOT_FOUND");
          } else if (trialResult.error) {
            result = trpcError(trialResult.error, "CONFLICT");
          } else {
            result = trpcResult(trialResult);
          }
        }
        break;
      case "trial.status":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = trpcResult(await getTrialStatus(db, jwtPayload.sub));
        break;
      case "alert.list":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleAlertList(db, jwtPayload.sub);
        break;
      case "alert.create":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleAlertCreate(db, jwtPayload.sub, input);
        break;
      case "alert.delete":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = await handleAlertDelete(db, jwtPayload.sub, input);
        break;
      case "entitlements.get":
        if (!jwtPayload) {
          result = trpcError("Unauthorized", "UNAUTHORIZED");
          break;
        }
        result = trpcResult(await getUserEntitlements(db, jwtPayload.sub));
        break;
            // === PHASE 2: ALIASES ===
      case "billing.plans":
        result = await handleBillingConfig(db);
        break;
      case "stripe.plans":
        result = await handleBillingConfig(db);
        break;
      case "stripe.createCheckoutSession": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleStripeCreateCheckout(env2, input, db, jwtPayload.sub);
        break;
      }
      case "stripe.createBillingPortalSession": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleStripeCreatePortal(db, jwtPayload.sub, input, env2);
        break;
      }
      case "email.list": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleNotificationGetPrefs(db, jwtPayload.sub);
        break;
      }
      // === PHASE 3: NOTIFICATION HANDLERS ===
      case "notification.delete": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleNotificationDelete(db, jwtPayload.sub, input);
        break;
      }
      case "notification.getPrefs": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleNotificationGetPrefs(db, jwtPayload.sub);
        break;
      }
      case "notification.updatePrefs": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleNotificationUpdatePrefs(db, jwtPayload.sub, input);
        break;
      }
      // === PHASE 4: RECOMMENDATION HANDLERS ===
      case "recommendation.act": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleRecommendationAct(db, jwtPayload.sub, input);
        break;
      }
      case "recommendation.dismiss": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleRecommendationDismiss(db, jwtPayload.sub, input);
        break;
      }
      case "recommendation.save": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleRecommendationSave(db, jwtPayload.sub, input);
        break;
      }
      // === PHASE 5: WATCHLIST UPDATE ===
      case "watchlist.update": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleWatchlistUpdate(db, jwtPayload.sub, input);
        break;
      }
      // === PHASE 6: STRIPE CANCELLATION ===
      case "stripe.cancelSubscription": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleStripeCancelSubscription(db, jwtPayload.sub, env2);
        break;
      }
      // === PHASE 7: BILLING HISTORY ===
      case "billing.history": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleBillingHistory(db, jwtPayload.sub, env2);
        break;
      }
      // === PHASE 8: BILLING USAGE ===
      case "billing.usage": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = await handleBillingUsage(db, jwtPayload.sub);
        break;
      }
      // === PHASE 9: STALE PROCEDURES ===
      case "watchlist.checkAlerts": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        result = trpcResult({ checked: true, message: "Alerts are matched automatically when new events arrive." });
        break;
      }
      case "roadmap.list":
        result = trpcResult({ items: [], total: 0, message: "Roadmap temporarily unavailable." });
        break;
      case "roadmap.submit": {
        if (!jwtPayload) { result = trpcError("Unauthorized", "UNAUTHORIZED"); break; }
        r