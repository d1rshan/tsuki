import { useId, type HTMLInputTypeAttribute } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

type AuthFieldProps = {
  autoComplete?: string;
  error?: { message?: string };
  label: string;
  registration: UseFormRegisterReturn;
  type?: HTMLInputTypeAttribute;
};

export function AuthField({ autoComplete, error, label, registration, type }: AuthFieldProps) {
  const id = useId();

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...registration}
        aria-invalid={Boolean(error)}
      />
      <FieldError errors={error ? [error] : []} />
    </Field>
  );
}
