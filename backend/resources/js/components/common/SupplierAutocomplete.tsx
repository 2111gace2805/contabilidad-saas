import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { suppliers } from '../../lib/api';
import { useCompany } from '../../contexts/CompanyContext';

interface SupplierOption {
  id: number;
  code?: string;
  name?: string;
  nit?: string;
  active?: boolean;
}

interface SupplierAutocompleteProps {
  value: number | '';
  onChange: (supplierId: number | '') => void;
  className?: string;
  placeholder?: string;
}

export function SupplierAutocomplete({ value, onChange, className = '', placeholder = 'Buscar proveedor...' }: SupplierAutocompleteProps) {
  const { selectedCompany } = useCompany();
  const [options, setOptions] = useState<SupplierOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((s) => String(s.id) === String(value)), [options, value]);

  useEffect(() => {
    if (selectedCompany) {
      loadSuppliers();
    }
  }, [selectedCompany]);

  const loadSuppliers = async (term = '') => {
    try {
      const data = term ? await suppliers.search(term) : await suppliers.getAll({ per_page: 100 });
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.data?.data)
            ? (data as any).data.data
            : [];

      const normalized = list
        .filter((supplier: SupplierOption) => supplier.active !== false)
        .map((supplier: any) => ({
          id: supplier.id,
          code: supplier.code,
          name: supplier.name,
          nit: supplier.nit,
          active: supplier.active,
        }));

      setOptions(normalized);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setOptions([]);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options.slice(0, 50);

    return options
      .filter((supplier) =>
        [supplier.code, supplier.name, supplier.nit]
          .map((value) => String(value || '').toLowerCase())
          .some((value) => value.includes(term))
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

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    if (value.trim().length >= 2) {
      await loadSuppliers(value.trim());
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (selected && searchTerm === '') {
      setSearchTerm(`${selected.code || ''} ${selected.code ? '- ' : ''}${selected.name || ''}`.trim());
    }
  };

  const handleSelect = (option: SupplierOption) => {
    onChange(option.id);
    setSearchTerm(`${option.code || ''} ${option.code ? '- ' : ''}${option.name || ''}`.trim());
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
            <div className="px-3 py-2 text-sm text-slate-500">No se encontraron proveedores</div>
          ) : (
            filtered.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(option);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-slate-50 last:border-0 ${index === selectedIndex ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'} ${value === option.id ? 'bg-blue-100 font-semibold' : ''}`}
              >
                <div className="text-[10px] font-mono text-slate-400 mb-0.5 uppercase tracking-tighter">{option.code || 'SIN-COD'}</div>
                <div className="font-medium truncate">{option.name || 'Proveedor sin nombre'}</div>
                {option.nit && <div className="text-[11px] text-slate-500">NIT: {option.nit}</div>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
