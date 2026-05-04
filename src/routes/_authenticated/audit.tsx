import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({ meta: [{ title: "Audit Logs — ShieldVault" }] }),
  component: AuditPage,
});

const seed = [
  { ts: "2026-05-02T10:14:33Z", user: "you@shieldvault.app", action: "FILE_ENCRYPT", resource: "Q4-financials.xlsx", ip: "103.21.244.12" },
  { ts: "2026-05-02T10:00:11Z", user: "sv_live_a8f...", action: "API_DECRYPT", resource: "customer-9821", ip: "52.84.10.4" },
  { ts: "2026-05-02T09:42:01Z", user: "priya@finlytics.in", action: "ROOM_JOIN", resource: "Compliance Working Group", ip: "182.79.184.10" },
  { ts: "2026-05-02T08:30:55Z", user: "you@shieldvault.app", action: "FILE_UPLOAD", resource: "merger-deck-v3.pdf", ip: "103.21.244.12" },
  { ts: "2026-05-01T22:15:08Z", user: "sv_live_a8f...", action: "KEY_ROTATE", resource: "production", ip: "52.84.10.4" },
  { ts: "2026-05-01T17:02:44Z", user: "marcus@vector.ai", action: "ROOM_LEAVE", resource: "Vendor Contracts", ip: "67.207.137.5" },
  { ts: "2026-05-01T14:21:18Z", user: "you@shieldvault.app", action: "API_KEY_CREATE", resource: "Staging server", ip: "103.21.244.12" },
  { ts: "2026-05-01T11:11:00Z", user: "you@shieldvault.app", action: "LOGIN", resource: "web", ip: "103.21.244.12" },
  { ts: "2026-04-30T19:45:52Z", user: "sv_live_b22...", action: "API_ENCRYPT", resource: "batch-2841", ip: "34.219.6.81" },
  { ts: "2026-04-30T16:08:39Z", user: "amelia@northledger.com", action: "FILE_DOWNLOAD", resource: "audit-report-2026Q1.pdf", ip: "98.137.11.163" },
  { ts: "2026-04-30T09:24:17Z", user: "you@shieldvault.app", action: "SETTINGS_UPDATE", resource: "profile", ip: "103.21.244.12" },
  { ts: "2026-04-29T23:51:09Z", user: "sv_live_a8f...", action: "API_DECRYPT", resource: "customer-9710", ip: "52.84.10.4" },
];

const actions = ["ALL", ...Array.from(new Set(seed.map((s) => s.action)))];

function AuditPage() {
  const [filter, setFilter] = useState("ALL");
  const rows = useMemo(() => filter === "ALL" ? seed : seed.filter((s) => s.action === filter), [filter]);

  const exportCsv = () => {
    const header = "Timestamp,User,Action,Resource,IP\n";
    const body = rows.map((r) => `${r.ts},${r.user},${r.action},${r.resource},${r.ip}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `shieldvault-audit-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log exported");
  };

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Tamper-evident record of every action across your organization."
        actions={<Button onClick={exportCsv} variant="outline"><Download className="h-4 w-4 mr-2" />Export CSV</Button>}
      />

      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-muted-foreground">Filter by action</span>
        <div className="w-52">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>IP</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs text-muted-foreground">{new Date(r.ts).toLocaleString()}</TableCell>
                <TableCell className="text-sm">{r.user}</TableCell>
                <TableCell><span className="rounded-md bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 text-[10px] font-mono">{r.action}</span></TableCell>
                <TableCell className="font-mono text-xs">{r.resource}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
