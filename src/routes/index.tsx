import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  FolderLock,
  Users,
  FileSignature,
  ClipboardCheck,
  Check,
  ArrowRight,
  Sparkles,
  Github,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShieldVault — Encrypt Everything. Trust No One." },
      {
        name: "description",
        content:
          "Zero-knowledge hybrid encryption platform. Protect files, messages, and APIs with AES-256-GCM and RSA-2048 — keys never leave your browser.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Shield,
    title: "Hybrid Encryption",
    desc: "AES-256-GCM combined with RSA-2048 for the perfect balance of speed and asymmetric trust.",
  },
  {
    icon: FolderLock,
    title: "Secure Vault",
    desc: "Encrypted file storage where ciphertext lives on our servers and keys live only with you.",
  },
  {
    icon: Users,
    title: "Secure Rooms",
    desc: "Share encrypted workspaces with teammates. Granular roles, end-to-end encrypted by default.",
  },
  {
    icon: FileSignature,
    title: "Digital Signatures",
    desc: "Sign documents and messages with cryptographic proof of authorship and integrity.",
  },
  {
    icon: ClipboardCheck,
    title: "Compliance Dashboard",
    desc: "SOC 2, HIPAA, and GDPR-ready audit logs with one-click export for your security team.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for individuals exploring zero-knowledge encryption.",
    features: ["1 GB encrypted storage", "100 API calls / day", "AES-256-GCM encryption", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Team",
    price: "₹2,999",
    period: "/month",
    desc: "For growing teams that need collaboration and compliance.",
    features: [
      "100 GB encrypted storage",
      "100,000 API calls / month",
      "Hybrid AES + RSA encryption",
      "Secure Rooms (up to 25 members)",
      "Audit logs + CSV export",
      "Priority email support",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₹15,000",
    period: "/month",
    desc: "Air-gapped deployment, SSO, and dedicated infrastructure.",
    features: [
      "Unlimited storage",
      "Unlimited API calls",
      "SSO + SCIM provisioning",
      "Custom retention policies",
      "On-prem / VPC deployment",
      "24/7 dedicated support",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

const testimonials = [
  {
    quote:
      "ShieldVault replaced three security tools and gave us audit-ready compliance in a week. The zero-knowledge model is exactly what our enterprise clients demand.",
    name: "Priya Sharma",
    role: "CTO, Finlytics",
  },
  {
    quote:
      "The hybrid encryption is brilliant. Our engineers can encrypt entire S3 buckets in a single API call without ever handing keys to a third party.",
    name: "Marcus Chen",
    role: "Head of Platform, Vector AI",
  },
  {
    quote:
      "Migrated 14 TB to ShieldVault. Performance is indistinguishable from raw storage and we sleep better at night.",
    name: "Amelia Rosen",
    role: "VP Engineering, NorthLedger",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#customers" className="hover:text-foreground transition-colors">Customers</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90">
              <Link to="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            SOC 2 Type II · HIPAA · GDPR Ready
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05]"
          >
            Encrypt Everything.
            <br />
            <span className="text-gradient">Trust No One.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            ShieldVault is a zero-knowledge hybrid encryption platform. Your keys never leave your
            browser. Our servers only ever see ciphertext.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 glow">
              <Link to="/register">
                Start encrypting free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass border-border/60">
              <Link to="/encrypt">Try the demo</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="glass rounded-2xl p-2 shadow-2xl">
              <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 text-xs font-mono text-muted-foreground">shieldvault.app/encrypt</span>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 font-mono">PLAINTEXT</div>
                    <div className="rounded-lg bg-background/60 border border-border/60 p-4 font-mono text-sm leading-relaxed">
                      Customer SSN: 234-89-1290<br />
                      Card: 4532 •••• •••• 7821<br />
                      Routing: 021000021
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-primary mb-2 font-mono flex items-center gap-1.5">
                      <Lock className="h-3 w-3" /> AES-256-GCM CIPHERTEXT
                    </div>
                    <div className="rounded-lg bg-background/60 border border-primary/30 p-4 font-mono text-xs text-primary/80 break-all leading-relaxed">
                      Tj9KqXm2vP7yL4bN8fG3hQwR6sZcA1eU+oM5pHkWxYbT9vLnQ2gFhJrK8mXdC4ZpA1eU+oM5pHkWxYbT9vLnQ2gFhJrK8m...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built for teams who can't afford a breach
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Every primitive you need to protect customer data, intellectual property, and
              regulated workloads — in one platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass rounded-2xl p-6 hover:border-primary/40 transition-colors group"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="customers" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Trusted by security-first teams
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6">
                <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-5 pt-5 border-t border-border/60">
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-7 ${
                  tier.highlight
                    ? "glass-strong border-primary/40 shadow-[0_0_60px_-15px_oklch(0.72_0.17_220_/_0.5)]"
                    : "glass"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{tier.desc}</p>
                <Button
                  asChild
                  className={`w-full mt-6 ${
                    tier.highlight
                      ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90"
                      : ""
                  }`}
                  variant={tier.highlight ? "default" : "outline"}
                >
                  <Link to="/register">{tier.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to make your stack <span className="text-gradient">unbreakable</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join 4,200+ engineering teams encrypting petabytes of customer data with ShieldVault.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 glow"
            >
              <Link to="/register">
                Start your free account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ShieldVault Inc. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-5 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
