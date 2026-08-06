import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Server, Eye } from "lucide-react";

export function SecurityPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Security</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            BuildSignal is built with security at its core. We protect your data with industry-standard practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Data Encryption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Role-based access control (RBAC) ensures users only see what they need.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Built on Cloudflare Edge for global performance and security. DDoS protection included.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Audit Logging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive audit logs track every action for compliance and security review.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Security Audit Program</span>
                  <span className="text-yellow-600 font-medium">Planned</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Privacy Compliance</span>
                  <span className="text-green-600 font-medium">Policies Implemented</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Consumer Privacy</span>
                  <span className="text-green-600 font-medium">Implemented</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Security Management</span>
                  <span className="text-yellow-600 font-medium">Planned</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Incident Response</span>
                  <span className="text-yellow-600 font-medium">Planned</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
