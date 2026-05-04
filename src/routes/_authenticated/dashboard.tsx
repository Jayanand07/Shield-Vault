import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { FileLock, Cpu, HardDrive, KeyRound, Lock, Upload, FolderLock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ShieldVault" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Files Encrypted", value: "1,284", delta: "+12.3%", icon: FileLock },
  { label: "API Calls (30d)", value: "847,210", delta: "+5.8%", icon: Cpu },
  { label: "Storage Used", value: "42.7 GB", delta: "of 100 GB", icon: HardDrive, neutral: true },
  { label: "Active Keys", value: "7", delta: "2 new this week", icon: KeyRound, neutral: true },
];

const activity = [
  { who: "you", action: "encrypted", what: "Q4-financials.xlsx", when: "2 min ago" },
  { who: "API key sv_live_a8f", action: "decrypted", what: "customer-record-9821", when: "14 min ago" },
  { who: "priya@finlytics.in", action: "joined room", what: "Compliance Working Group", when: "1 hr ago" },
  { who: "you", action: "uploaded", what: "merger-deck-v3.pdf", when: "3 hr ago" },
  { who: "API key sv_live_a8f", action: "rotated", what: "production environment", when: "yesterday" },
  { who: "marcus@vector.ai", action: "left room", what: "Vendor Contracts", when: "yesterday" },
];

function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back"
        description="Here's a snapshot of your encrypted environment."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/vault"><Upload className="h-4 w-4 mr-2" />Upload</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90">
              <Link to="/encrypt"><Lock className="h-4 w-4 mr-2" />Encrypt now</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{s.value}</div>
            <div className={`mt-1 text-xs ${s.neutral ? "text-muted-foreground" : "text-success"}`}>{s.delta}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Recent activity</h3>
            <Link to="/audit" className="text-xs text-primary hover:underline flex items-center gap-1">
              View audit log <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border/60">
            {activity.map((a, i) => (
              <li key={i} className="py-3 flex items-center gap-3 text-sm">
                <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 border border-primary/20 grid place-items-center text-xs font-mono text-primary">
                  {a.who.startsWith("API") ? "API" : a.who[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-mono text-foreground/90 text-xs">{a.what}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.when}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/encrypt"><Lock className="h-4 w-4 mr-2" />Encrypt text or file</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/vault"><FolderLock className="h-4 w-4 mr-2" />Open vault</Link></Button>
              <Button asChild variant="outline" className="w-full justify-start"><Link to="/api-keys"><KeyRound className="h-4 w-4 mr-2" />Generate API key</Link></Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Storage</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold">42.7 GB</span>
              <span className="text-xs text-muted-foreground">/ 100 GB</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: "42.7%" }} />
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">Upgrade plan</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
