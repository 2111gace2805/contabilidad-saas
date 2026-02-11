import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, User } from 'lucide-react';
import { ApiClient } from '../../lib/api';

interface UserData {
    id: number;
    name: string;
    email: string;
}

interface UserAutocompleteProps {
    value: number | string | null;
    onChange: (value: number | string | null) => void;
    error?: string;
    placeholder?: string;
    excludeIds?: number[];
    label?: string;
}

export default function UserAutocomplete({
    value,
    onChange,
    error,
    placeholder = "Buscar usuario...",
    excludeIds = [],
    label
}: UserAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch users with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Initial fetch for selected value
    useEffect(() => {
        if (value && !selectedUser) {
            // If we have an ID but no user object, we might need to fetch it specifically or rely on the list
            // For simplicity in this context, we'll try to find it in the current list or trigger a fetch
            fetchUsers();
        } else if (!value) {
            setSelectedUser(null);
            setSearchTerm('');
        }
    }, [value]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Using the super-admin endpoint which returns all users
            const endpoint = searchTerm
                ? `/super-admin/users?search=${encodeURIComponent(searchTerm)}`
                : '/super-admin/users';

            const allUsers = await ApiClient.get<UserData[]>(endpoint);

            // Filter out excluded IDs
            const filteredUsers = allUsers.filter((u: UserData) => !excludeIds.includes(u.id));
            setUsers(filteredUsers);

            // If we have a value, try to find the user in the response to set the label
            if (value) {
                const found = allUsers.find((u: UserData) => u.id == value);
                if (found) setSelectedUser(found);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (user: UserData) => {
        setSelectedUser(user);
        onChange(user.id);
        setIsOpen(false);
        setSearchTerm(''); // Optional: clear search after selection? Or keep it?
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedUser(null);
        onChange(null);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
            <div
                className={`
          relative w-full border rounded-lg cursor-pointer bg-white
          ${error ? 'border-red-300 focus-within:ring-red-200' : 'border-slate-300 focus-within:ring-blue-100 focus-within:border-blue-400'}
          transition-all duration-200
        `}
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 100);
                }}
            >
                <div className="flex items-center min-h-[42px] px-3 py-1">
                    <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />

                    <div className="flex-1 overflow-hidden">
                        {selectedUser && !isOpen ? (
                            <div className="text-sm text-slate-700 font-medium truncate flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                                    {selectedUser.name.charAt(0)}
                                </span>
                                {selectedUser.name} <span className="text-slate-400 font-normal text-xs">({selectedUser.email})</span>
                            </div>
                        ) : (
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full border-none p-0 focus:ring-0 text-sm placeholder:text-slate-400"
                                placeholder={selectedUser ? "Cambiar usuario..." : placeholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsOpen(true)}
                            />
                        )}
                    </div>

                    {(selectedUser || searchTerm) && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {loading && users.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">Cargando usuarios...</div>
                    ) : users.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">No se encontraron usuarios</div>
                    ) : (
                        <ul className="py-1">
                            {users.map((user) => (
                                <li
                                    key={user.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(user);
                                    }}
                                    className={`
                    px-3 py-2 text-sm cursor-pointer flex items-center justify-between group
                    ${selectedUser?.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${selectedUser?.id === user.id ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}
                    `}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>

                                    {selectedUser?.id === user.id && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
