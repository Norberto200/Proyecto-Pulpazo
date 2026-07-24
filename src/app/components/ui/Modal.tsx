import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "bottom";
}

const maxWidthMap = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "sm",
  variant = "default",
}: ModalProps) {
  if (!open) return null;

  const justifyClass =
    variant === "bottom"
      ? "items-end sm:items-center"
      : "items-center";

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-xs flex ${justifyClass} justify-center z-50 p-4`}
      onClick={onClose}
    >
      <div
        className={`bg-card border border-border rounded-xl w-full ${maxWidthMap[maxWidth]} overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-xs tracking-widest text-primary uppercase font-semibold">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return <div className={`p-5 space-y-3.5 ${className}`}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return <div className="flex gap-3 pt-2">{children}</div>;
}
