import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ExportsPage() {
  const [format, setFormat] = useState("");
  const [entityType, setEntityType] = useState("");
  const [name, setName] = useState("");

  const handleExport = () => {
    if (!format || !entityType || !name.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success("Export job created");
    setFormat("");
    setEntityType("");
    setName("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Exports</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Export name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Entity Type</label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opportunities">Opportunities</SelectItem>
                  <SelectItem value="counties">Counties</SelectItem>
                  <SelectItem value="providers">Providers</SelectItem>
                  <SelectItem value="recommendations">Recommendations</SelectItem>
                  <SelectItem value="watchlists">Watchlists</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} className="w-full">
              Create Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No exports yet</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExportsPage;
