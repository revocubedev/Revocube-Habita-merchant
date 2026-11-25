import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean; // adds a "None" row so an optional field can be emptied
  clearLabel?: string;
  id?: string;
  ariaLabel?: string;
  className?: string; // styles the closed field, so it can match any form
}

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  loading = false,
  disabled = false,
  clearable = false,
  clearLabel = "None",
  id,
  ariaLabel,
  className = "",
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const rows = useMemo<SelectOption[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
    return clearable && value && !q
      ? [{ value: "", label: clearLabel }, ...filtered]
      : filtered;
  }, [options, query, clearable, value, clearLabel]);

  const openMenu = () => {
    if (disabled || loading) return;
    setQuery("");
    setActive(
      Math.max(
        0,
        rows.findIndex((r) => r.value === value)
      )
    );
    setOpen(true);
  };

  const closeMenu = (refocus = true) => {
    setOpen(false);
    setQuery("");
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (next: string) => {
    onChange(next);
    closeMenu();
  };

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
    }
  }, [active, open]);

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(i + 1, rows.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Enter": {
        event.preventDefault(); // also stops the surrounding form from submitting
        const row = rows[active];
        if (row) choose(row.value);
        break;
      }
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        break;
      case "Tab":
        closeMenu(false);
        break;
    }
  };

  return (
    // preventDefault stops a wrapping <label> from re-clicking the trigger
    <div ref={rootRef} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            openMenu();
          }
        }}
        className={`flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <span className={`truncate ${selected ? "" : "text-[#a1a1a1]"}`}>
          {loading ? "Loading..." : selected?.label ?? placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[#e3e3e3] bg-white shadow-lg">
          <div className="relative border-b border-[#eaeaea] p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={listId}
              aria-activedescendant={
                rows[active] ? `${listId}-${active}` : undefined
              }
              className="h-9 w-full rounded-md border border-[#e3e3e3] bg-white pl-8 pr-2 text-sm text-[#4c4c4c] focus:outline-none focus:ring-2 focus:ring-[#f30100]/20"
              style={{ fontFamily: "Poppins" }}
            />
          </div>

          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {rows.map((row, index) => (
              <li
                key={row.value || "__clear"}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={row.value === value}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(row.value)}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  index === active ? "bg-[#fafafa]" : ""
                } ${row.value === value ? "font-medium" : ""} ${
                  row.value === "" ? "text-[#727272]" : "text-[#4c4c4c]"
                }`}
                style={
                  row.value === value && row.value !== ""
                    ? { color: "#f30100" }
                    : undefined
                }
              >
                {row.label}
              </li>
            ))}
          </ul>

          {rows.length === 0 && (
            <p className="px-4 py-3 text-sm text-[#727272]">{emptyText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
