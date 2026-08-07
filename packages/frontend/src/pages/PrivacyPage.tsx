import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Mail,
  Database,
  Eye,
  Share2,
  Clock,
  UserCheck,
  Cookie,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/ui-custom/Footer";

export function PrivacyPage() {
  const navigate = useNavigate();

  const lastUpdated = "January 15, 2025";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                BuildSignal (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                platform, website, and services (collectively, the
                &quot;Services&quot;). Please read this policy carefully. By using our
                Services, you agree to the practices described in this Privacy
                Policy.
              </p>
            </CardContent>
          </Card>

          {/* 1. Information We Collect */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                1. Information We Collect
              </h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Account Information</h3>
                  <p className="text-sm text-muted-foreground">
                    When you create an account, we collect your name, email
                    address, company name, and billing information. This
                    information is necessary to provide our Services and
                    communicate with you.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Usage Data</h3>
                  <p className="text-sm text-muted-foreground">
                    We collect information about how you interact with our
                    platform, including pages visited, features used, search
                    queries, reports generated, and alert configurations. This
                    helps us improve our Services and personalize your
                    experience.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">
                    Device and Log Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We automatically collect device information such as IP
                    address, browser type, operating system, and access times.
                    This data is used for security, analytics, and
                    troubleshooting.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">
                    Third-Party Integrations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    If you connect third-party services (e.g., Salesforce,
                    Slack, HubSpot), we collect the data necessary to enable
                    those integrations, in accordance with the permissions you
                    grant.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                2. How We Use Your Information
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Provide and maintain Services:
                      </strong>{" "}
                      To operate our platform, process transactions, and
                      deliver the intelligence reports and alerts you request.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Improve our platform:
                      </strong>{" "}
                      To analyze usage patterns, fix bugs, develop new features,
                      and enhance the accuracy of our predictions.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Communicate with you:
                      </strong>{" "}
                      To send service notifications, billing reminders,
                      security alerts, and marketing communications (with your
                      consent).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Security and compliance:
                      </strong>{" "}
                      To detect fraud, prevent abuse, comply with legal
                      obligations, and enforce our Terms of Service.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 3. Data Sharing */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                3. How We Share Your Information
              </h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  We do not sell your personal information. We may share your
                  data in the following limited circumstances:
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Service providers:
                      </strong>{" "}
                      We work with trusted third-party vendors (e.g., cloud
                      hosting, payment processing, analytics) who are bound by
                      confidentiality agreements and only process data on our
                      behalf.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Legal requirements:
                      </strong>{" "}
                      We may disclose information if required by law, court
                      order, or governmental authority, or to protect our rights,
                      property, or safety.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Business transfers:
                      </strong>{" "}
                      In the event of a merger, acquisition, or sale of assets,
                      your information may be transferred as part of the
                      transaction, subject to the same privacy commitments.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 4. Data Retention */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">4. Data Retention</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as your account
                  is active or as needed to provide you with our Services. After
                  account closure, we retain certain data for legal, tax, and
                  security purposes in accordance with applicable laws. Aggregated
                  and anonymized data may be retained indefinitely for analytics
                  and model improvement.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 5. Your Rights */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">5. Your Privacy Rights</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Depending on your location, you may have the following rights
                  regarding your personal data:
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">Access:</strong>{" "}
                      Request a copy of the personal data we hold about you.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Correction:
                      </strong>{" "}
                      Update or correct inaccurate personal information.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">Deletion:</strong>{" "}
                      Request deletion of your personal data, subject to legal
                      retention requirements.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">
                        Portability:
                      </strong>{" "}
                      Receive your data in a structured, machine-readable
                      format.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      <strong className="text-foreground">Opt-out:</strong>{" "}
                      Unsubscribe from marketing communications at any time.
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  To exercise any of these rights, please contact us at{" "}
                  <a
                    href="mailto:privacy@buildsignal.net"
                    className="text-primary hover:underline"
                  >
                    privacy@buildsignal.net
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 6. Cookies */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                6. Cookies and Tracking
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to remember your
                  preferences, authenticate your sessions, analyze traffic, and
                  personalize content. You can manage cookie preferences through
                  your browser settings. Disabling cookies may affect the
                  functionality of our Services.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 7. Security */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">7. Security</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including
                  TLS 1.3 encryption in transit, AES-256 encryption at rest,
                  regular security audits, and SOC 2 Type II compliance. While
                  we take reasonable precautions, no system is completely
                  secure. We encourage you to use strong passwords and enable
                  two-factor authentication.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 8. Children's Privacy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                8. Children&apos;s Privacy
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our Services are not intended for individuals under the age
                  of 18. We do not knowingly collect personal information from
                  children. If you believe we have inadvertently collected data
                  from a minor, please contact us immediately and we will
                  promptly delete it.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 9. Changes to This Policy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                9. Changes to This Policy
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of material changes via email or through a
                  prominent notice on our platform. Your continued use of the
                  Services after changes take effect constitutes acceptance of
                  the revised policy.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 10. Contact */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                10. Contact Us
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this
                  Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:privacy@buildsignal.net"
                      className="text-primary hover:underline"
                    >
                      privacy@buildsignal.net
                    </a>
                  </p>
                  <p>
                    <strong>Address:</strong> BuildSignal, San Francisco, CA
                  </p>
                  <p>
                    <strong>Support:</strong>{" "}
                    <a
                      href="mailto:support@buildsignal.net"
                      className="text-primary hover:underline"
                    >
                      support@buildsignal.net
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
