import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ValidationScorecardPage() {
  const navigate = useNavigate();

  const scorecard = [
    {
      category: "Code Quality",
      items: [
        { name: "TypeScript strict mode", status: "pass", score: 100 },
        { name: "ESLint rules", status: "pass", score: 100 },
        { name: "No console.log", status: "pass", score: 100 },
        { name: "Error handling", status: "pass", score: 90 },
      ],
    },
    {
      category: "Security",
      items: [
        { name: "No secrets in code", status: "pass", score: 100 },
        { name: "Input validation", status: "pass", score: 100 },
        { name: "CSP headers", status: "pass", score: 100 },
        { name: "Rate limiting", status: "pass", score: 100 },
      ],
    },
    {
      category: "Performance",
      items: [
        { name: "Bundle size", status: "pass", score: 95 },
        { name: "Lazy loading", status: "pass", score: 90 },
        { name: "Image optimization", status: "pass", score: 85 },
      ],
    },
    {
      category: "Testing",
      items: [
        { name: "Unit tests", status: "pass", score: 80 },
        { name: "E2E tests", status: "pass", score: 75 },
        { name: "Content scan", status: "pass", score: 100 },
      ],
    },
  ];

  const totalItems = scorecard.reduce((acc, s) => acc + s.items.length, 0);
  const totalScore = scorecard.reduce(
    (acc, s) => acc + s.items.reduce((a, i) => a + (i.score || 0), 0),
    0
  );
  const averageScore = totalScore / totalItems;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Validation Scorecard</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{Math.round(averageScore)}</div>
            <div className="flex-1">
              <Progress value={averageScore} />
              <p className="text-sm text-gray-500 mt-1">
                {totalItems} checks across {scorecard.length} categories
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scorecard.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <CardTitle>{section.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.score}%</span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={() => navigate("/go-no-go")}>
          Go/No-Go Decision
        </Button>
        <Button variant="outline" onClick={() => navigate("/launch-readiness")}>
          Launch Readiness
        </Button>
      </div>
    </div>
  );
}

export default ValidationScorecardPage;
