import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAvatarUpload } from "../../hooks/useUpload";
import { useToast } from "../ui/Toast";

interface AvatarUploadProps {
  imageUrl?: string;
  initials: string;
  onUpload: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-lg",
};

export function AvatarUpload({ imageUrl, initials, onUpload, size = "md" }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useAvatarUpload();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be smaller than 2MB", "error");
      return;
    }

    try {
      const url = await upload.mutateAsync(file);
      onUpload(url);
      toast("Avatar updated", "success");
    } catch {
      toast("Failed to upload avatar", "error");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={upload.isPending}
        className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Avatar"
            className={`rounded-full object-cover ${sizeClasses[size]}`}
          />
        ) : (
          <div
            className={`flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 font-medium text-blue-600 dark:text-blue-400 ${sizeClasses[size]}`}
          >
            {initials}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {upload.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Camera className="h-4 w-4 text-white" />
          )}
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
