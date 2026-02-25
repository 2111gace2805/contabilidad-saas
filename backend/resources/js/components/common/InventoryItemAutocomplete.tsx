import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { inventoryItems } from '../../lib/api';
import { useCompany } from '../../contexts/CompanyContext';

export interface InventoryItemOption {
  id: number;
  item_code?: string;
  code?: string;
  name?: string;
  average_cost?: number;
  item_type?: 'bien' | 'servicio' | 'ambos';
  active?: boolean;
}

interface InventoryItemAutocompleteProps {
  value: number | '';
  onSelect: (item: InventoryItemOption | null) => void;
  textValue?: string;
  onTextChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function InventoryItemAutocomplete({
  value,
  onSelect,
  textValue,
  onTextChange,
  placeholder = 'Buscar producto o servicio...',
  className = '',
}: InventoryItemAutocompleteProps) {
  const { selectedCompany } = useCompany();
  const [options, setOptions] = useState<InventoryItemOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((item) => String(item.id) === String(value)), [options, value]);

  useEffect(() => {
    if (typeof textValue === 'string' && !showDropdown) {
      setSearchTerm(textValue);
    }
  }, [textValue, showDropdown]);

  useEffect(() => {
    if (selectedCompany) {
      loadItems();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selected && !showDropdown) {
      setSearchTerm(`${selected.item_code || selected.code || ''} ${selected.name || ''}`.trim());
    }
  }, [selected, showDropdown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizeList = (data: any) => {
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray((data as any)?.data?.data)
          ? (data as any).data.data
          : [];

    return list
      .filter((item: any) => item.active !== false)
      .map((item: any) => ({
        id: Number(item.id),
        item_code: item.item_code,
        code: item.code,
        name: item.name,
        average_cost: Number(item.average_cost ?? 0),
        item_type: item.item_type || 'bien',
        active: item.active,
      }));
  };

  const loadItems = async () => {
    try {
      const data = await inventoryItems.getAll({ per_page: 100 });
      setOptions(normalizeList(data));
    } catch (error) {
      console.error('Error loading inventory items:', error);
      setOptions([]);
    }
  };

  const searchItems = async (term: string) => {
    try {
      if (term.trim().length < 2) {
        await loadItems();
        return;
      }

      const data = await inventoryItems.search(term.trim());
      setOptions(normalizeList(data));
    } catch (error) {
      console.error('Error searching inventory items:', error);
      setOptions([]);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options.slice(0, 50);

    return options
      .filter((item) =>
        [item.item_code, item.code, item.name, item.item_type]
          .map((value) => String(value || '').toLowerCase())
          .some((value) => value.includes(term))
      )
      .slice(0, 50);
  }, [options, searchTerm]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valueText = event.target.value;
    setSearchTerm(valueText);
    onTextChange?.(valueText);
    setShowDropdown(true);

    searchItems(valueText);

    if (!valueText.trim()) {
      onSelect(null);
    }
  };

  const handleSelect = (item: InventoryItemOption) => {
    onSelect(item);
    const selectedText = `${item.item_code || item.code || ''} ${item.name || ''}`.trim();
    setSearchTerm(selectedText);
    onTextChange?.(selectedText);
    setShowDropdown(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (event.key === 'Enter' || event.key === 'ArrowDown') {
        setShowDropdown(true);
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onFocus={() => setShowDropdown(true)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 pr-8 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-slate-500"
          placeholder={placeholder}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500">No se encontraron ítems</div>
          ) : (
            filtered.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(item);
                }}
                className={`w-full px-3 py-2 text-left transition-colors border-b border-slate-50 last:border-0 ${index === selectedIndex ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'} ${value === item.id ? 'bg-blue-100 font-semibold' : ''}`}
              >
                <div className="text-[10px] font-mono text-slate-400">{item.item_code || item.code || 'SIN-COD'}</div>
                <div className="text-xs font-medium truncate">{item.name || 'Ítem sin nombre'}</div>
                <div className="text-[11px] text-slate-500 capitalize">{item.item_type || 'bien'}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
