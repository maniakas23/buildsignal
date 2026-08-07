import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Mail,
  CreditCard,
  AlertTriangle,
  Scale,
  Globe,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/ui-custom/Footer";

export function TermsPage() {
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
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
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
                Welcome to BuildSignal. These Terms of Service (&quot;Terms&quot;) govern
                your access to and use of the BuildSignal platform, website,
                APIs, and related services (collectively, the &quot;Services&quot;),
                operated by BuildSignal, Inc. (&quot;BuildSignal&quot;, &quot;we&quot;, &quot;us&quot;, or
                &quot;our&quot;). By accessing or using our Services, you agree to be bound
                by these Terms. If you do not agree, you may not use our
                Services.
              </p>
            </CardContent>
          </Card>

          {/* 1. Acceptance of Terms */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                1. Acceptance of Terms
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By creating an account, accessing, or using our Services, you
                  represent that you are at least 18 years old and have the legal
                  capacity to enter into these Terms. If you are using our
                  Services on behalf of an organization, you represent that you
                  have the authority to bind that organization to these Terms.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 2. Account Registration */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                2. Account Registration and Security
              </h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  To use certain features of our Services, you must register for
                  an account. You agree to:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Provide accurate, current, and complete information during
                      registration.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Maintain the security of your account credentials and
                      promptly notify us of any unauthorized access.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Accept responsibility for all activities that occur under
                      your account.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 3. Subscription and Billing */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                3. Subscription and Billing
              </h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Plans and Pricing</h3>
                  <p className="text-sm text-muted-foreground">
                    BuildSignal offers multiple subscription plans with varying
                    features, limits, and pricing. Plan details and pricing are
                    available on our Pricing page and are subject to change with
                    30 days&apos; notice.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Billing Cycle</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscriptions are billed monthly or annually in advance,
                    depending on your selected billing cycle. All fees are
                    non-refundable except as expressly provided in these Terms
                    or required by law.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Free Trial</h3>
                  <p className="text-sm text-muted-foreground">
                    New paid subscriptions may include a 14-day free trial. At
                    the end of the trial, your subscription will automatically
                    convert to a paid plan unless you cancel before the trial
                    ends. You may cancel anytime during the trial at no charge.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    You authorize us to charge your selected payment method for
                    all applicable fees. If payment fails, we may suspend your
                    account until the outstanding balance is resolved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 4. Cancellation and Termination */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                4. Cancellation and Termination
              </h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Cancellation by You</h3>
                  <p className="text-sm text-muted-foreground">
                    You may cancel your subscription at any time from your
                    Account → Billing settings. Your access will continue until
                    the end of your current billing period. No partial refunds
                    are provided for unused time, except where required by our
                    14-day money-back guarantee policy.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Termination by Us</h3>
                  <p className="text-sm text-muted-foreground">
                    We may suspend or terminate your account immediately if you
                    violate these Terms, engage in fraudulent activity, or if
                    required by law. Upon termination, your right to use the
                    Services ceases immediately, and we may delete your data in
                    accordance with our Privacy Policy.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Money-Back Guarantee</h3>
                  <p className="text-sm text-muted-foreground">
                    If you are not satisfied with our Services, contact us within
                    14 days of your first paid charge for a full refund. This
                    guarantee applies once per customer.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 5. Acceptable Use */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">5. Acceptable Use</h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  You agree not to use our Services to:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Violate any applicable law, regulation, or third-party
                      rights.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Reverse engineer, decompile, or attempt to extract source
                      code from our platform.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Use automated means (bots, scrapers) to access our
                      Services in excess of reasonable use or API rate limits.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Interfere with the integrity or performance of our
                      platform or infrastructure.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span>
                      Resell, redistribute, or sublicense access to our
                      Services without written authorization.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 6. Intellectual Property */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                6. Intellectual Property
              </h2>
            </div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  BuildSignal and its licensors retain all rights, title, and
                  interest in the Services, including all software, algorithms,
                  data models, trademarks, and content. Your use of the Services
                  does not grant you any ownership rights.
                </p>
                <p className="text-sm text-muted-foreground">
                  You retain ownership of any data you upload or create within
                  our platform. By using our Services, you grant us a limited
                  license to process your data solely for the purpose of
                  providing and improving our Services.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 7. Disclaimer of Warranties */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                7. Disclaimer of Warranties
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our Services are provided &quot;as is&quot; and &quot;as available&quot; without
                  warranties of any kind, either express or implied. While we
                  strive for high accuracy, we do not guarantee that our
                  predictions, reports, or data will be error-free, complete, or
                  suitable for any particular purpose. You acknowledge that
                  investment and business decisions based on our intelligence
                  carry inherent risk, and BuildSignal is not responsible for
                  any financial losses or business decisions made using our
                  Services.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 8. Limitation of Liability */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                8. Limitation of Liability
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, BuildSignal and its
                  affiliates, officers, employees, and agents shall not be
                  liable for any indirect, incidental, special, consequential,
                  or punitive damages, including lost profits, data loss, or
                  business interruption, arising out of or related to your use
                  of the Services. Our total liability for any claim arising
                  from these Terms shall not exceed the amount you paid to us
                  in the 12 months preceding the claim.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 9. Indemnification */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">9. Indemnification</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You agree to indemnify and hold harmless BuildSignal and its
                  affiliates, officers, employees, and agents from any claims,
                  damages, losses, liabilities, and expenses (including
                  reasonable attorneys&apos; fees) arising out of your use of the
                  Services, your violation of these Terms, or your infringement
                  of any third-party rights.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 10. Governing Law */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">10. Governing Law</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance
                  with the laws of the State of California, without regard to
                  its conflict of law principles. Any dispute arising from these
                  Terms shall be resolved exclusively in the state or federal
                  courts located in San Francisco County, California. You consent
                  to the personal jurisdiction of such courts.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 11. Changes to Terms */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                11. Changes to These Terms
              </h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may modify these Terms from time to time. Material changes
                  will be communicated via email or a prominent notice on our
                  platform at least 30 days before taking effect. Your continued
                  use of the Services after changes take effect constitutes
                  acceptance of the revised Terms.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 12. Contact */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">12. Contact Us</h2>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:legal@buildsignal.net"
                      className="text-primary hover:underline"
                    >
                      legal@buildsignal.net
                    </a>
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
                  <p>
                    <strong>Address:</strong> BuildSignal, San Francisco, CA
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
