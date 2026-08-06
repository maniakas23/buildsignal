import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { Empty } from "@/components/ui-custom/EngineStates";

interface SearchFacet {
  key: string;
  label: string;
  options: { value: string; count: number }[];
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [facets, setFacets] = useState<SearchFacet[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Stub search — real search connects to tRPC
    setResults([]);
    setFacets([]);
  }, [query, activeFilters]);

  const toggleFilter = (facetKey: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[facetKey] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [facetKey]: updated };
    });
  };

  const clearFilters = () => setActiveFilters({});

  return (
    <div className="min-h-screen bg-wash-primary pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-ink-primary">Search</h1>
          <p className="mt-2 text-base text-ink-secondary">
            Search across all opportunities, signals, and projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-ink-primary flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                {Object.keys(activeFilters).length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {facets.map(facet => (
                <div key={facet.key} className="mb-4">
                  <p className="text-sm font-medium text-ink-primary mb-2">{facet.label}</p>
                  <div className="space-y-1">
                    {facet.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleFilter(facet.key, opt.value)}
                        className={`flex items-center justify-between w-full text-sm px-2 py-1 rounded ${
                          (activeFilters[facet.key] || []).includes(opt.value)
                            ? "bg-accent-indigo/10 text-accent-indigo"
                            : "text-ink-secondary hover:bg-wash-secondary"
                        }`}
                      >
                        <span>{opt.value}</span>
                        <span className="text-xs text-ink-tertiary">{opt.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {facets.length === 0 && (
                <p className="text-sm text-ink-tertiary">No filters available</p>
              )}
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" />
              <Input
                className="pl-10"
                placeholder="Search opportunities..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-indigo" />
              </div>
            ) : results.length === 0 ? (
              <Empty variant="default" title="No results" message="Try adjusting your search or filters" />
            ) : (
              <div className="space-y-3">
                {results.map((result: any) => (
                  <Card key={result.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-ink-primary">{result.title}</h3>
                        <p className="text-sm text-ink-secondary mt-1">{result.description}</p>
                        <div className="flex gap-2 mt-2">
                          {result.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
