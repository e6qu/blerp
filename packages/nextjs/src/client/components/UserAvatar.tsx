"use client";

import React from "react";
import { useCurrentUser } from "../hooks";

export interface UserAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  appearance?: Record<string, unknown>;
}

const sizeMap = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "U";
}

export function UserAvatar({ size = "md", className = "" }: UserAvatarProps) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className={`${sizeMap[size]} rounded-full bg-gray-100 animate-pulse ${className}`} />
    );
  }

  const initials = getInitials(
    user?.first_name,
    user?.last_name,
    user?.email_addresses?.[0]?.email,
  );

  if (user?.image_url) {
    return (
      <img
        src={user.image_url}
        alt={user.username || "User avatar"}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium flex items-center justify-center ${className}`}
    >
      {initials}
    </div>
  );
}
