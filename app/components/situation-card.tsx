"use client";

import { motion } from "framer-motion";
import type { Situation } from "@/app/lib/oracle-situations";

interface SituationCardProps {
  situation: Situation;
  isSelected: boolean;
  isSpecial?: boolean;
  onClick: () => void;
}

export function SituationCard({
  situation,
  isSelected,
  isSpecial = false,
  onClick,
}: SituationCardProps) {
  return (
    <motion.button
      onClick={onClick}
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-lg px-4 py-3 text-left transition-all duration-200
        ${isSpecial ? "col-span-2" : ""}
        ${
          isSelected
            ? "shadow-md"
            : "border border-line bg-elevated text-secondary hover:border-accent-primary"
        }
      `}
      style={
        isSelected
          ? {
              borderColor: "#D4AF37",
              backgroundColor: "#D4AF37",
              color: "#0F0D0A",
            }
          : {
              borderColor: "#6B7280",
              backgroundColor: "transparent",
              color: "#C9BFA8",
            }
      }
    >
      <span className="relative block text-sm font-medium leading-snug">
        {situation.label}
      </span>
    </motion.button>
  );
}
