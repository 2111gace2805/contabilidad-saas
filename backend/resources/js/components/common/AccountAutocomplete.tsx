import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { accounts } from '../../lib/api';

interface Account {
  id: string;
  code: string;
  name: string;
}

interface AccountAutocompleteProps {
  value: string;
  onChange: (accountCode: string) => void;
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

  useEffect(() => {
    if (selectedCompany) {
      loadAccounts();
    }
  }, [selectedCompany]);

  const loadAccounts = async () => {
    if (!selectedCompany) return;

    try {
      const data = await accounts.getAll();
      // API client sets company via ApiClient.setCompanyId in CompanyContext
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    }
  };

  const selectedAccount = accounts.find(acc => acc.code === value);

  const filteredAccounts = accounts.filter(acc => {
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
    setSearchTerm('');
  };

  const handleSelectAccount = (account: Account) => {
    onChange(account.code);
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
        setSelectedIndex(prev => (prev < filteredAccounts.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
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
                onClick={() => handleSelectAccount(account)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  index === selectedIndex ? 'bg-slate-100' : ''
                } ${value === account.code ? 'bg-blue-50 text-blue-700' : 'text-slate-800'}`}
              >
                <div className="font-mono text-xs text-slate-600">{account.code}</div>
                <div className="font-medium">{account.name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
