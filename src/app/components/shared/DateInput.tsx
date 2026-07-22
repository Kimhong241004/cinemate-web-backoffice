import { useEffect, useRef, useState } from "react";
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface DateRangeValue {
  start: Date | null;
  end: Date | null;
}

interface DateInputProps {
  label?: string;
  required?: boolean;
  error?: boolean;
  requireFuture?: boolean;
  initialRange?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString("en-US", { month: "short" }),
);

const currentRealYear = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => currentRealYear - 50 + i);

const PRESETS: { key: string; label: string; days: number }[] = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
  { key: "1y", label: "1y", days: 365 },
];

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const addMonths = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  return result;
};

const addYears = (date: Date, amount: number) => {
  const result = new Date(date);
  result.setDate(1);
  result.setFullYear(result.getFullYear() + amount);
  return result;
};

const addMonthsFromToday = (amount: number) => {
  const today = new Date();
  today.setMonth(today.getMonth() + amount);
  return startOfDay(today);
};

const addYearsFromToday = (amount: number) => {
  const today = new Date();
  today.setFullYear(today.getFullYear() + amount);
  return startOfDay(today);
};

const sameDay = (a: Date | null, b: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatLong = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select a date";

const formatShort = (date: Date | null) =>
  date
    ? `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
        date.getDate(),
      ).padStart(2, "0")}/${date.getFullYear()}`
    : "";

const parseRelative = (text: string): Date | null => {
  const match = text.trim().match(/^(\d+)\s*([dwmy])$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "d") return addDays(startOfDay(new Date()), amount);
  if (unit === "w") return addDays(startOfDay(new Date()), amount * 7);
  if (unit === "m") return addMonthsFromToday(amount);
  if (unit === "y") return addYearsFromToday(amount);
  return null;
};

const parseShort = (text: string): Date | null => {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }
  return startOfDay(candidate);
};

const daysInMonthGrid = (viewDate: Date): Date[] => {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
};

const pillClass = (active: boolean) =>
  `px-2 py-2 rounded-full text-xs font-medium text-center transition-colors ${
    active
      ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
      : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]"
  }`;

