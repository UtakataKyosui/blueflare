"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/diary/${entryId}`, { method: "DELETE" });
      if (res.ok) {
        window.dispatchEvent(new Event("diary-updated"));
        router.back();
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (confirmOpen) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">本当に削除しますか？</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "削除中..." : "削除する"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmOpen(false)}
          disabled={isDeleting}
        >
          キャンセル
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={() => setConfirmOpen(true)}
    >
      <Trash2 className="w-4 h-4 mr-1.5" />
      削除
    </Button>
  );
}
