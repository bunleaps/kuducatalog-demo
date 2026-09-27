"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { createClient } from "../../../../lib/supabase/client";

export default function RemoveSetItemButton({ setItemId, itemTitle }: { setItemId: string; itemTitle: string }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function remove() {
    if (!confirm("Remove " + itemTitle + " from this project set?")) return;
    const supabase = createClient();
    if (!supabase) return;
    setRemoving(true);
    const { error } = await supabase.from("project_set_items").delete().eq("id", setItemId);
    if (!error) router.refresh();
    setRemoving(false);
  }

  return <Button variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs text-red-700 hover:bg-red-50 hover:text-red-700" onClick={remove} disabled={removing}><Trash2 size={13} />{removing ? "Removing…" : "Remove"}</Button>;
}
