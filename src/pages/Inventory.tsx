import React, { useState } from 'react';
import { useBanks, useFixedDeposits } from '../hooks/useFirestore';
import { Plus, Building2, Search, MoreVertical, Edit2, RefreshCw, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import Modal from '../components/ui/Modal';
import BankForm from '../components/inventory/BankForm';
import FDForm from '../components/inventory/FDForm';
import RenewalWizard from '../components/inventory/RenewalWizard';

const Inventory: React.FC = () => {
  const { data: banks } = useBanks();
  const { data: fds, isLoading: fdsLoading } = useFixedDeposits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string>('all');
  
  // Modal States
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isFDModalOpen, setIsFDModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [editingFD, setEditingFD] = useState<any>(null);
  const [renewingFD, setRenewingFD] = useState<any>(null);

  const handleEditFD = (fd: any) => {
    setEditingFD(fd);
    setIsFDModalOpen(true);
  };

  const handleRenewFD = (fd: any) => {
    setRenewingFD(fd);
    setIsRenewalModalOpen(true);
  };

  const handleCloseFDModal = () => {
    setIsFDModalOpen(false);
    setEditingFD(null);
  };

  const handleCloseRenewalModal = () => {
    setIsRenewalModalOpen(false);
    setRenewingFD(null);
  };

  const filteredFDs = fds?.filter(fd => {
    const matchesSearch = fd.holderName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         fd.accountNumber.includes(searchTerm);
    const matchesBank = selectedBankId === 'all' || fd.bankId === selectedBankId;
    return matchesSearch && matchesBank;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your banks and deposit records.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsBankModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-medium interactive-scale"
          >
            <Building2 className="w-4 h-4" />
            Add Bank
          </button>
          <button 
            onClick={() => setIsFDModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg shadow-primary/20 interactive-scale"
          >
            <Plus className="w-4 h-4" />
            Add FD
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search holder or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setSelectedBankId('all')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
              selectedBankId === 'all' ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
            }`}
          >
            All Banks
          </button>
          {banks?.map(bank => (
            <button 
              key={bank.id}
              onClick={() => setSelectedBankId(bank.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                selectedBankId === bank.id ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {bank.name}
            </button>
          ))}
        </div>
      </div>

      {/* FD Grid/Table */}
      {fdsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="glass-card h-48 animate-pulse bg-muted/50" />)}
        </div>
      ) : filteredFDs?.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No deposits found</h3>
          <p className="text-muted-foreground">Start by adding your first Fixed Deposit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredFDs?.map((fd) => (
              <FDCard 
                key={fd.id} 
                fd={fd} 
                bankName={banks?.find(b => b.id === fd.bankId)?.name || 'Unknown Bank'}
                formatCurrency={formatCurrency}
                onEdit={() => handleEditFD(fd)}
                onRenew={() => handleRenewFD(fd)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <Modal 
        isOpen={isBankModalOpen} 
        onClose={() => setIsBankModalOpen(false)} 
        title="Add New Bank"
      >
        <BankForm onSuccess={() => setIsBankModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isFDModalOpen} 
        onClose={handleCloseFDModal} 
        title={editingFD ? "Edit FD Record" : "Add New FD"}
      >
        <FDForm 
          banks={banks || []} 
          onSuccess={handleCloseFDModal} 
          initialData={editingFD}
        />
      </Modal>

      <Modal 
        isOpen={isRenewalModalOpen} 
        onClose={handleCloseRenewalModal} 
        title="Renew FD"
      >
        {renewingFD && (
          <RenewalWizard 
            fd={renewingFD} 
            onSuccess={handleCloseRenewalModal} 
          />
        )}
      </Modal>
    </div>
  );
};

const FDCard = ({ fd, bankName, formatCurrency, onEdit, onRenew }: { fd: any, bankName: string, formatCurrency: any, onEdit: () => void, onRenew: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="glass-card overflow-hidden group"
  >
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            {bankName}
          </span>
          <h3 className="font-bold text-lg mt-1">{fd.holderName}</h3>
          <p className="text-xs text-muted-foreground">A/C: {fd.accountNumber || '••••••••'}</p>
        </div>
        <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 py-2">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Principal</p>
          <p className="font-bold">{formatCurrency(fd.principalAmount)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Interest Rate</p>
          <p className="font-bold text-success">{fd.interestRate}%</p>
        </div>
      </div>

      <div className="pt-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium">
            {format(parseISO(fd.maturityDate), 'dd MMM yyyy')}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRenew}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all" 
            title="Renew"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={onEdit}
            className="p-2 hover:bg-secondary rounded-xl transition-all" 
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    {/* Status Bar */}
    <div className={`h-1.5 w-full ${
      fd.status === 'ACTIVE' ? 'bg-success' : fd.status === 'MATURED' ? 'bg-warning' : 'bg-muted'
    }`} />
  </motion.div>
);

export default Inventory;
