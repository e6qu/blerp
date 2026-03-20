import { useMutation } from "@tanstack/react-query";
import { getCsrfToken, getAuthHeaders } from "../lib/api";

export function useAvatarUpload() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      // Convert file to base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      };
      if (token) {
        headers["x-csrf-token"] = token;
      }

      const response = await fetch("/v1/uploads/avatar", {
        method: "POST",
        headers,
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to upload avatar");
      }

      const data = await response.json();
      return data.url as string;
    },
  });
}
