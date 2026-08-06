import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/store/useStore';
import { generatePdf } from '@/lib/pdf-export';
import { CheckCircle2, Shield, Bell, CreditCard, Users, Zap, Globe, Lock, FileText, HelpCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Settings Page — Account, Notifications, Billing, Team, Integrations
// ═══════════════════════════════════════════════════════════════

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-content mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <h1 className="text-h1 mb-6">Settings</h1>
        <div className="space-y-8">
          <AccountSection />
          <NotificationSection />
          <BillingSection />
          <TeamSection />
          <IntegrationsSection />
          <SecuritySection />
        </div>
      </div>
    </div>
  );
}

function AccountSection() {
  const { user, updateProfile } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  return (
    <section className="bg-surface rounded-4 p-6 shadow-card">
      <h2 className="text-h2 mb-4">Account</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-ink-primary">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-ink-wash px-3 py-2 text-sm focus:border-accent-indigo focus:outline-none" placeholder="Your name" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-primary">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-ink-wash px-3 py-2 text-sm focus:border-accent-indigo focus:outline-none" placeholder="you@company.com" />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button onClick={() => { setSaving(true); setTimeout(() => { updateProfile?.({ name, email }); setSaving(false); }, 600); }} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </section>
  );
}

function NotificationSection() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushAlerts: false,
    weeklyDigest: true,
    productUpdates: true,
    marketingEmails: false,
  });

  const toggle = (key: string) => setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }));

  const items = [
    { key: 'emailAlerts', label: 'Email Alerts', description: 'Get notified when new signals match your criteria', icon: Bell },
    { key: 'pushAlerts', label: 'Push Notifications', description: 'Browser push notifications for real-time alerts', icon: Zap },
    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of top opportunities every Monday', icon: FileText },
    { key: 'productUpdates', label: 'Product Updates', description: 'New features and improvements', icon: Globe },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotions, webinars, and industry news', icon: HelpCircle },
  ];

  return (
    <section className="bg-surface rounded-4 p-6 shadow-card">
      <h2 className="text-h2 mb-4">Notifications</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-accent-indigo" />
              <div>
                <p className="text-sm font-medium text-ink-primary">{item.label}</p>
                <p className="text-xs text-ink-tertiary">{item.description}</p>
              </div>
            </div>
            <Switch checked={settings[item.key as keyof typeof settings] as boolean} onCheckedChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function BillingSection() {
  const { user } = useStore();
  const planName = user?.plan || 'scout';
  const planLimits: Record<string, { signals: number; price: string; name: string }> = {
    scout: { signals: 50, price: '$99/mo', name: 'Scout' },
    professional: { signals: Infinity, price: '$249/mo', name: 'Professional' },
    business: { signals: Infinity, price: '$599/mo', name: 'Business' },
    enterprise: { signals: Infinity, price: 'Custom', name: 'Enterprise' },
  };
  const plan = planLimits[planName] || planLimits.scout;
  const [invoices] = useState<{ id: string; date: string; amount: string; status: string; plan: string }[]>([]);
  const [paymentMethod] = useState<{ brand?: string; last4?: string; expiry?: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleExportBilling = () => {
    generatePdf({
      title: 'Billing Summary',
      subtitle: 'Invoice History & Payment Details',
      coverPage: true,
      executiveSummary: `Current plan: ${plan.name} at ${plan.price}. ${paymentMethod ? `Payment method on file: ${paymentMethod.brand} ending in ${paymentMethod.last4}.` : 'No payment method on file yet. Billing begins after trial ends.'} Account in good standing.`,
      sections: [
        { heading: 'Current Plan', metrics: [{ label: 'Plan', value: plan.name }, { label: 'Price', value: plan.price }, { label: 'Status', value: 'Active' }] },
        { heading: 'Recent Invoices', content: invoices.length > 0 ? undefined : 'No invoices yet. Invoices will appear here once billing begins.', table: invoices.length > 0 ? { headers: ['Invoice', 'Date', 'Amount', 'Status'], rows: invoices.map((i) => [i.id, i.date, i.amount, i.status]) } : undefined },
        { heading: 'Payment Method', content: paymentMethod ? `${paymentMethod.brand} ending in ${paymentMethod.last4} · Expires ${paymentMethod.expiry}` : 'No payment method on file yet. Add a payment method when you upgrade from trial.' },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="bg-surface rounded-4 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-h2">Billing</h2>
            <p className="text-sm text-ink-secondary">Manage your plan and payment details</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-accent-indigo bg-accent-indigo/10 px-2 py-1 rounded-full">{plan.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => window.location.href = '/pricing'} className="btn-primary">Upgrade Plan</button>
          <button onClick={handleExportBilling} className="btn-secondary">Export Summary</button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-surface rounded-4 p-6 shadow-card">
        <h3 className="text-[14px] font-semibold text-ink-primary mb-4">Payment Method</h3>
        {paymentMethod ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-surface border border-ink-wash rounded flex items-center justify-center">
                <svg viewBox="0 0 24 16" className="w-6 h-4"><rect width="24" height="16" rx="2" fill="#1A1F71"/><path d="M9 12 L7 4 H9 L10 12 H9ZM15 12 L16.5 4 H14.5 L13.5 9 L12.5 4 H10.5 L12.5 12 H15Z" fill="white"/></svg>
              </div>
              <div>
                <p className="text-[14px] text-ink-primary">{paymentMethod.brand} ending in {paymentMethod.last4}</p>
                <p className="text-[11px] text-ink-tertiary">Expires {paymentMethod.expiry}</p>
              </div>
            </div>
            <button className="text-[12px] text-accent-indigo hover:underline">Update</button>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-canvas text-center">
            <p className="text-[13px] text-ink-secondary">No payment method on file yet.</p>
            <p className="text-[11px] text-ink-tertiary mt-1">Add a payment method when you upgrade from trial.</p>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-surface rounded-4 p-6 shadow-card">
        <h3 className="text-[14px] font-semibold text-ink-primary mb-4">Invoice History</h3>
        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-ink-wash/50 last:border-0">
                <div>
                  <p className="text-[13px] font-medium text-ink-primary">{inv.id}</p>
                  <p className="text-[11px] text-ink-tertiary">{inv.date} · {inv.plan}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] text-ink-primary">{inv.amount}</span>
                  <span className="pill-teal text-[10px]">{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-canvas text-center">
            <p className="text-[13px] text-ink-secondary">No invoices yet.</p>
            <p className="text-[11px] text-ink-tertiary mt-1">Invoices will appear here once billing begins.</p>
          </div>
        )}
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Scout', price: '$99/mo', features: ['5 counties', 'Basic alerts', 'Weekly reports', 'Email support'] },
          { name: 'Professional', price: '$249/mo', features: ['25 counties', 'Advanced alerts', 'Daily reports', 'API access', '5 team members', 'Priority support'], current: planName === 'professional' },
          { name: 'Business', price: '$599/mo', features: ['Unlimited counties', 'Custom alerts', 'Real-time reports', 'Full API access', 'Unlimited team', 'Custom integrations', 'Dedicated support'] },
          { name: 'Enterprise', price: 'Custom', features: ['Everything in Business', 'SSO / SAML', 'Custom SLA', 'Dedicated account manager', 'Custom pattern development', 'On-premise option'] },
        ].map((p) => (
          <div key={p.name} className={`bg-surface rounded-4 p-5 shadow-card ${p.current ? 'ring-2 ring-accent-indigo' : ''}`}>
            <h4 className="text-[16px] font-semibold text-ink-primary">{p.name}</h4>
            <p className="font-mono text-[20px] text-accent-indigo mt-1">{p.price}</p>
            <ul className="mt-3 space-y-1">
              {p.features.map((f) => <li key={f} className="text-[12px] text-ink-secondary flex items-center gap-1.5"><CheckIcon className="w-3 h-3 text-accent-teal" />{f}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M3 8 L6.5 11.5 L13 4.5" /></svg>;
}

function TeamSection() {
  const { user, addToast } = useStore();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Team</h2>
        <button onClick={() => addToast('Team invites require a Professional, Business, or Enterprise plan', 'info')} className="btn-primary">Invite Member</button>
      </div>
      <div className="bg-surface rounded-4 p-6 shadow-card">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo text-sm font-bold">{user?.name?.[0] || 'U'}</div>
            <div>
              <p className="text-sm font-medium text-ink-primary">{user?.name || 'You'}</p>
              <p className="text-xs text-ink-tertiary">{user?.email || user?.sub || 'Owner'}</p>
            </div>
          </div>
          <span className="text-[11px] bg-accent-indigo/10 text-accent-indigo px-2 py-0.5 rounded-full font-medium">Owner</span>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSection() {
  const [connected, setConnected] = useState({ slack: false, teams: false, webhook: false });

  return (
    <section className="bg-surface rounded-4 p-6 shadow-card">
      <h2 className="text-h2 mb-4">Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'slack', name: 'Slack', desc: 'Get alerts in your Slack channels', icon: Zap },
          { key: 'teams', name: 'Microsoft Teams', desc: 'Post alerts to Teams channels', icon: Users },
          { key: 'webhook', name: 'Webhook', desc: 'Send events to your endpoint', icon: Globe },
        ].map((int) => (
          <div key={int.key} className="border border-ink-wash rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <int.icon className="w-4 h-4 text-accent-indigo" />
              <span className="text-sm font-medium text-ink-primary">{int.name}</span>
            </div>
            <p className="text-xs text-ink-tertiary mb-3">{int.desc}</p>
            <button onClick={() => setConnected((c) => ({ ...c, [int.key]: !c[int.key as keyof typeof c] }))} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${connected[int.key as keyof typeof connected] ? 'bg-emerald-50 text-emerald-700' : 'bg-accent-indigo text-white hover:bg-accent-indigo/90'}`}>
              {connected[int.key as keyof typeof connected] ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="bg-surface rounded-4 p-6 shadow-card">
      <h2 className="text-h2 mb-4">Security</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Lock, label: 'Two-Factor Authentication', status: 'Not enabled', action: 'Enable' },
          { icon: Shield, label: 'Session Management', status: '1 active session', action: 'Manage' },
          { icon: Globe, label: 'API Keys', status: 'No keys', action: 'Generate' },
          { icon: FileText, label: 'Audit Log', status: 'View history', action: 'View' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 bg-canvas rounded-lg">
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-accent-indigo" />
              <div>
                <p className="text-sm font-medium text-ink-primary">{item.label}</p>
                <p className="text-xs text-ink-tertiary">{item.status}</p>
              </div>
            </div>
            <button className="text-xs text-accent-indigo hover:underline font-medium">{item.action}</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SettingsPage;
