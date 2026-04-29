import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminFormCard({
  title,
  action,
  children,
}: {
  title: string;
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-5">
          <FieldGroup>{children}</FieldGroup>
          <Button type="submit" className="w-fit">
            <Save data-icon="inline-start" />
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} />
    </Field>
  );
}

export function TextareaField({
  name,
  label,
  defaultValue,
  rows = 4,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | string[] | null;
  rows?: number;
  required?: boolean;
}) {
  const value = Array.isArray(defaultValue) ? defaultValue.join("\n") : defaultValue ?? "";
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea id={name} name={name} rows={rows} defaultValue={value} required={required} />
    </Field>
  );
}

export function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  options: { label: string; value: string }[];
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <select id={name} name={name} defaultValue={defaultValue ?? options[0]?.value} className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4" />
      {label}
    </label>
  );
}

export function FileField({ name, label }: { name: string; label: string }) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} name={name} type="file" accept="image/*" />
    </Field>
  );
}
