import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileLock, Download, Trash2, Search, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { encryptBytes, decryptBytes, base64ToBytes, formatBytes } from "@/lib/crypto";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({ meta: [{ title: "Secure Vault — ShieldVault" }] }),
  component: VaultPage,
});

interface VaultItem {
  id: string;
  name: string;
  size: number;
  algorithm: string;
  iv: string;
  ciphertext_path: string;
  mime_type: string | null;
  created_at: string;
}

function VaultPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("vault_items").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as VaultItem[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const upload = async (f: File) => {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const buf = new Uint8Array(await f.arrayBuffer());
      const enc = await encryptBytes(buf);
      const path = `${user.id}/${crypto.randomUUID()}.enc`;
      const blob = new Blob([enc.ciphertext as BlobPart], { type: "application/octet-stream" });
      const { error: upErr } = await supabase.storage.from("vault").upload(path, blob);
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("vault_items").insert({
        user_id: user.id,
        name: f.name,
        size: f.size,
        algorithm: "AES-256-GCM",
        iv: enc.iv,
        ciphertext_path: path,
        mime_type: f.type || null,
      });
      if (insErr) throw insErr;
      // Persist key locally per file (demo — real product would wrap with master key)
      localStorage.setItem(`vk:${path}`, enc.keyB64);
      toast.success(`${f.name} encrypted and uploaded`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const download = async (item: VaultItem) => {
    try {
      const key = localStorage.getItem(`vk:${item.ciphertext_path}`);
      if (!key) return toast.error("Decryption key not found on this device");
      const { data, error } = await supabase.storage.from("vault").download(item.ciphertext_path);
      if (error) throw error;
      const ct = new Uint8Array(await data.arrayBuffer());
      const plain = await decryptBytes(ct, item.iv, key);
      const blob = new Blob([plain as BlobPart], { type: item.mime_type ?? "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = item.name; a.click();
      URL.revokeObjectURL(url);
      toast.success("Decrypted and downloaded");
    } catch (e: any) {
      toast.error(e.message ?? "Download failed");
    }
  };

  const remove = async (item: VaultItem) => {
    if (!confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    await supabase.storage.from("vault").remove([item.ciphertext_path]);
    await supabase.from("vault_items").delete().eq("id", item.id);
    localStorage.removeItem(`vk:${item.ciphertext_path}`);
    toast.success("Deleted");
    load();
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Secure Vault"
        description="Files are encrypted in your browser before upload. We only see ciphertext."
        actions={
          <Button onClick={() => fileInput.current?.click()} disabled={busy} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90">
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload file
          </Button>
        }
      />
      <input ref={fileInput} type="file" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />

      <div className="relative max-w-md mb-6">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" className="pl-9" />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
      >
        {loading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <FileLock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold">{q ? "No matches" : "Your vault is empty"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{q ? "Try a different search." : "Drag a file anywhere or click upload to encrypt your first file."}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-2xl p-5 group hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatBytes(Number(item.size))} · {new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 border border-success/30 px-2 py-0.5 text-[10px] font-mono text-success">
                  <FileLock className="h-2.5 w-2.5" />{item.algorithm}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => download(item)}><Download className="h-3.5 w-3.5 mr-1.5" />Download</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(item)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
