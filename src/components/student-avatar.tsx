import React from "react";
import { cn } from "@/lib/utils";

export const AVAILABLE_KID_AVATARS = Array.from(
  { length: 24 },
  (_, i) => `/images/avatars/avatar-${i + 1}.png`
);

interface StudentAvatarProps {
  avatar?: string | null;
  name?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const SIZE_MAP = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-2xl",
  "2xl": "w-20 h-20 text-3xl",
};

export function StudentAvatar({
  avatar,
  name,
  className = "",
  size = "md",
}: StudentAvatarProps) {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  // If avatar is one of our custom illustrated avatars or image URL
  const isImageAvatar =
    avatar &&
    (avatar.startsWith("/images/") ||
      avatar.startsWith("http") ||
      avatar.startsWith("data:") ||
      avatar.startsWith("avatar-") ||
      avatar.endsWith(".png") ||
      avatar.endsWith(".jpg"));

  const imageSrc =
    avatar && avatar.startsWith("avatar-")
      ? `/images/avatars/${avatar}.png`
      : avatar || "/images/avatars/avatar-1.png";

  if (isImageAvatar) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-amber-50/50 border border-slate-200/80 shadow-2xs select-none",
          sizeClasses,
          className
        )}
      >
        <img
          src={imageSrc}
          alt={name ? `${name}'s Avatar` : "Student Avatar"}
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="lazy"
          onError={(e) => {
            // Fallback to first avatar if image fails
            (e.target as HTMLImageElement).src = "/images/avatars/avatar-1.png";
          }}
        />
      </div>
    );
  }

  // Fallback for legacy emoji avatars or initials
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full shrink-0 bg-blue-50 border border-blue-200/80 text-slate-800 font-bold select-none",
        sizeClasses,
        className
      )}
    >
      {avatar || (name ? name.charAt(0).toUpperCase() : "👧")}
    </div>
  );
}
