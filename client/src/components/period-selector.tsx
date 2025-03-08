import { type Period } from "@/lib/yahoo-finance";
import { Button } from "@/components/ui/button";

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

const PERIODS: { label: string; value: Period }[] = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
  { label: "5Y", value: "5y" },
];

export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <Button
          key={p.value}
          variant={period === p.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
