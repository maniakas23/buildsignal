import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    // Placeholder search
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Smart Search</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Search opportunities, counties, providers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">No results</p>
          ) : (
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="p-2 border rounded">
                  <p className="font-medium">{result.title}</p>
                  <p className="text-sm text-gray-500">{result.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartSearch;
