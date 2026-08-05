import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";

export const governanceRouter = createRouter({
  policies: adminQuery.query(() => ({
    policies: [
      { id: "privacy", name: "Privacy Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "legal" },
      { id: "terms", name: "Terms of Service", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "legal" },
      { id: "data_processing", name: "Data Processing Agreement", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "legal" },
      { id: "security", name: "Security Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "security" },
      { id: "data_governance", name: "Data Governance Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "data" },
      { id: "data_retention", name: "Data Retention Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "data" },
      { id: "incident_response", name: "Incident Response Plan", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "security" },
      { id: "business_continuity", name: "Business Continuity Plan", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "operations" },
      { id: "disaster_recovery", name: "Disaster Recovery Plan", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "operations" },
      { id: "acceptable_use", name: "Acceptable Use Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "legal" },
      { id: "cookie_policy", name: "Cookie Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "legal" },
      { id: "vulnerability_disclosure", name: "Vulnerability Disclosure Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "security" },
      { id: "accessibility", name: "Accessibility Policy", version: "1.0", effectiveDate: "2026-07-18", lastReviewed: "2026-07-18", status: "active" as const, category: "legal" },
    ],
    total: 13,
    byCategory: { legal: 6, security: 3, data: 2, operations: 2 },
    complianceScore: 100,
    nextReview: "2026-10-18",
    framework: "SOC 2 Type II + ISO 27001 aligned",
  })),

  policyDetail: adminQuery
    .input(z.object({ policyId: z.string() }))
    .query(({ input }) => {
      return { content: getPolicyContent(input.policyId) };
    }),

  compliance: adminQuery.query(() => ({
    frameworks: [
      { name: "SOC 2 Type II", status: "in_progress" as const, targetDate: "2026-12-01", controls: 78, completed: 45 },
      { name: "ISO 27001", status: "in_progress" as const, targetDate: "2027-03-01", controls: 114, completed: 62 },
      { name: "GDPR", status: "compliant" as const, targetDate: "2026-07-18", controls: 42, completed: 42 },
      { name: "CCPA", status: "compliant" as const, targetDate: "2026-07-18", controls: 28, completed: 28 },
      { name: "NIST CSF", status: "in_progress" as const, targetDate: "2027-06-01", controls: 108, completed: 55 },
    ],
    overallScore: 72,
    criticalGaps: ["Penetration testing schedule", "Third-party vendor assessment", "BCP tabletop exercise"],
    nextAudit: "2026-10-15",
  })),

  ipAssets: adminQuery.query(() => ({
    trademarks: [
      { name: "Kestovar", status: "in_use" as const, jurisdictions: ["US"], classes: ["SaaS", "Data Analytics"], firstUse: "2026-01-15" },
      { name: "BuildSignal", status: "in_use" as const, jurisdictions: ["US"], classes: ["SaaS", "Construction Intelligence"], firstUse: "2026-03-01" },
      { name: "Parcel Lead Pro", status: "in_use" as const, jurisdictions: ["US"], classes: ["SaaS", "Real Estate"], firstUse: "2026-06-01" },
    ],
    patents: 0,
    copyrights: 24,
    tradeSecrets: 3,
    totalValue: "$2.4M (estimated)",
  })),
});

function getPolicyContent(policyId: string): string | undefined {
  const contents: Record<string, string> = {
    privacy: `SIGNALCORE PRIVACY POLICY
\nEffective Date: July 18, 2026
\n1. INFORMATION WE COLLECT
We collect information that you provide directly, information from your use of our services, and information from third-party sources.
\n2. HOW WE USE INFORMATION
• To provide and improve our services
• To communicate with you
• For security and fraud prevention
• To comply with legal obligations
\n3. DATA SHARING
We do not sell your personal information. We share data only with:
• Service providers (under confidentiality agreements)
• Legal authorities (when required by law)
• Business partners (with your consent)
\n4. DATA SECURITY
We implement industry-standard security measures including encryption, access controls, and regular security audits.
\n5. YOUR RIGHTS
You have the right to access, correct, delete, and export your data. Contact privacy@signalcore.io for data requests.
\n6. DATA RETENTION
We retain data as long as necessary for the purposes described, or as required by law. See our Data Retention Policy for details.
\n7. CONTACT
SignalCore Privacy Team
privacy@signalcore.io
\nData Protection Officer: dpo@signalcore.io`,

    terms: `SIGNALCORE TERMS OF SERVICE
\nEffective Date: July 18, 2026
\n1. ACCEPTANCE OF TERMS
By accessing or using Kestovar services, you agree to these Terms of Service.
\n2. SERVICE DESCRIPTION
Kestovar provides infrastructure intelligence and data analytics services to businesses and organizations.
\n3. USER ACCOUNTS
• You must provide accurate information
• You are responsible for account security
• You must be 18 years or older
\n4. ACCEPTABLE USE
You agree not to:
• Use the service for illegal purposes
• Attempt to access unauthorized data
• Interfere with service operation
• Reverse engineer the platform
\n5. INTELLECTUAL PROPERTY
All content, algorithms, and data structures are the property of SignalCore. You receive a limited license to use the service.
\n6. DATA OWNERSHIP
You retain ownership of your data. SignalCore claims ownership of derived analytics, patterns, and aggregated insights.
\n7. LIMITATION OF LIABILITY
SignalCore's liability is limited to the amount paid for the service in the preceding 12 months.
\n8. TERMINATION
Either party may terminate with 30 days notice. Data export available for 90 days post-termination.
\n9. GOVERNING LAW
These terms are governed by the laws of the State of North Carolina, USA.
\n10. CONTACT
legal@signalcore.io`,

    data_processing: `SIGNALCORE DATA PROCESSING AGREEMENT
\nEffective Date: July 18, 2026
\nThis Data Processing Agreement ("DPA") forms part of the Terms of Service between SignalCore ("Processor") and the Customer ("Controller").
\n1. PROCESSING DETAILS
• Subject matter: Infrastructure intelligence services
• Duration: Term of the agreement
• Nature and purpose: Data analytics and recommendation generation
• Data subjects: End users of the Controller
• Categories of data: Business contact information, usage data, infrastructure project data
\n2. PROCESSOR OBLIGATIONS
• Process data only on documented instructions
• Ensure confidentiality of processing
• Implement appropriate security measures
• Notify Controller of breaches within 24 hours
• Assist with data subject requests
• Maintain records of processing
\n3. SUBPROCESSORS
SignalCore uses the following subprocessors:
• Cloudflare (hosting and CDN)
• Stripe (payment processing)
• Kimi (authentication)
\n4. DATA TRANSFERS
Data is processed in the United States. Standard Contractual Clauses apply for EU data transfers.
\n5. AUDIT RIGHTS
Controller may request audits of Processor's compliance with this DPA with 30 days notice.
\n6. RETURN AND DELETION
Upon termination, Processor will return or delete all Controller data within 30 days, except where retention is required by law.
\nContact: dpa@signalcore.io`,

    security: `SIGNALCORE SECURITY POLICY
\nEffective Date: July 18, 2026
\n1. SECURITY PRINCIPLES
• Defense in depth
• Least privilege access
• Encryption in transit and at rest
• Continuous monitoring
• Regular security assessments
\n2. ACCESS CONTROL
• Role-based access control (RBAC)
• Multi-factor authentication (MFA)
• Regular access reviews
• Immediate revocation on termination
\n3. ENCRYPTION
• TLS 1.3 for all data in transit
• AES-256 for data at rest
• Key rotation every 90 days
\n4. MONITORING
• 24/7 automated threat detection
• Security event logging
• Anomaly detection
• Quarterly penetration testing
\n5. INCIDENT RESPONSE
• 24/7 security monitoring
• Incident response team on call
• Breach notification within 24 hours
• Post-incident review and improvement
\n6. COMPLIANCE
• SOC 2 Type II (in progress)
• ISO 27001 (in progress)
• GDPR compliance
• CCPA compliance
\n7. EMPLOYEE SECURITY
• Background checks for all employees
• Security awareness training
• Confidentiality agreements
• Regular security drills
\n8. THIRD PARTY SECURITY
• Vendor security assessments
• Contractual security requirements
• Regular vendor audits
• Minimum security standards
\n9. SECURE DEVELOPMENT
• Secure coding standards
• Code review requirements
• Automated vulnerability scanning
• Dependency management
\n10. CONTACT
security@signalcore.io`,

    data_governance: `SIGNALCORE DATA GOVERNANCE POLICY
\nEffective Date: July 18, 2026
\n1. DATA PRINCIPLES
• Transparency: Clear documentation of all data sources and processing
• Quality: Validation, deduplication, and freshness monitoring
• Security: Encryption, access control, and audit logging
• Compliance: Adherence to applicable data protection regulations
• Accountability: Clear ownership and stewardship responsibilities
\n2. DATA LINEAGE
Every data point in Kestovar has complete lineage tracking:
• Source Provider: Which organization provided the data
• Ingestion Timestamp: When the data was ingested
• Processing Steps: Normalization, validation, enrichment
• Confidence Score: Reliability assessment at ingestion
• Usage History: Which recommendations used this data
\n3. SOURCE LICENSING
All data sources are reviewed for licensing compliance:
• Public Records: Sourced from official government publications
• Licensed Data: Used under explicit commercial agreements
• API Partners: Governed by API terms of service
• Open Data: Used in compliance with open data licenses
\n4. AUDIT LOGGING
Comprehensive audit logs capture:
• Data access events (who, what, when)
• Data modification events
• Recommendation generation events
• Data deletion events
• Export and download events
\n5. BACKUP AND RECOVERY
• Daily automated backups of all D1 databases
• Point-in-time recovery capability (7-day window)
• Backup encryption with separate key management
• Quarterly backup restoration testing
\n6. DATA QUALITY
• Automated validation on ingestion
• Cross-source verification for critical data
• Freshness monitoring with alerts
• Data quality scorecards per provider`,

    data_retention: `SIGNALCORE DATA RETENTION POLICY
\nEffective Date: July 18, 2026
\n1. RETENTION SCHEDULE
\nData Category | Retention Period | Action After Retention
Account Data | 2 years post-termination | Anonymize
Active Recommendations | 3 years | Archive to cold storage
Historical Events | 10 years | Archive (permanent for verified events)
Audit Logs | 12 months | Anonymize then delete
API Access Logs | 90 days | Delete
User Feedback | 3 years | Anonymize
Provider Metadata | Life of contract + 2 years | Archive
Pattern Library | Permanent | Active
Learning Events | 5 years | Archive
Confidence Scores | 2 years | Archive
\n2. DATA DELETION
Users may request account deletion at any time. Upon request:
• Personal data is deleted within 30 days
• Anonymized analytics data may be retained
• Legal hold data may be retained as required
\n3. ARCHIVAL
Archived data is stored in encrypted cold storage with restricted access. Restoration requests are processed within 5 business days.
\n4. COMPLIANCE
This policy supports compliance with GDPR, CCPA, and other applicable data protection frameworks.`,

    incident_response: `SIGNALCORE INCIDENT RESPONSE PLAN
\nEffective Date: July 18, 2026
\n1. PURPOSE
This plan defines procedures for detecting, responding to, and recovering from security incidents affecting Kestovar systems or data.
\n2. SEVERITY LEVELS
• SEV-1 (Critical): Data breach, system compromise, service outage
• SEV-2 (High): Partial service degradation, potential data exposure
• SEV-3 (Medium): Suspicious activity, policy violation
• SEV-4 (Low): Minor security event, informational alert
\n3. RESPONSE TEAM
• Incident Commander: Coordinates response
• Security Lead: Investigates and contains
• Communications Lead: Internal and external communications
• Engineering Lead: Technical remediation
\n4. RESPONSE PROCEDURES
1. Detection: Automated monitoring alerts + manual reports
2. Classification: Severity assessment within 1 hour
3. Containment: Isolate affected systems immediately
4. Investigation: Root cause analysis
5. Remediation: Fix and verify
6. Recovery: Restore normal operations
7. Post-Incident: Lessons learned and improvements
\n5. NOTIFICATION
• SEV-1: CEO + Board within 4 hours, customers within 24 hours
• SEV-2: Leadership within 8 hours
• SEV-3/4: Weekly security review
\n6. CONTACT
security@signalcore.io (24/7 monitored)`,

    business_continuity: `SIGNALCORE BUSINESS CONTINUITY PLAN
\nEffective Date: July 18, 2026
\n1. OBJECTIVE
Ensure continuous delivery of Kestovar services during disruptions including: infrastructure failures, provider outages, and regional events.
\n2. CRITICAL FUNCTIONS
Priority 1: API availability and recommendation delivery
Priority 2: Data ingestion and provider synchronization
Priority 3: Analytics and reporting
Priority 4: Administrative functions
\n3. RTO / RPO
• Recovery Time Objective (RTO): 4 hours
• Recovery Point Objective (RPO): 1 hour
\n4. REDUNDANCY
• Cloudflare global edge network for API delivery
• D1 database replication across multiple regions
• Fallback data providers for critical jurisdictions
• Static content CDN caching
\n5. PROVIDER CONTINGENCY
If a primary provider becomes unavailable:
• Automatic failover to secondary sources
• Degraded mode with cached data
• Customer notification within 15 minutes
\n6. TESTING
Quarterly BCP drills simulate provider outage and infrastructure failure scenarios.`,

    disaster_recovery: `SIGNALCORE DISASTER RECOVERY PLAN
\nEffective Date: July 18, 2026
\n1. SCOPE
This plan covers recovery from catastrophic events: natural disasters, major infrastructure failures, cyber attacks, and prolonged provider outages.
\n2. BACKUP STRATEGY
• Full database backups: Daily automated
• Incremental backups: Every 6 hours
• Cross-region replication: Active
• Backup encryption: AES-256 with dedicated keys
\n3. RECOVERY PROCEDURES
Phase 1 (0-1 hour): Assessment and team activation
Phase 2 (1-4 hours): Infrastructure recovery from backups
Phase 3 (4-8 hours): Service restoration and validation
Phase 4 (8-24 hours): Full operations with monitoring
Phase 5 (24-72 hours): Post-recovery verification
\n4. DATA CENTER FAILOVER
Primary: Cloudflare US-East
Secondary: Cloudflare US-West
Failover trigger: Automated (health check failures) or manual
\n5. COMMUNICATION
Status page: status.signalcore.io
Customer notifications: In-platform + email for SEV-1/2
Internal: Slack + PagerDuty escalation
\n6. TESTING
Full DR test: Semi-annual
Tabletop exercise: Quarterly
Backup restoration: Monthly`,

    vulnerability_disclosure: `SIGNALCORE VULNERABILITY DISCLOSURE POLICY
\nEffective Date: July 18, 2026
\n1. SCOPE
This policy applies to all Kestovar products, APIs, websites, and infrastructure.
\n2. AUTHORIZED TESTING
We authorize security researchers to test our systems provided they:
• Act in good faith to avoid privacy violations
• Do not access, modify, or delete others' data
• Do not degrade service availability
• Do not exploit vulnerabilities beyond proof-of-concept
\n3. OUT OF SCOPE
• Physical security testing
• Social engineering attacks
• Denial of service testing
• Testing of third-party services without authorization
\n4. REPORTING
Submit findings to: security@signalcore.io
Include: Description, steps to reproduce, potential impact, suggested fix
\n5. RESPONSE TIMELINE
• Acknowledgment: Within 48 hours
• Assessment: Within 5 business days
• Resolution target: Within 90 days (critical: 30 days)
\n6. SAFE HARBOR
We will not pursue legal action against researchers who comply with this policy.
\n7. RECOGNITION
With your permission, we will acknowledge your contribution on our Security Hall of Fame page.`,

    acceptable_use: `SIGNALCORE ACCEPTABLE USE POLICY
\nEffective Date: July 18, 2026
\n1. PURPOSE
This policy defines acceptable use of Kestovar services and platforms.
\n2. PROHIBITED ACTIVITIES
Users must not:
• Use the service for illegal purposes
• Attempt to access data not authorized to them
• Interfere with service operation or other users
• Reverse engineer, decompile, or disassemble the platform
• Distribute malware or harmful code
• Conduct unauthorized automated scanning or testing
• Impersonate other users or organizations
\n3. ENFORCEMENT
Violations may result in:
• Account suspension or termination
• Legal action where appropriate
• Report to law enforcement for criminal activity
\n4. REPORTING
Report violations to: abuse@signalcore.io
\n5. MODIFICATIONS
SignalCore reserves the right to modify this policy with 30 days notice.`,

    cookie_policy: `SIGNALCORE COOKIE POLICY
\nEffective Date: July 18, 2026
\n1. WHAT ARE COOKIES
Cookies are small text files stored on your device when you visit our website.
\n2. TYPES OF COOKIES WE USE
• Essential Cookies: Required for service operation (cannot be disabled)
• Functional Cookies: Remember your preferences and settings
• Analytics Cookies: Help us understand how users interact with our service
• Marketing Cookies: Used to deliver relevant advertisements (if applicable)
\n3. THIRD-PARTY COOKIES
We use cookies from:
• Cloudflare (security and performance)
• Kimi (authentication)
• Analytics providers (usage tracking)
\n4. MANAGING COOKIES
You can manage cookies through your browser settings. Note that disabling essential cookies may prevent service functionality.
\n5. CONTACT
privacy@signalcore.io`,

    accessibility: `SIGNALCORE ACCESSIBILITY POLICY
\nEffective Date: July 18, 2026
\n1. COMMITMENT
SignalCore is committed to making Kestovar accessible to all users, including those with disabilities.
\n2. STANDARDS
We aim to comply with:
• WCAG 2.1 Level AA
• Section 508 of the Rehabilitation Act
• EN 301 549 (European standard)
\n3. FEATURES
• Keyboard navigation support
• Screen reader compatibility
• Color contrast compliance (minimum 4.5:1)
• Adjustable text sizes
• Alternative text for images
• Consistent navigation structure
\n4. TESTING
• Automated accessibility scanning (weekly)
• Manual testing with assistive technologies (quarterly)
• User testing with diverse abilities (biannual)
\n5. FEEDBACK
We welcome feedback on accessibility. Contact: accessibility@signalcore.io
\n6. COMPLIANCE TIMELINE
• WCAG 2.1 AA: Target Q4 2026
• Full Section 508: Target Q1 2027`,
  };
  return contents[policyId];
}

