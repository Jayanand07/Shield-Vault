import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Copy, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateApiKey, sha256Hex } from "@/lib/crypto";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/api-keys")({
  head: () => ({ meta: [{ title: "API Keys — ShieldVault" }] }),
  component: ApiKeysPage,
});

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  request_count: number;
  last_used_at: string | null;
  revoked: boolean;
  created_at: string;
}

function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    setKeys((data ?? []) as ApiKey[]);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return toast.error("Name required");
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { full, prefix } = generateApiKey();
      const hash = await sha256Hex(full);
      const { error } = await supabase.from("api_keys").insert({ user_id: user.id, name, prefix, key_hash: hash });
      if (error) throw error;
      setCreated(full);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (k: ApiKey) => {
    if (!confirm(`Revoke "${k.name}"? Any service using it will stop working.`)) return;
    await supabase.from("api_keys").update({ revoked: true }).eq("id", k.id);
    toast.success("Key revoked");
    load();
  };

  const close = () => { setOpen(false); setName(""); setCreated(null); };

  return (
    <div>
      <PageHeader
        title="API Keys"
        description="Programmatic access to the ShieldVault API. Each key is shown once — store it safely."
        actions={
          <Dialog open={open} onOpenChange={(o) => { o ? setOpen(true) : close(); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-2" />Generate key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{created ? "Save your new key" : "Generate API Key"}</DialogTitle></DialogHeader>
              {created ? (
                <div className="space-y-3 py-2">
                  <p className="text-sm text-warning">⚠ Copy this now. It won't be shown again.</p>
                  <div className="rounded-lg bg-background border border-warning/40 p-3 font-mono text-xs break-all">{created}</div>
                  <Button onClick={() => { navigator.clipboard.writeText(created); toast.success("Copied"); }} className="w-full"><Copy className="h-4 w-4 mr-2" />Copy to clipboard</Button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div><Label className="mb-1.5 block">Key name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production server" /></div>
                </div>
              )}
              <DialogFooter>
                {created ? <Button onClick={close}>Done</Button> : (
                  <>
                    <Button variant="outline" onClick={close}>Cancel</Button>
                    <Button onClick={create} disabled={busy} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}</Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="glass rounded-2xl overflow-hidden">
        {keys.length === 0 ? (
          <div className="p-16 text-center">
            <KeyRound className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold">No API keys yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Generate your first key to start calling the ShieldVault API.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead><TableHead>Requests</TableHead><TableHead>Last used</TableHead><TableHead>Created</TableHead><TableHead></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id} className={k.revoked ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{k.name}{k.revoked && <span className="ml-2 text-xs text-destructive">revoked</span>}</TableCell>
                  <TableCell className="font-mono text-xs">{k.prefix}••••••••••••</TableCell>
                  <TableCell>{k.request_count.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{k.last_used_at ? formatDistanceToNow(new Date(k.last_used_at), { addSuffix: true }) : "Never"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(k.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {!k.revoked && <Button size="sm" variant="ghost" onClick={() => revoke(k)} className="text-destructive">Revoke</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
