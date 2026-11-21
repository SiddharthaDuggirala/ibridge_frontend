export function money(amount: string | null): string {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(amount));
  }

  export function labelFor(options: { value: string; label: string }[], value: string | null): string {
    if (!value) return "—";
    return options.find((option) => option.value === value)?.label ?? value;
  }

export function hourlyRate(amount: number | undefined, currency: string | undefined): string {
    if (amount == null || !currency) return "—";
    const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
    return `${formatted}/hr`;
  }