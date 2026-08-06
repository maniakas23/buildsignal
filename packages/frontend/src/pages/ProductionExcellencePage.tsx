import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ProductionExcellencePage() {
  const navigate = useNavigate();

  const validations = [
    { name: "Code Quality", status: "pass", score: 100 },
    { name: "Security Scan", status: "warn", detail: "External audits not completed" },
    { name: "Performance", status: "pass", score: 95 },
    { name: "Accessibility", status: "pass", score: 90 },
    { name: "SEO", status: "pass", score: 85 },
    { name: "Build Size", status: "pass", score: 95 },
    { name: "Test Coverage", status: "pass", score: 80 },
    { name: "Documentation", status: "warn", score: 70 },
  ];

  const passCount = validations.filter((v) => v.status === "pass").length;
  const warnCount = validations.filter((v) => v.status === "warn").length;
  const totalScore = validations.reduce((acc, v) => acc + (v.score || 0), 0) / validations.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Production Excellence</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{Math.round(totalScore)}</div>
            <div className="flex-1">
              <Progress value={totalScore} />
              <p className="text-sm text-gray-500 mt-1">
                {passCount} pass, {warnCount} warn
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {validations.map((validation) => (
          <Card key={validation.name}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <p className="font-medium">{validation.name}</p>
                <p className="text-sm text-gray-500">
                  {validation.detail || `Score: ${validation.score}%`}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                validation.status === "pass" ? "bg-green-100 text-green-800" :
                validation.status === "warn" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {validation.status.toUpperCase()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate("/go-no-go")}>
          Go/No-Go Decision
        </Button>
      </div>
    </div>
  );
}

export default ProductionExcellencePage;
