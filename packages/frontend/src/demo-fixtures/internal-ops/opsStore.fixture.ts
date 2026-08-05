import { create } from "zustand";

interface OpsState {
  viewMode: "grid" | "list";
  sortBy: "date" | "severity" | "status";
  filterStatus: "all" | "active" | "resolved";
  searchQuery: string;
  setViewMode: (mode: "grid" | "list") => void;
  setSortBy: (sort: "date" | "severity" | "status") => void;
  setFilterStatus: (status: "all" | "active" | "resolved") => void;
  setSearchQuery: (query: string) => void;
}

export const useOpsStore = create<OpsState>((set) => ({
  viewMode: "grid",
  sortBy: "date",
  filterStatus: "all",
  searchQuery: "",
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
