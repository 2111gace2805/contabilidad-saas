import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { customers } from '../../lib/api';
import { useCompany } from '../../contexts/CompanyContext';

interface CustomerOption {
  id: number;
  code?: string;
  name?: string;
  business_name?: string;
  nit?: string;
  active?: boolean;
}

interface CustomerAutocompleteProps {
  value: number | '';
  onChange: (customerId: number | '') => void;
  className?: string;
  placeholder?: string;
}

// Autocomplete input for customers, matching the UX used for account search in journal entries.
export function CustomerAutocomplete({ value, onChange, className = '', placeholder = 'Buscar cliente...' }: CustomerAutocompleteProps) {
  const { selectedCompany } = useCompany();
  const [options, setOptions] = useState<CustomerOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((c) => String(c.id) === String(value)), [options, value]);

  useEffect(() => {
    if (selectedCompany) {
      loadCustomers();
    }
  }, [selectedCompany]);

  const loadCustomers = async () => {
    try {
      const data = await customers.getAll();
      const list = Array.isArray(data) ? data : ((data as any)?.data || []);
      const normalized = list
        .filter((c: CustomerOption) => c.active !== false)
        .map((c: any) => ({
          id: c.id,
          code: c.code || c.customer_code,
          name: c.name || c.business_name,
          business_name: c.business_name,
          nit: c.nit,
          active: c.active,
        }));
      setOptions(normalized);
    } catch (err) {
      console.error('Error loading customers:', err);
      setOptions([]);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options.slice(0, 50);
    return options
      .filter((c) =>
        [c.code, c.name, c.business_name, c.nit]
          .map((v) => String(v || '').toLowerCase())
          .some((v) => v.includes(term))
      )
      .slice(0, 50);
  }, [options, searchTerm]);

  useEffect(() => {
    if (selected && !showDropdown) {
      setSearchTerm(`${selected.code || ''} ${selected.code ? '- ' : ''}${selected.name || ''}`.trim());
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
        if (selected) {
          setSearchTerm(`${selected.code || ''} ${selected.code ? '- ' : ''}${selected.name || ''}`.trim());
        } else {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (selected && searchTerm === '') {
      setSearchTerm(`${selected.code || ''} ${selected.code ? '- ' : ''}${selected.name || ''}`.trim());
    }
  };

  const handleSelect = (option: CustomerOption) => {
    onChange(option.id);
    setSearchTerm(`${option.code || ''} ${option.code ? '- ' : ''}${option.name || ''}`.trim());
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setShowDropdown(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        if (selected) {
          setSearchTerm(`${selected.code || ''} ${selected.code ? '- ' : ''}${selected.name || ''}`.trim());
        } else {
          setSearchTerm('');
        }
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
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          placeholder={placeholder}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No se encontraron clientes</div>
          ) : (
            filtered.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-slate-50 last:border-0 ${index === selectedIndex ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'} ${value === option.id ? 'bg-blue-100 font-semibold' : ''}`}
              >
                <div className="text-[10px] font-mono text-slate-400 mb-0.5 uppercase tracking-tighter">{option.code || 'SIN-COD'}</div>
                <div className="font-medium truncate">{option.name || option.business_name || 'Cliente sin nombre'}</div>
                {option.nit && <div className="text-[11px] text-slate-500">NIT: {option.nit}</div>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
