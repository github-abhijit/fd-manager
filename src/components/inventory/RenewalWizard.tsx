import React, { useState } from 'react';
import type { FixedDeposit } from '../../hooks/useFirestore';
import { useFirestoreMutations } from '../../hooks/useFirestore';
import { addYears } from 'date-fns';

interface RenewalWizardProps {
  fd: FixedDeposit;
  onSuccess: () => void;
}

const RenewalWizard: React.FC<RenewalWizardProps> = ({ fd, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    maturityDate: addYears(new Date(), 1).toISOString().split('T')[0],
    interestRate: fd.interestRate,
  });

  const { addFD, updateFD } = useFirestoreMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Mark old FD as MATURED/CLOSED
      await updateFD.mutateAsync({ id: fd.id, status: 'MATURED' });
      
      // 2. Spawn new FD with same principal
      await addFD.mutateAsync({
        bankId: fd.bankId,
        holderName: fd.holderName,
        accountNumber: fd.accountNumber,
        principalAmount: fd.principalAmount, // Principal-only rollover
        interestRate: formData.interestRate,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate,
        status: 'ACTIVE',
      });
      
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Rollover Principle</p>
        <p className="text-2xl font-bold">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fd.principalAmount)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Interest from the previous term is assumed to be withdrawn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">New Interest Rate (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">New Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">New Maturity Date</label>
            <input
              type="date"
              value={formData.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={addFD.isPending || updateFD.isPending}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 interactive-scale disabled:opacity-50"
      >
        {addFD.isPending || updateFD.isPending ? 'Processing Renewal...' : 'Confirm Renewal'}
      </button>
    </form>
  );
};

export default RenewalWizard;
