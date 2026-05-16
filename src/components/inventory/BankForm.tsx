import React, { useState } from 'react';
import { useFirestoreMutations } from '../../hooks/useFirestore';

interface BankFormProps {
  onSuccess: () => void;
}

const BankForm: React.FC<BankFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const { addBank } = useFirestoreMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addBank.mutateAsync(name);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert("Error: " + (error.message || "Failed to save bank. Check your Firestore rules."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. HDFC Bank"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={addBank.isPending}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 interactive-scale disabled:opacity-50"
      >
        {addBank.isPending ? 'Adding...' : 'Save Bank'}
      </button>
    </form>
  );
};

export default BankForm;
