# BuildSignal

**Version:** 1.1.9  
**Build:** 122 (Baseline Established)  
**Status:** Launch Sprint COMPLETE — Ready for Live Customers  
**Live:** [buildsignal.net](https://buildsignal.net)

---

## Overview

BuildSignal is an infrastructure intelligence product built on the Kestovar shared AI platform. It provides customers with infrastructure recommendations, reports, and dashboards powered by cross-platform intelligence.

**BuildSignal is now focused on customer acquisition.** The repository governance work (Builds 119–122) is complete. The goal is to acquire the first 25 active customers while improving the product from real customer feedback. See [LAUNCH_SPRINT.md](./LAUNCH_SPRINT.md) for the full strategy.

**Architecture remains frozen.** Kestovar continues as the shared AI platform. Parcel Lead Pro continues as the secondary product. BuildSignal remains the customer-facing production application.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Kestovar Platform                        │
│         (Shared AI — Intelligence, Recommendations)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BuildSignal                          │
│  ┌─────────────┐      ┌─────────────┐      ┌────────────┐  │
│  │  Frontend   │──────▶│ API Worker  │──────▶│  Kestovar  │  │
│  │  (React)    │      │ (tRPC/D1)   │      │  Binding   │  │
│  └─────────────┘      └─────────────┘      └────────────┘  │
│                              │                               │
│                              ▼                               │
│                       ┌─────────────┐                        │
│                       │   Stripe    │                        │
│                       │  (Billing)  │                        │
│                       └─────────────┘                        │
