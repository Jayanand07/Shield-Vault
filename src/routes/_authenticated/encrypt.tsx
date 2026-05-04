import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Lock, Unlock, Loader2, Shield, Upload, Check } from "lucide-react";
import { encryptText, encryptBytes, decryptToText, bytesToBase64, base64ToBytes, formatBytes, generateRsaKeyPair, rsaEncryptText } from "@/lib/crypto";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/encrypt")({
  head: () => ({ meta: [{ title: "Encrypt / Decrypt — ShieldVault" }] }),
  component: EncryptPage,
});

type Algo = "AES-256-GCM" | "RSA-OAEP-2048";

function EncryptPage() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [algo, setAlgo] = useState<Algo>("AES-256-GCM");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<{ ciphertext: string; iv: string; key: string } | null>(null);
  const [decryptIv, setDecryptIv] = useState("");
  const [decryptKey, setDecryptKey] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleEncryptText = async () => {
    if (!input.trim()) return toast.error("Enter some text first");
    setBusy(true);
    setOutput(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (algo === "RSA-OAEP-2048") {
        const pair = await generateRsaKeyPair();
        const ct = await rsaEncryptText(input, pair.publicKey);
        const pubJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
        const privJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
        setOutput({ ciphertext: ct, iv: btoa(JSON.stringify(pubJwk)).slice(0, 60) + "…", key: btoa(JSON.stringify(privJwk)).slice(0, 60) + "…" });
      } else {
        const r = await encryptText(input);
        setOutput({ ciphertext: bytesToBase64(r.ciphertext), iv: r.iv, key: r.keyB64 });
      }
      toast.success("Encrypted ✓");
    } catch (e: any) {
      toast.error(e.message ?? "Encryption failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDecrypt = async () => {
    if (!input || !decryptIv || !decryptKey) return toast.error("Provide ciphertext, IV, and key");
    setBusy(true);
    try {
      const text = await decryptToText(input.trim(), decryptIv.trim(), decryptKey.trim());
      setDecrypted(text);
      toast.success("Decrypted ✓");
    } catch {
      toast.error("Decryption failed — check IV and key");
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (f: File) => {
    setFile(f);
    setBusy(true);
    setOutput(null);
    try {
      const buf = new Uint8Array(await f.arrayBuffer());
      await new Promise((r) => setTimeout(r, 400));
      const r = await encryptBytes(buf);
      setOutput({ ciphertext: bytesToBase64(r.ciphertext).slice(0, 280) + "…", iv: r.iv, key: r.keyB64 });
      // download
      const blob = new Blob([r.ciphertext as BlobPart], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${f.name}.enc`; a.click();
      URL.revokeObjectURL(url);
      toast.success("File encrypted and downloaded");
    } catch (e: any) {
      toast.error(e.message ?? "File encryption failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied");
  };

  return (
    <div>
      <PageHeader title="Encrypt / Decrypt" description="All cryptography runs in your browser. Keys never leave this device." />

      <div className="flex items-center gap-2 mb-6">
        <Button variant={mode === "encrypt" ? "default" : "outline"} onClick={() => { setMode("encrypt"); setOutput(null); setDecrypted(""); }} className={mode === "encrypt" ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground" : ""}>
          <Lock className="h-4 w-4 mr-2" />Encrypt
        </Button>
        <Button variant={mode === "decrypt" ? "default" : "outline"} onClick={() => { setMode("decrypt"); setOutput(null); setDecrypted(""); }} className={mode === "decrypt" ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground" : ""}>
          <Unlock className="h-4 w-4 mr-2" />Decrypt
        </Button>
        <div className="ml-auto w-56">
          <Select value={algo} onValueChange={(v) => setAlgo(v as Algo)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AES-256-GCM">AES-256-GCM (symmetric)</SelectItem>
              <SelectItem value="RSA-OAEP-2048">RSA-OAEP-2048 (asymmetric)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {mode === "encrypt" ? (
          <>
            <div className="glass rounded-2xl p-6">
              <Tabs defaultValue="text">
                <TabsList className="mb-4">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="file">File</TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                  <Label className="mb-2 block">Plaintext</Label>
                  <Textarea rows={10} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste secrets, API keys, customer data — anything you want encrypted…" className="font-mono text-sm resize-none" />
                  <Button onClick={handleEncryptText} disabled={busy} className="w-full mt-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90">
                    {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Encrypting…</> : <><Lock className="h-4 w-4 mr-2" />Encrypt with {algo}</>}
                  </Button>
                </TabsContent>
                <TabsContent value="file">
                  <div
                    onClick={() => fileInput.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <div className="font-medium">Drop a file or click to browse</div>
                    <div className="text-xs text-muted-foreground mt-1">Encrypted client-side. Up to 50 MB.</div>
                    {file && <div className="mt-3 text-xs font-mono text-primary">{file.name} · {formatBytes(file.size)}</div>}
                  </div>
                  <input ref={fileInput} type="file" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="glass rounded-2xl p-6 min-h-[420px]">
              <div className="flex items-center justify-between mb-3">
                <Label>Output</Label>
                {output && <span className="text-xs font-mono text-success flex items-center gap-1"><Check className="h-3 w-3" />Encrypted</span>}
              </div>
              <AnimatePresence mode="wait">
                {busy ? (
                  <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid place-items-center h-80">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                      <Shield className="h-16 w-16 text-primary glow" />
                    </motion.div>
                    <div className="mt-4 text-sm text-muted-foreground">Generating key, encrypting…</div>
                  </motion.div>
                ) : output ? (
                  <motion.div key="out" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <Field label="Ciphertext (base64)" value={output.ciphertext} onCopy={() => copy(output.ciphertext)} />
                    <Field label="IV / nonce" value={output.iv} onCopy={() => copy(output.iv)} />
                    <Field label={algo === "AES-256-GCM" ? "Symmetric key (keep safe!)" : "Private key"} value={output.key} onCopy={() => copy(output.key)} sensitive />
                    <p className="text-xs text-muted-foreground">⚠ Save the key — without it, the ciphertext is unrecoverable. We don't store it.</p>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="grid place-items-center h-80 text-center text-muted-foreground text-sm">
                    <div>
                      <Lock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      Encrypted output will appear here.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {copied && <div className="text-xs text-primary mt-2">Copied to clipboard</div>}
            </div>
          </>
        ) : (
          <>
            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <Label className="mb-2 block">Ciphertext (base64)</Label>
                <Textarea rows={5} value={input} onChange={(e) => setInput(e.target.value)} className="font-mono text-xs" placeholder="Paste base64 ciphertext…" />
              </div>
              <div>
                <Label className="mb-2 block">IV / nonce</Label>
                <Textarea rows={2} value={decryptIv} onChange={(e) => setDecryptIv(e.target.value)} className="font-mono text-xs" placeholder="Base64 IV" />
              </div>
              <div>
                <Label className="mb-2 block">Symmetric key</Label>
                <Textarea rows={2} value={decryptKey} onChange={(e) => setDecryptKey(e.target.value)} className="font-mono text-xs" placeholder="Base64 AES key" />
              </div>
              <Button onClick={handleDecrypt} disabled={busy} className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Decrypting…</> : <><Unlock className="h-4 w-4 mr-2" />Decrypt</>}
              </Button>
            </div>
            <div className="glass rounded-2xl p-6 min-h-[420px]">
              <Label className="mb-3 block">Plaintext</Label>
              {decrypted ? (
                <div className="font-mono text-sm whitespace-pre-wrap break-words rounded-lg bg-background/60 border border-border p-4">{decrypted}</div>
              ) : (
                <div className="grid place-items-center h-80 text-center text-muted-foreground text-sm">
                  <div><Unlock className="h-10 w-10 mx-auto mb-3 opacity-30" />Decrypted output will appear here.</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onCopy, sensitive }: { label: string; value: string; onCopy: () => void; sensitive?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs">{label}</Label>
        <Button size="sm" variant="ghost" className="h-7" onClick={onCopy}><Copy className="h-3 w-3 mr-1" />Copy</Button>
      </div>
      <div className={`rounded-lg bg-background/60 border ${sensitive ? "border-warning/40" : "border-border"} p-3 font-mono text-xs break-all max-h-32 overflow-auto`}>{value}</div>
    </div>
  );
}
