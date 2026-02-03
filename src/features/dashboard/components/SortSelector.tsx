import type { SortOption } from '@/types/product';
import { SORT_OPTIONS } from '@/types/product';

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelector({ value, onChange }: SortSelectorProps): JSX.Element {
  return (
    <div className="sort-selector">
      <label htmlFor="sort" className="sort-selector__label">
        Sort by:
      </label>
      <select
        id="sort"
        className="sort-selector__select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
