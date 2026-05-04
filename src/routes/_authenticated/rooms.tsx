import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, Crown, Eye, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/rooms")({
  head: () => ({ meta: [{ title: "Secure Rooms — ShieldVault" }] }),
  component: RoomsPage,
});

interface Room {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  last_activity_at: string;
  members?: { user_id: string; role: string }[];
}

const demoMembers = [
  { initials: "AR", color: "from-pink-500 to-rose-500", role: "Admin" },
  { initials: "MC", color: "from-blue-500 to-cyan-500", role: "Member" },
  { initials: "PS", color: "from-emerald-500 to-teal-500", role: "Member" },
  { initials: "JD", color: "from-purple-500 to-violet-500", role: "Viewer" },
];

function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    const { data } = await supabase.from("rooms").select("*").order("last_activity_at", { ascending: false });
    setRooms((data ?? []) as Room[]);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return toast.error("Name required");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("rooms").insert({ name, description: desc, owner_id: user.id }).select().single();
    if (error) return toast.error(error.message);
    if (data) await supabase.from("room_members").insert({ room_id: data.id, user_id: user.id, role: "admin" });
    toast.success("Room created");
    setOpen(false); setName(""); setDesc("");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Secure Rooms"
        description="End-to-end encrypted workspaces for your team."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4 mr-2" />New Room</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a Secure Room</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label className="mb-1.5 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Compliance Working Group" /></div>
                <div><Label className="mb-1.5 block">Description</Label><Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What this room is for…" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {rooms.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-semibold">No rooms yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create your first secure room to collaborate on encrypted data.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{r.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description || "No description"}</p>
                </div>
                <RoleBadge role="Admin" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {demoMembers.slice(0, 4).map((m, i) => (
                    <div key={i} className={`h-7 w-7 rounded-full bg-gradient-to-br ${m.color} grid place-items-center text-[10px] font-bold text-white border-2 border-card`}>{m.initials}</div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">4 members</span>
              </div>
              <div className="mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                Active {formatDistanceToNow(new Date(r.last_activity_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const Icon = role === "Admin" ? Crown : role === "Viewer" ? Eye : UserIcon;
  const cls = role === "Admin" ? "bg-warning/10 text-warning border-warning/30" : role === "Viewer" ? "bg-muted text-muted-foreground border-border" : "bg-primary/10 text-primary border-primary/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      <Icon className="h-2.5 w-2.5" />{role}
    </span>
  );
}
