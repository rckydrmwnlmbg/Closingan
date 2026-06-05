import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

export function PardonModal({
  isOpen,
  onClose,
  client,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: { id: string; ipAddress?: string; fingerprintHash?: string; reason?: string; blockedAt: string };
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePardon = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/abuse/${client.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSubmitting && !open && onClose()}
    >
      <DialogContent className="sm:max-w-md bg-gray-900/95 border border-gray-800 backdrop-blur-xl text-gray-100 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
            <ShieldCheck className="w-6 h-6 text-green-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            Pardon Threat
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 mt-2">
            Are you sure you want to unblock{" "}
            <span className="font-mono text-gray-300">
              {client.ipAddress || "this client"}
            </span>
            ? They will regain access to the system.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="hover:bg-gray-800 text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePardon}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Confirm Pardon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
