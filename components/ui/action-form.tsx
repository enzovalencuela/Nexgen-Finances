"use client";

import type { ComponentPropsWithoutRef, FormEvent } from "react";
import { cloneElement, isValidElement, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";

type Props = Omit<ComponentPropsWithoutRef<"form">, "action" | "onSubmit"> & {
  serverAction: (formData: FormData) => Promise<ActionResult>;
  resetOnSuccess?: boolean;
  closeDetailsOnSuccess?: boolean;
};

function injectPendingState(children: React.ReactNode, isPending: boolean): React.ReactNode {
  return Array.isArray(children)
    ? children.map((child, index) => injectPendingStateIntoNode(child, isPending, `${index}`))
    : injectPendingStateIntoNode(children, isPending, "0");
}

function injectPendingStateIntoNode(child: React.ReactNode, isPending: boolean, key: string): React.ReactNode {
  if (!isValidElement(child)) {
    return child;
  }

  const elementType = typeof child.type === "string" ? child.type : null;
  const nextChildren = child.props.children ? injectPendingState(child.props.children, isPending) : child.props.children;

  if (elementType === "button") {
    return cloneElement(child, {
      key,
      disabled: isPending || child.props.disabled,
      children: nextChildren
    });
  }

  return cloneElement(child, {
    key,
    children: nextChildren
  });
}

export function ActionForm({
  serverAction,
  resetOnSuccess = false,
  closeDetailsOnSuccess = false,
  className,
  children,
  ...props
}: Props) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await serverAction(formData);

        if (!result.ok) {
          pushToast({ message: result.message, tone: "error" });
          return;
        }

        if (resetOnSuccess) {
          form.reset();
        }

        if (closeDetailsOnSuccess) {
          form.closest("details")?.removeAttribute("open");
        }

        pushToast({ message: result.message, tone: "success" });
        router.refresh();
      } catch (error) {
        pushToast({
          message: error instanceof Error ? error.message : "Não foi possível concluir a ação.",
          tone: "error"
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn(isPending && "opacity-90", className)} aria-busy={isPending} {...props}>
      {injectPendingState(children, isPending)}
    </form>
  );
}
