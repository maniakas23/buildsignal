import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="what-is">
                <AccordionTrigger>What is BuildSignal?</AccordionTrigger>
                <AccordionContent>
                  BuildSignal is a commercial intelligence platform that helps construction companies discover and track project opportunities.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-works">
                <AccordionTrigger>How does it work?</AccordionTrigger>
                <AccordionContent>
                  BuildSignal aggregates data from multiple sources, analyzes it for patterns, and delivers actionable recommendations to your team.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="plans">
                <AccordionTrigger>What plans are available?</AccordionTrigger>
                <AccordionContent>
                  We offer four plans: Scout ($99/month), Professional ($249/month), Business ($599/month), and Enterprise (custom pricing).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="data-security">
                <AccordionTrigger>How is my data secured?</AccordionTrigger>
                <AccordionContent>
                  BuildSignal uses TLS 1.3 encryption, role-based access control (RBAC), and audit logging. All data is processed at Cloudflare Edge for minimal latency and maximum security.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="compliance">
                <AccordionTrigger>Is BuildSignal compliant?</AccordionTrigger>
                <AccordionContent>
                  BuildSignal has implemented privacy compliance policies. Security audits are planned but not yet completed. We are working toward formal certifications.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gdpr">
                <AccordionTrigger>GDPR compliance?</AccordionTrigger>
                <AccordionContent>
                  BuildSignal has privacy compliance policies in place. We are evaluating full GDPR compliance as part of our security audit program.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account & Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="cancel">
                <AccordionTrigger>How do I cancel?</AccordionTrigger>
                <AccordionContent>
                  You can cancel your subscription at any time from your account settings. Your access will continue until the end of your billing period.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund">
                <AccordionTrigger>Refund policy?</AccordionTrigger>
                <AccordionContent>
                  We offer a 14-day money-back guarantee for all paid plans. Contact support for refund requests.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="upgrade">
                <AccordionTrigger>How do I upgrade?</AccordionTrigger>
                <AccordionContent>
                  You can upgrade your plan at any time from the billing page. The price difference will be prorated.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="api">
                <AccordionTrigger>Is there an API?</AccordionTrigger>
                <AccordionContent>
                  Yes, the Business and Enterprise plans include API access with webhook support.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="integrations">
                <AccordionTrigger>What integrations are available?</AccordionTrigger>
                <AccordionContent>
                  BuildSignal supports SSO/SAML, webhook notifications, and CSV/JSON exports. Custom integrations are available for Enterprise customers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support">
                <AccordionTrigger>How do I contact support?</AccordionTrigger>
                <AccordionContent>
                  Professional and higher plans include priority support. All users can submit feedback through the feedback form.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HelpPage;
