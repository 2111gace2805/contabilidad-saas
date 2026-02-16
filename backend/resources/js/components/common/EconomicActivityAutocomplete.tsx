import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { catalogs } from '../../lib/api';

interface EconomicActivity {
  id: string;
  name: string;
}

interface EconomicActivityAutocompleteProps {
  value: string;
  onChange: (activityId: string) => void;
  className?: string;
  placeholder?: string;
}

// Autocomplete input for economic activities, matching the UX of account search in journal entries.
export function EconomicActivityAutocomplete({
  value,
  onChange,
  className = '',
  placeholder = 'Buscar actividad...'
}: EconomicActivityAutocompleteProps) {
  const [activities, setActivities] = useState<EconomicActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedActivity = activities.find((a) => String(a.id) === String(value));

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await catalogs.getEconomicActivities();
        const list = Array.isArray(data) ? data : ((data as any)?.data || []);
        // Normalize keys that could come from SQL imports
        const normalized = list.map((a: any) => ({ id: a.id || a.actie_id, name: a.name || a.actie_nombre }));
        setActivities(normalized.filter((a: EconomicActivity) => a.id && a.name));
      } catch (err) {
        console.error('Error loading economic activities:', err);
        setActivities([]);
      }
    };

    loadActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return activities.slice(0, 50);
    return activities.filter((a) =>
      a.id.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [activities, searchTerm]);

  useEffect(() => {
    if (selectedActivity && !showDropdown) {
      setSearchTerm(`${selectedActivity.id} - ${selectedActivity.name}`);
    }
  }, [selectedActivity, showDropdown]);

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
        if (selectedActivity) {
          setSearchTerm(`${selectedActivity.id} - ${selectedActivity.name}`);
        } else {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedActivity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (selectedActivity && searchTerm === '') {
      setSearchTerm(`${selectedActivity.id} - ${selectedActivity.name}`);
    }
  };

  const handleSelect = (activity: EconomicActivity) => {
    onChange(activity.id);
    setSearchTerm(`${activity.id} - ${activity.name}`);
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
        setSelectedIndex((prev) => (prev < filteredActivities.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredActivities[selectedIndex]) {
          handleSelect(filteredActivities[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        if (selectedActivity) {
          setSearchTerm(`${selectedActivity.id} - ${selectedActivity.name}`);
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
          {filteredActivities.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No se encontraron actividades</div>
          ) : (
            filteredActivities.map((activity, index) => (
              <button
                key={activity.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(activity);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors border-b border-slate-50 last:border-0 ${index === selectedIndex ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'} ${value === activity.id ? 'bg-blue-100 font-semibold' : ''}`}
              >
                <div className="text-[10px] font-mono text-slate-400 mb-0.5 uppercase tracking-tighter">{activity.id}</div>
                <div className="font-medium truncate">{activity.name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}