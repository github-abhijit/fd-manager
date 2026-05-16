import React, { useState } from 'react';
import { useBanks, useFixedDeposits } from '../hooks/useFirestore';
import { Plus, Building2, Search, Edit2, RefreshCw, Calendar, ArrowLeft, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import Modal from '../components/ui/Modal';
import BankForm from '../components/inventory/BankForm';
import FDForm from '../components/inventory/FDForm';
import RenewalWizard from '../components/inventory/RenewalWizard';

const Inventory: React.FC = () => {
  const { data: banks, isLoading: banksLoading } = useBanks();
  const { data: fds } = useFixedDeposits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  
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

  const filteredBanks = banks?.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bankFDs = fds?.filter(fd => fd.bankId === selectedBankId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-1">
            <Landmark className="w-5 h-5" />
            Portfolio
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-lg">Manage your banks and deposit records.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsBankModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-2xl font-bold interactive-scale shadow-lg"
          >
            <Building2 className="w-5 h-5" />
            Add Bank
          </button>
          <button 
            onClick={() => setIsFDModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 interactive-scale"
          >
            <Plus className="w-5 h-5" />
            New FD
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedBankId ? (
          <motion.div 
            key="banks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search your banks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none glass-card focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg shadow-inner"
              />
            </div>

            {banksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="glass-card h-40 animate-pulse" />)}
              </div>
            ) : filteredBanks?.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold">No banks found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2 mb-6">Add your first bank to start tracking your deposits.</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setIsBankModalOpen(true)}
                    className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-2xl font-bold interactive-scale"
                  >
                    <Building2 className="w-5 h-5" />
                    Add Bank
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBanks?.map(bank => {
                  const count = fds?.filter(fd => fd.bankId === bank.id).length || 0;
                  const total = fds?.filter(fd => fd.bankId === bank.id).reduce((acc, curr) => acc + curr.principalAmount, 0) || 0;
                  
                  return (
                    <motion.button
                      key={bank.id}
                      layoutId={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className="glass-card p-6 text-left hover:shadow-2xl transition-all group relative overflow-hidden interactive-scale"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Building2 className="w-24 h-24 text-primary" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                          <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{bank.name}</h3>
                          <p className="text-muted-foreground font-medium">{count} Fixed Deposits</p>
                        </div>
                        <div className="pt-4 border-t border-primary/5 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Principal</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(total)}</p>
                          </div>
                          <div className="p-2 rounded-full bg-primary text-primary-foreground">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="fds"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedBankId(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Banks
            </button>

            <div className="glass-card p-6 border-l-4 border-l-primary flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold">{banks?.find(b => b.id === selectedBankId)?.name}</h2>
                <p className="text-muted-foreground">Managing {bankFDs?.length} records for this bank.</p>
              </div>
              <div className="flex gap-4">
                 <div className="px-6 py-3 rounded-2xl bg-primary/5 border border-primary/10">
                   <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Total</p>
                   <p className="text-2xl font-bold text-primary">
                     {formatCurrency(bankFDs?.reduce((acc, curr) => acc + curr.principalAmount, 0) || 0)}
                   </p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {bankFDs?.map((fd) => (
                  <FDCard 
                    key={fd.id} 
                    fd={fd} 
                    formatCurrency={formatCurrency}
                    onEdit={() => handleEditFD(fd)}
                    onRenew={() => handleRenewFD(fd)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

const FDCard = ({ fd, formatCurrency, onEdit, onRenew }: { fd: any, formatCurrency: any, onEdit: () => void, onRenew: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="glass-card overflow-hidden group hover:shadow-2xl transition-all"
  >
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-lg">
              {fd.status}
            </span>
          </div>
          <h3 className="font-bold text-xl">{fd.holderName}</h3>
          <p className="text-xs text-muted-foreground font-medium">A/C: {fd.accountNumber || '••••••••'}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
            <Edit2 className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 bg-primary/5 p-4 rounded-2xl border border-primary/10">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Principal</p>
          <p className="font-black text-lg">{formatCurrency(fd.principalAmount)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Interest</p>
          <p className="font-black text-lg text-primary">{fd.interestRate}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-muted-foreground bg-secondary/10 px-3 py-1.5 rounded-xl border border-secondary/10">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">
            {format(parseISO(fd.maturityDate), 'dd MMM yyyy')}
          </span>
        </div>
        <button 
          onClick={onRenew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold interactive-scale shadow-lg shadow-primary/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Renew
        </button>
      </div>
    </div>
    
    <div className={`h-2 w-full ${
      fd.status === 'ACTIVE' ? 'bg-primary' : fd.status === 'MATURED' ? 'bg-warning' : 'bg-muted'
    }`} />
  </motion.div>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
  </svg>
);

export default Inventory;
