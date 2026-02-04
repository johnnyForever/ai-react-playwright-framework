import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortSelector } from './SortSelector';
import type { SortOption } from '@/types/product';

describe('SortSelector', () => {
  const defaultProps = {
    value: 'name-asc' as SortOption,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with label', () => {
      render(<SortSelector {...defaultProps} />);

      expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
    });

    it('should render all sort options', () => {
      render(<SortSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      expect(options).toHaveLength(4);
      expect(options.map((o) => o.value)).toEqual([
        'name-asc',
        'name-desc',
        'price-asc',
        'price-desc',
      ]);
    });

    it('should render correct option labels', () => {
      render(<SortSelector {...defaultProps} />);

      expect(screen.getByText('Name (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('Name (Z-A)')).toBeInTheDocument();
      expect(screen.getByText('Price (Low to High)')).toBeInTheDocument();
      expect(screen.getByText('Price (High to Low)')).toBeInTheDocument();
    });

    it('should show current value as selected', () => {
      render(<SortSelector {...defaultProps} value="price-desc" />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('price-desc');
    });
  });

  describe('interactions', () => {
    it('should call onChange when selection changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SortSelector value="name-asc" onChange={onChange} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'price-asc');

      expect(onChange).toHaveBeenCalledWith('price-asc');
    });

    it('should call onChange with correct value for each option', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SortSelector value="name-asc" onChange={onChange} />);

      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'name-desc');
      expect(onChange).toHaveBeenLastCalledWith('name-desc');

      await user.selectOptions(select, 'price-asc');
      expect(onChange).toHaveBeenLastCalledWith('price-asc');

      await user.selectOptions(select, 'price-desc');
      expect(onChange).toHaveBeenLastCalledWith('price-desc');

      await user.selectOptions(select, 'name-asc');
      expect(onChange).toHaveBeenLastCalledWith('name-asc');
    });
  });

  describe('accessibility', () => {
    it('should have associated label', () => {
      render(<SortSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAccessibleName('Sort by:');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SortSelector value="name-asc" onChange={onChange} />);

      const select = screen.getByRole('combobox');
      
      // Tab to select element (ensures it's focusable)
      await user.tab();
      expect(select).toHaveFocus();
      
      // Change selection using keyboard
      await user.selectOptions(select, 'price-asc');
      expect(onChange).toHaveBeenCalledWith('price-asc');
    });
  });
});
