import React, { useState } from 'react';
import type { Bank } from '../../hooks/useFirestore';
import { useFirestoreMutations } from '../../hooks/useFirestore';

interface FDFormProps {
  banks: Bank[];
  onSuccess: () => void;
  initialData?: any;
}

const FDForm: React.FC<FDFormProps> = ({ banks, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    bankId: initialData?.bankId || banks[0]?.id || '',
    accountNumber: initialData?.accountNumber || '',
    holderName: initialData?.holderName || '',
    principalAmount: initialData?.principalAmount || 0,
    interestRate: initialData?.interestRate || 0,
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    maturityDate: initialData?.maturityDate || '',
    status: initialData?.status || 'ACTIVE',
  });

  const { addFD, updateFD } = useFirestoreMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await updateFD.mutateAsync({ id: initialData.id, ...formData });
      } else {
        await addFD.mutateAsync(formData);
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert("Error: " + (error.message || "Failed to save FD record. Check your Firestore rules."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Bank</label>
          <select
            value={formData.bankId}
            onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          >
            <option value="" disabled>Select Bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>{bank.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Holder Name</label>
          <input
            type="text"
            value={formData.holderName}
            onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
            placeholder="Name on FD"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Account Number (Optional)</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="Last 4 digits"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Principal Amount</label>
          <input
            type="number"
            value={formData.principalAmount}
            onChange={(e) => setFormData({ ...formData, principalAmount: Number(e.target.value) })}
            placeholder="₹ Amount"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Interest Rate (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
            placeholder="e.g. 7.1"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Maturity Date</label>
          <input
            type="date"
            value={formData.maturityDate}
            onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={addFD.isPending || updateFD.isPending}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 interactive-scale disabled:opacity-50 mt-4"
      >
        {addFD.isPending || updateFD.isPending ? 'Saving...' : 'Save FD Record'}
      </button>
    </form>
  );
};

export default FDForm;
