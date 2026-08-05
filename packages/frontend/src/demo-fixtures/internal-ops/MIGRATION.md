# Internal Operations Dashboard — Migration Guide

## Overview

The internal ops dashboard was refactored from a monolithic component to a modular architecture using Zustand for state management and tRPC for data fetching.

## Migration Steps

1. Replace direct API calls with tRPC hooks
2. Use `opsStore` for local UI state (filters, sorting, view mode)
3. Use tRPC queries for server state (metrics, alerts, deployments)
4. Implement optimistic updates for mutations

## Key Changes

- `opsDashboard.tsx` → Main container component
- `opsStore.fixture.ts` → Zustand store for UI state
- tRPC routers → `ops.*` namespace for all operations data

## File Structure

```
internal-ops/
  MIGRATION.md
  opsDashboard.tsx       # Main container
  opsStore.fixture.ts    # Zustand store
```
