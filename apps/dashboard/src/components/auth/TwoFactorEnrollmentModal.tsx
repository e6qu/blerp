import { useState } from "react";
import { X, Loader2, Copy, Check, Shield } from "lucide-react";
import { useEnrollTotp, useVerifyTotp } from "../../hooks/useTotp";

interface TwoFactorEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorEnrollmentModal({ isOpen, onClose }: TwoFactorEnrollmentModalProps) {
  const [step, setStep] = useState<"enroll" | "verify" | "backup">("enroll");
  const [enrollmentData, setEnrollmentData] = useState<{
    secret: string;
    uri: string;
    qr_code_url: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrollTotp = useEnrollTotp();
  const verifyTotp = useVerifyTotp();

  const handleStartEnrollment = async () => {
    setError(null);
    try {
      const data = await enrollTotp.mutateAsync();
      setEnrollmentData(data);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start enrollment");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await verifyTotp.mutateAsync(verificationCode);
      setBackupCodes(result.backup_codes);
      setStep("backup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    }
  };

  const handleCopySecret = async () => {
    if (enrollmentData?.secret) {
      await navigator.clipboard.writeText(enrollmentData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setStep("enroll");
    setEnrollmentData(null);
    setVerificationCode("");
    setBackupCodes([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {step === "enroll" && "Enable Two-Factor Authentication"}
              {step === "verify" && "Verify Authenticator App"}
              {step === "backup" && "Save Backup Codes"}
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "enroll" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication adds an extra layer of security to your account by requiring
              a code from an authenticator app on your phone.
            </p>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartEnrollment}
                disabled={enrollTotp.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {enrollTotp.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {enrollTotp.isPending ? "Starting..." : "Get Started"}
              </button>
            </div>
          </div>
        )}

        {step === "verify" && enrollmentData && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-600">
              Scan this QR code with your authenticator app (like Google Authenticator or Authy),
              then enter the 6-digit code below.
            </p>

            <div className="flex justify-center">
              <div className="rounded-lg border bg-gray-50 p-4">
                <img src={enrollmentData.qr_code_url} alt="QR Code for 2FA" className="h-48 w-48" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Or enter this code manually
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-mono">
                  {enrollmentData.secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="rounded p-2 hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("enroll")}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={verifyTotp.isPending || verificationCode.length !== 6}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {verifyTotp.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {verifyTotp.isPending ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        )}

        {step === "backup" && backupCodes.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Save these backup codes in a safe place. You can use them to access your account if
              you lose your authenticator device.
            </p>

            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="rounded bg-white px-3 py-2 text-center font-mono text-sm"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> These codes will only be shown once. Store them
                securely.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
