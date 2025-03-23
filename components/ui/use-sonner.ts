import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Erstelle ein Hook, das die toast-Funktionalität bereitstellt
export const useToast = () => {
  const toast = (options: ToastOptions) => {
    if (options.variant === "destructive") {
      return sonnerToast.error(options.title || "", {
        description: options.description,
      });
    }
    return sonnerToast(options.title || "", {
      description: options.description,
    });
  };

  return {
    toast,
    error: (message: string | ToastOptions) => {
      if (typeof message === "string") {
        return sonnerToast.error(message);
      }
      return sonnerToast.error(message.title || "", {
        description: message.description,
      });
    },
    success: (message: string | ToastOptions) => {
      if (typeof message === "string") {
        return sonnerToast.success(message);
      }
      return sonnerToast.success(message.title || "", {
        description: message.description,
      });
    },
    warning: (message: string | ToastOptions) => {
      if (typeof message === "string") {
        return sonnerToast.warning(message);
      }
      return sonnerToast.warning(message.title || "", {
        description: message.description,
      });
    },
    info: (message: string | ToastOptions) => {
      if (typeof message === "string") {
        return sonnerToast.info(message);
      }
      return sonnerToast.info(message.title || "", {
        description: message.description,
      });
    },
  };
}; 