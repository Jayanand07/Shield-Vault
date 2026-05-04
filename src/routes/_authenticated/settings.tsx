import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — ShieldVault" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [twoFa, setTwoFa] = useState(true);
  const [defaultAlgo, setDefaultAlgo] = useState("AES-256-GCM");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      setName(data?.full_name ?? "");
    })();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account, security, API, and billing." />

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="glass rounded-2xl p-6 max-w-xl space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-xl font-bold text-primary-foreground">{(name || email)[0]?.toUpperCase()}</div>
              <div>
                <div className="font-semibold">{name || "Your name"}</div>
                <div className="text-sm text-muted-foreground">{email}</div>
              </div>
            </div>
            <div><Label className="mb-1.5 block">Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label className="mb-1.5 block">Email</Label><Input value={email} disabled /></div>
            <Button onClick={save} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">Save changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="glass rounded-2xl p-6 max-w-xl space-y-5">
            <Row label="Two-factor authentication" desc="Require a second factor at sign-in.">
              <Switch checked={twoFa} onCheckedChange={setTwoFa} />
            </Row>
            <Row label="Active sessions" desc="2 devices currently signed in.">
              <Button variant="outline" size="sm">Manage</Button>
            </Row>
            <Row label="Change password" desc="Rotate your account password.">
              <Button variant="outline" size="sm">Change</Button>
            </Row>
            <Row label="Recovery codes" desc="One-time codes if you lose access to 2FA.">
              <Button variant="outline" size="sm">Generate</Button>
            </Row>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="glass rounded-2xl p-6 max-w-xl space-y-5">
            <div>
              <Label className="mb-1.5 block">Default algorithm</Label>
              <select value={defaultAlgo} onChange={(e) => setDefaultAlgo(e.target.value)} className="w-full rounded-md bg-input border border-border px-3 py-2 text-sm">
                <option>AES-256-GCM</option>
                <option>RSA-OAEP-2048</option>
                <option>Hybrid (AES + RSA)</option>
              </select>
            </div>
            <div><Label className="mb-1.5 block">Webhook URL</Label><Input placeholder="https://your-app.com/webhooks/shieldvault" /></div>
            <div><Label className="mb-1.5 block">Allowed IPs (CIDR)</Label><Input placeholder="0.0.0.0/0" defaultValue="0.0.0.0/0" /></div>
            <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">Save</Button>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="glass rounded-2xl p-6 max-w-xl space-y-5">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/30 p-5">
              <div className="text-xs uppercase tracking-wider text-primary font-semibold">Current plan</div>
              <div className="mt-1 text-2xl font-bold">Team · ₹2,999/mo</div>
              <div className="text-xs text-muted-foreground mt-1">Renews on May 28, 2026</div>
            </div>
            <Meter label="Storage" used={42.7} total={100} unit="GB" />
            <Meter label="API calls" used={847_210} total={1_000_000} unit="" />
            <Meter label="Team members" used={4} total={25} unit="" />
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">Upgrade to Enterprise</Button>
              <Button variant="outline">Manage billing</Button>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" />Audit-ready compliance reports</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-success" />Priority email support (4h SLA)</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60 last:border-0 last:pb-0">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Meter({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pct = (used / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground text-xs font-mono">{used.toLocaleString()} {unit} / {total.toLocaleString()} {unit}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