const DateInput = ({
  label = "Date Range",
  required = true,
  error = false,
  requireFuture = false,
  initialRange,
  onChange,
}: DateInputProps) => {
  const [range, setRange] = useState<DateRangeValue>(
    initialRange ?? { start: null, end: null },
  );
  const [draftRange, setDraftRange] = useState<DateRangeValue>(range);
  const [pendingEdge, setPendingEdge] = useState<"start" | "end">("start");
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [customEditing, setCustomEditing] = useState(false);
  const [customText, setCustomText] = useState("");
  const [open, setOpen] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [viewDate, setViewDate] = useState<Date>(range.start ?? new Date());
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

  const fieldRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const monthMenuRef = useRef<HTMLDivElement>(null);
  const yearMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (fieldRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (customEditing) customInputRef.current?.focus();
  }, [customEditing]);

  useEffect(() => {
    if (!monthMenuOpen && !yearMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (monthMenuRef.current?.contains(target) || yearMenuRef.current?.contains(target)) {
        return;
      }
      setMonthMenuOpen(false);
      setYearMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [monthMenuOpen, yearMenuOpen]);

  useEffect(() => {
    if (!monthMenuOpen) return;
    monthMenuRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: "center" });
  }, [monthMenuOpen]);

  useEffect(() => {
    if (!yearMenuOpen) return;
    yearMenuRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: "center" });
  }, [yearMenuOpen]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const closeMenus = () => {
    setMonthMenuOpen(false);
    setYearMenuOpen(false);
  };

  const openPanel = () => {
    setDraftRange(range);
    setPendingEdge(range.start && !range.end ? "end" : "start");
    setHoverDate(null);
    setActivePreset(null);
    setCustomEditing(false);
    setCustomText("");
    setViewDate(range.start ?? new Date());
    closeMenus();
    setOpen(true);
  };

  const handleConfirm = () => {
    const chosen = draftRange.end ?? draftRange.start;
    if (requireFuture && chosen && chosen <= startOfDay(new Date())) {
      setConfirmError("Expiration date must be in the future");
      return;
    }
    const finalRange: DateRangeValue = {
      start: draftRange.start,
      end: draftRange.end ?? draftRange.start,
    };
    setRange(finalRange);
    onChange?.(finalRange);
    setConfirmError("");
    closeMenus();
    setOpen(false);
  };

  const handleCancel = () => {
    setDraftRange(range);
    setConfirmError("");
    closeMenus();
    setOpen(false);
  };

  const handlePreset = (preset: (typeof PRESETS)[number]) => {
    const today = startOfDay(new Date());
    setDraftRange({ start: today, end: addDays(today, preset.days) });
    setActivePreset(preset.key);
    setCustomEditing(false);
    setPendingEdge("start");
    setViewDate(today);
  };

  const handleCustomSubmit = () => {
    const text = customText.trim();
    if (!text) {
      setCustomEditing(false);
      return;
    }
    const parsed = parseRelative(text) ?? parseShort(text);
    if (!parsed) {
      setCustomEditing(false);
      setCustomText("");
      return;
    }
    if (!draftRange.start || pendingEdge === "start") {
      setDraftRange({ start: parsed, end: null });
      setPendingEdge("end");
      setActivePreset("Custom");
      setViewDate(parsed);
      setCustomText("");
      customInputRef.current?.focus();
    } else {
      const start = draftRange.start;
      const next =
        parsed < start ? { start: parsed, end: start } : { start, end: parsed };
      setDraftRange(next);
      setCustomEditing(false);
      setCustomText("");
      setPendingEdge("start");
    }
  };

  const handleDayClick = (day: Date) => {
    if (!draftRange.start || day < draftRange.start) {
      setDraftRange({ start: day, end: null });
      setPendingEdge("end");
    } else {
      setDraftRange({ ...draftRange, end: day });
      setPendingEdge("start");
    }
    setActivePreset(null);
    setConfirmError("");
  };

  const monthLabel = MONTHS[viewDate.getMonth()];
  const yearLabel = viewDate.getFullYear();

  const selectMonth = (monthIndex: number) => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setDate(1);
      next.setMonth(monthIndex);
      return next;
    });
    setMonthMenuOpen(false);
  };

  const selectYear = (year: number) => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setDate(1);
      next.setFullYear(year);
      return next;
    });
    setYearMenuOpen(false);
  };
  const today = startOfDay(new Date());

  const previewEnd =
    draftRange.end ??
    (hoverDate && draftRange.start && hoverDate > draftRange.start ? hoverDate : null);

  return (
    <div className="w-full max-w-[460px]">
      <label className="block text-white text-sm font-medium mb-2">
        {label} {required && <span className="text-[#6C5CE7]">*</span>}
      </label>

      <div ref={fieldRef}>
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openPanel())}
          className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-[#0a0a0a] text-sm transition-colors ${
            open
              ? "border-[#6C5CE7] shadow-[0_0_0_3px_rgba(108,92,231,0.16)]"
              : error
                ? "border-[#ef4444]"
                : "border-[#27272a]"
          }`}
        >
          <Calendar className="w-4 h-4 text-[#6C5CE7] flex-shrink-0" />
          <span className={range.start ? "text-white" : "text-[#52525b]"}>
            {range.start
              ? `${formatShort(range.start)} → ${formatShort(range.end ?? range.start)}`
              : "Select date range"}
          </span>
        </button>
      </div>

      {open && (
        <div
          ref={panelRef}
          className="mt-3 w-full box-border bg-[#18181b] border border-[#27272a] rounded-2xl p-4"
        >
          <h4 className="text-white text-sm font-semibold mb-2">Select Range</h4>
          <p className="text-white text-lg font-bold mb-4">
            {draftRange.start
              ? `${formatLong(draftRange.start)} → ${
                  draftRange.end ? formatLong(draftRange.end) : "Select end date"
                }`
              : "Select a date"}
          </p>

          <p className="text-[#71717a] text-xs uppercase tracking-wide mb-2">
            Quick select
          </p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handlePreset(preset)}
                className={pillClass(activePreset === preset.key)}
              >
                {preset.label}
              </button>
            ))}
            {customEditing ? (
              <input
                ref={customInputRef}
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCustomSubmit();
                  }
                  if (e.key === "Escape") {
                    setCustomEditing(false);
                    setCustomText("");
                  }
                }}
                onBlur={() => setCustomEditing(false)}
                placeholder="1y, 2m, 10d"
                className="px-2 py-2 rounded-full text-xs text-center bg-[rgba(108,92,231,0.16)] border border-[#6C5CE7] text-white outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCustomEditing(true);
                  setCustomText("");
                }}
                className={pillClass(activePreset === "Custom")}
              >
                Custom
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mb-3">
            <div ref={monthMenuRef} className="relative">
              <div className="flex items-center gap-1 bg-[#27272a] rounded-full px-1 py-1">
                <button
                  type="button"
                  onClick={() => setViewDate((prev) => addMonths(prev, -1))}
                  className="p-1 rounded-full hover:bg-[#3f3f46]"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMonthMenuOpen((o) => !o);
                    setYearMenuOpen(false);
                  }}
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-white text-sm font-medium hover:bg-[#3f3f46]"
                >
                  <span className="min-w-[32px] text-center">{monthLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate((prev) => addMonths(prev, 1))}
                  className="p-1 rounded-full hover:bg-[#3f3f46]"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {monthMenuOpen && (
                <div className="absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 w-28 max-h-40 overflow-y-auto bg-[#18181b] border border-[#27272a] rounded-xl shadow-lg py-1">
                  {MONTHS.map((label, i) => {
                    const selected = i === viewDate.getMonth();
                    return (
                      <button
                        key={label}
                        type="button"
                        data-selected={selected}
                        onClick={() => selectMonth(i)}
                        className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-left transition-colors ${
                          selected
                            ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white font-semibold"
                            : "text-[#a1a1aa] hover:bg-[#27272a]"
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div ref={yearMenuRef} className="relative">
              <div className="flex items-center gap-1 bg-[#27272a] rounded-full px-1 py-1">
                <button
                  type="button"
                  onClick={() => setViewDate((prev) => addYears(prev, -1))}
                  className="p-1 rounded-full hover:bg-[#3f3f46]"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setYearMenuOpen((o) => !o);
                    setMonthMenuOpen(false);
                  }}
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-white text-sm font-medium hover:bg-[#3f3f46]"
                >
                  <span className="min-w-[36px] text-center">{yearLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate((prev) => addYears(prev, 1))}
                  className="p-1 rounded-full hover:bg-[#3f3f46]"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {yearMenuOpen && (
                <div className="absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 w-24 max-h-40 overflow-y-auto bg-[#18181b] border border-[#27272a] rounded-xl shadow-lg py-1">
                  {YEARS.map((year) => {
                    const selected = year === yearLabel;
                    return (
                      <button
                        key={year}
                        type="button"
                        data-selected={selected}
                        onClick={() => selectYear(year)}
                        className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-left transition-colors ${
                          selected
                            ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white font-semibold"
                            : "text-[#a1a1aa] hover:bg-[#27272a]"
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] text-[#71717a] mb-1">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {daysInMonthGrid(viewDate).map((day) => {
              const inCurrentMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = sameDay(day, draftRange.start) || sameDay(day, draftRange.end);
              const inRange =
                !isSelected &&
                !!draftRange.start &&
                !!previewEnd &&
                day > draftRange.start &&
                day < previewEnd;
              const isToday = sameDay(day, today);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(startOfDay(day))}
                  onMouseEnter={() => setHoverDate(startOfDay(day))}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`h-8 text-xs flex items-center justify-center ${
                    isSelected
                      ? "rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white font-bold"
                      : inRange
                        ? "rounded-none bg-[rgba(108,92,231,0.16)] text-white"
                        : isToday
                          ? "rounded-full text-[#6C5CE7] font-semibold hover:bg-[#27272a]"
                          : inCurrentMonth
                            ? "rounded-full text-white hover:bg-[#27272a]"
                            : "rounded-full text-[#3f3f46]"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="pt-3 mt-3 border-t border-[#27272a]">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg text-[#6C5CE7] text-sm font-semibold hover:bg-[#27272a] transition-colors"
              >
                Confirm
              </button>
            </div>
            {confirmError && (
              <p className="text-[#ef4444] text-xs mt-2 text-right">{confirmError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInput;
