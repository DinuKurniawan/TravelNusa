import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  align = "left",
}: {
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("flex max-w-3xl flex-col gap-3", align === "center" && "mx-auto text-center")}>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      {description ? <p className="text-base leading-7 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
