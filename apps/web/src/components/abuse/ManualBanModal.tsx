import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

export function ManualBanModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/abuse/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: ipAddress || null,
          fingerprintHash: fingerprint || `MANUAL-${Date.now()}`,
          reason: reason || "Manually blocked by administrator",
        }),
      });
      if (res.ok) {
        setIpAddress("");
        setFingerprint("");
        setReason("");
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isSubmitting && !open && onClose()}
    >
      <DialogContent className="sm:max-w-md bg-gray-900/95 border border-red-900/50 backdrop-blur-xl text-gray-100 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            Register Manual Ban
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 mt-2">
            Manually restrict access for a specific IP or Device Fingerprint.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              IP Address (Optional)
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-200 placeholder:text-gray-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Fingerprint Hash (Optional)
            </label>
            <input
              type="text"
              value={fingerprint}
              onChange={(e) => setFingerprint(e.target.value)}
              placeholder="e.g. abc123def456..."
              className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-200 placeholder:text-gray-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this entity being blocked?"
              rows={3}
              className="w-full px-3 py-2 bg-black/40 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-200 placeholder:text-gray-600 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!ipAddress && !fingerprint)}
              className="bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Enforce Ban
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
