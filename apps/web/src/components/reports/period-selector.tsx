"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Period = "daily" | "monthly" | "financial-year";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
  year: number;
  onYearChange: (y: number) => void;
  month: number;
  onMonthChange: (m: number) => void;
  date?: string;
  onDateChange: (d: string) => void;
  maxDate?: string;
}

export function PeriodSelector({
  period,
  onPeriodChange,
  year,
  onYearChange,
  month,
  onMonthChange,
  date,
  onDateChange,
  maxDate,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Period toggle */}
      <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="financial-year">Financial Year</SelectItem>
        </SelectContent>
      </Select>

      {/* Daily — date picker */}
      {period === "daily" && (
        <input
          type="date"
          value={date}
          max={maxDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        />
      )}

      {/* Monthly — month + year */}
      {period === "monthly" && (
        <>
          <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {/* Financial year selector */}
      {period === "financial-year" && (
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>FY {y}–{y + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

// Re-export MONTHS for use in page.tsx
export { MONTHS };
