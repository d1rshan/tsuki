"use client";

import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

/**
 * The slice of TanStack Form our building blocks render through. Concrete
 * forms from `useForm` carry 12 invariant generics that resist widening,
 * so this seam stays loose while call sites stay fully typed.
 */
// ponytail: structural `any` seam; tighten if tanstack ships AnyReactFormApi
export type AnyForm = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  Field: any;
  Subscribe: any;
  handleSubmit: () => Promise<void>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

type TextFieldProps = {
  form: AnyForm;
  hideLabel?: boolean;
  label: string;
  name: string;
  rows?: number;
  textarea?: boolean;
} & Omit<ComponentProps<typeof Input>, "form" | "id" | "name" | "value" | "onChange" | "onBlur">;

/** A schema-validated text field wired to a TanStack Form. */
export function TextField({ form, hideLabel, label, name, textarea, ...input }: TextFieldProps) {
  return (
    <form.Field name={name}>
      {(field: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name} className={cn(hideLabel && "sr-only")}>
              {label}
            </FieldLabel>
            {textarea ? (
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                {...(input as ComponentProps<typeof Textarea>)}
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={isInvalid}
                {...input}
              />
            )}
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
