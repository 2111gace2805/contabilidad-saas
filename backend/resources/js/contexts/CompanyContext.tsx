import React, { createContext, useContext, useEffect, useState } from 'react';
import { companies, ApiClient } from '../lib/api';
import { useAuth } from './AuthContext';
import type { Company, CompanyUser } from '../types';

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  userRole: string | null;
  loading: boolean;
  selectCompany: (companyId: number) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    if (!user) {
      setCompanyList([]);
      setSelectedCompany(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    // Super admins don't have companies in the normal sense
    if (user.is_super_admin) {
      setCompanyList([]);
      setSelectedCompany(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
        const data = await companies.getAll();
        console.debug('companies.getAll response:', data);

        // Normalize response: support Array<CompanyUser>, Array<Company>, or { data: [...] }
        let arr: any[] = [];
        if (Array.isArray(data)) arr = data;
        else if (data && Array.isArray((data as any).data)) arr = (data as any).data;

        const userCompanies = arr
          .map((item: CompanyUser | null | undefined) => (item && (item as any).company ? (item as any).company : item))
          .filter(Boolean) as Company[];

        setCompanyList(userCompanies);

      if (userCompanies.length > 0 && !selectedCompany) {
        const firstCompany = userCompanies[0];
        setSelectedCompany(firstCompany);
        setUserRole(arr[0]?.role || null);
        // ApiClient expects a company id string or number; store as-is
        // @ts-ignore allow string ids
        ApiClient.setCompanyId((firstCompany as any).id);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [user]);

  const selectCompany = async (companyId: number | string) => {
    const company = companyList.find(c => String(c.id) === String(companyId));
    if (company) {
      try {
        await companies.select(companyId);
        setSelectedCompany(company);
        // @ts-ignore allow string ids
        ApiClient.setCompanyId((companyId as any));
        
        const data = await companies.getAll();
        const companyUser = (Array.isArray(data) ? data : []).find((cu: CompanyUser) => String((cu as any).company_id) === String(companyId));
        setUserRole(companyUser?.role || null);
      } catch (error) {
        console.error('Error selecting company:', error);
      }
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        companies: companyList,
        selectedCompany,
        userRole,
        loading,
        selectCompany,
        refreshCompanies: loadCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
}
