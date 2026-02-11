import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { accounts as accountsApi } from '../../lib/api';

interface Account {
  id: number;
  code: string;
  name: string;
  allows_transactions: boolean;
}

interface AccountAutocompleteProps {
  value: number | '';
  onChange: (accountId: number | '') => void;
  className?: string;
  placeholder?: string;
}

export function AccountAutocomplete({ value, onChange, className = '', placeholder = 'Buscar cuenta...' }: AccountAutocompleteProps) {
  const { selectedCompany } = useCompany();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAccount = accounts.find((acc: Account) => String(acc.id) === String(value));

  useEffect(() => {
    if (selectedCompany) {
      loadAccounts();
    }
  }, [selectedCompany]);

  const loadAccounts = async () => {
    if (!selectedCompany) return;

    try {
      const data = await accountsApi.getAll();
      const list = Array.isArray(data) ? data : ((data as any)?.data || []);
      // Filter postable/detail accounts. Support different naming conventions.
      const filteredList = list.filter((acc: any) =>
        acc.allows_transactions === true ||
        acc.is_detail === true ||
        acc.is_detail === 1 ||
        acc.is_postable === true ||
        acc.is_postable === 1
      );
      setAccounts(filteredList);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    }
  };


  const filteredAccounts = accounts.filter((acc: Account) => {
    const term = searchTerm.toLowerCase();
    return (
      acc.code.toLowerCase().includes(term) ||
      acc.name.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    if (selectedAccount && !showDropdown) {
      setSearchTerm(`${selectedAccount.code} - ${selectedAccount.name}`);
    }
  }, [selectedAccount, showDropdown]);

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
        if (selectedAccount) {
          setSearchTerm(`${selectedAccount.code} - ${selectedAccount.name}`);
        } else {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedAccount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    // If we have an account selected, show its text so the user knows what's there
    // but allow them to clear it to search.
    if (selectedAccount && searchTerm === '') {
      setSearchTerm(`${selectedAccount.code} - ${selectedAccount.name}`);
    }
  };

  const handleSelectAccount = (account: Account) => {
    onChange(account.id);
    setSearchTerm(`${account.code} - ${account.name}`);
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
        setSelectedIndex((prev: number) => (prev < filteredAccounts.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev: number) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredAccounts[selectedIndex]) {
          handleSelectAccount(filteredAccounts[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        if (selectedAccount) {
          setSearchTerm(`${selectedAccount.code} - ${selectedAccount.name}`);
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
          className="w-full px-2 py-1 pr-8 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          placeholder={placeholder}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredAccounts.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">
              No se encontraron cuentas
            </div>
          ) : (
            filteredAccounts.map((account, index) => (
              <button
                key={account.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur before click
                  handleSelectAccount(account);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors border-b border-slate-50 last:border-0 ${index === selectedIndex ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'
                  } ${value === account.id ? 'bg-blue-100 font-semibold' : ''}`}
              >
                <div className="text-[10px] font-mono text-slate-400 mb-0.5 uppercase tracking-tighter">
                  {account.code}
                </div>
                <div className="font-medium truncate">{account.name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
