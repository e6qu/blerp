import { useState } from "react";
import { X, Loader2, Copy, Check, ShieldAlert } from "lucide-react";
import { useRegenerateBackupCodes } from "../../hooks/useTotp";

interface BackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackupCodesModal({ isOpen, onClose }: BackupCodesModalProps) {
  const [codes, setCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const regenerate = useRegenerateBackupCodes();

  const handleRegenerate = async () => {
    try {
      const result = await regenerate.mutateAsync();
      setCodes(result.codes);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCodes([]);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">Backup Codes</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {codes.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate new backup codes. This will invalidate any previously generated codes.
            </p>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm text-amber-700">
                Store these codes in a safe place. Each code can only be used once.
              </p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={regenerate.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {regenerate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {regenerate.isPending ? "Generating..." : "Generate new codes"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-700">
                Save these codes now. You won&apos;t be able to see them again.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-gray-50 p-4">
              {codes.map((code) => (
                <code key={code} className="text-sm font-mono text-gray-800">
                  {code}
                </code>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy all codes
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
