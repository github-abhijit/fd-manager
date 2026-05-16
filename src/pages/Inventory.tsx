import React, { useState } from 'react';
import { useBanks, useFixedDeposits, useFirestoreMutations } from '../hooks/useFirestore';
import { Plus, Building2, Search, Edit2, RefreshCw, Calendar, ArrowLeft, Landmark, Info, Trash2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isAfter } from 'date-fns';
import Modal from '../components/ui/Modal';
import BankForm from '../components/inventory/BankForm';
import FDForm from '../components/inventory/FDForm';
import RenewalWizard from '../components/inventory/RenewalWizard';

const Inventory: React.FC = () => {
  const { data: banks, isLoading: banksLoading } = useBanks();
  const { data: fds } = useFixedDeposits();
  const { deleteBank, deleteFD } = useFirestoreMutations();
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

  const handleDeleteBank = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}? All associated FDs will also be hidden from this view.`)) {
      try {
        await deleteBank.mutateAsync(id);
      } catch (err) {
        alert("Failed to delete bank");
      }
    }
  };

  const handleDeleteFD = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this FD record?')) {
      try {
        await deleteFD.mutateAsync(id);
      } catch (err) {
        alert("Failed to delete record");
      }
    }
  };

  const filteredBanks = banks?.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bankFDs = fds?.filter(fd => fd.bankId === selectedBankId) || [];
  const selectedBank = banks?.find(b => b.id === selectedBankId);

  const totalBankPrincipal = bankFDs.reduce((acc, curr) => acc + curr.principalAmount, 0);
  const avgBankInterest = bankFDs.length 
    ? (bankFDs.reduce((acc, curr) => acc + curr.interestRate, 0) / bankFDs.length).toFixed(2)
    : 0;
  
  const nextMaturity = bankFDs
    .filter(fd => isAfter(parseISO(fd.maturityDate), new Date()))
    .sort((a, b) => parseISO(a.maturityDate).getTime() - parseISO(b.maturityDate).getTime())[0];

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
            Inventory Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Your Portfolio</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsBankModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary/10 text-secondary px-6 py-3 rounded-2xl font-bold interactive-scale border border-secondary/20 hover:bg-secondary/20 transition-all"
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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search your banks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none glass-card focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg"
              />
            </div>

            {banksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="glass-card h-48 animate-pulse" />)}
              </div>
            ) : filteredBanks?.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold">No Banks Found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2 mb-6">Start by adding a bank where you hold your deposits.</p>
                <button 
                  onClick={() => setIsBankModalOpen(true)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold interactive-scale"
                >
                  Add Your First Bank
                </button>
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
                      className="glass-card p-6 text-left hover:shadow-2xl transition-all group relative overflow-hidden interactive-scale border-l-4 border-l-primary"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Landmark className="w-24 h-24 text-primary" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                              {count} FDs
                            </span>
                            <button 
                              onClick={(e) => handleDeleteBank(e, bank.id, bank.name)}
                              className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{bank.name}</h3>
                        </div>
                        <div className="pt-4 border-t border-primary/5 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Portfolio</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(total)}</p>
                          </div>
                          <div className="p-2 rounded-full bg-primary text-primary-foreground group-hover:translate-x-1 transition-transform">
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
            key="bank-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedBankId(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold group mb-2"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Banks
            </button>

            <div className="glass-card overflow-hidden border-l-4 border-l-primary">
              <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-2">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold truncate">{selectedBank?.name}</h2>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" /> 
                    {bankFDs.length} Active Records
                  </p>
                </div>
                
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Principal</p>
                    <p className="text-2xl font-black text-primary">{formatCurrency(totalBankPrincipal)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Avg. Yield</p>
                    <p className="text-2xl font-black text-secondary">{avgBankInterest}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Next Maturity</p>
                    {nextMaturity ? (
                      <p className="text-xl font-black text-accent truncate">
                        {format(parseISO(nextMaturity.maturityDate), 'dd MMM yyyy')}
                      </p>
                    ) : (
                      <p className="text-xl font-black text-muted-foreground">No pending</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Deposit Records
              </h3>
            </div>

            {bankFDs.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-muted-foreground mb-4">No deposits recorded for this bank yet.</p>
                <button 
                  onClick={() => setIsFDModalOpen(true)}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold interactive-scale"
                >
                  Add Your First FD
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {(() => {
                  const sortedFDs = [...bankFDs].sort((a, b) => parseISO(a.maturityDate).getTime() - parseISO(b.maturityDate).getTime());
                  const groupedFDs = sortedFDs.reduce((groups: any, fd) => {
                    const monthYear = format(parseISO(fd.maturityDate), 'MMMM yyyy');
                    if (!groups[monthYear]) {
                      groups[monthYear] = [];
                    }
                    groups[monthYear].push(fd);
                    return groups;
                  }, {});

                  return Object.keys(groupedFDs).map(monthYear => (
                    <div key={monthYear} className="space-y-4">
                      <h4 className="text-lg font-bold text-muted-foreground flex items-center gap-2 border-b border-primary/10 pb-2">
                        <Calendar className="w-5 h-5" />
                        {monthYear}
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full ml-2">
                          {groupedFDs[monthYear].length}
                        </span>
                      </h4>
                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {groupedFDs[monthYear].map((fd: any) => (
                            <FDListItem 
                              key={fd.id} 
                              fd={fd} 
                              formatCurrency={formatCurrency}
                              onEdit={() => handleEditFD(fd)}
                              onRenew={() => handleRenewFD(fd)}
                              onDelete={() => handleDeleteFD(fd.id)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title="Add New Bank">
        <BankForm onSuccess={() => setIsBankModalOpen(false)} />
      </Modal>

      <Modal isOpen={isFDModalOpen} onClose={handleCloseFDModal} title={editingFD ? "Edit FD Record" : "Add New FD"}>
        <FDForm banks={banks || []} onSuccess={handleCloseFDModal} initialData={editingFD} />
      </Modal>

      <Modal isOpen={isRenewalModalOpen} onClose={handleCloseRenewalModal} title="Renew FD">
        {renewingFD && <RenewalWizard fd={renewingFD} onSuccess={handleCloseRenewalModal} />}
      </Modal>
    </div>
  );
};

const FDListItem = ({ fd, formatCurrency, onEdit, onRenew, onDelete }: { fd: any, formatCurrency: any, onEdit: () => void, onRenew: () => void, onDelete: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="glass-card flex flex-col md:flex-row md:items-center justify-between p-5 group hover:shadow-lg transition-all border-l-4 border-l-primary"
  >
    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Holder</p>
        <p className="font-bold text-lg truncate leading-tight">{fd.holderName}</p>
        <p className="text-[10px] text-muted-foreground">A/C: {fd.accountNumber || '••••••••'}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Amount</p>
        <p className="font-black text-primary text-lg leading-tight">{formatCurrency(fd.principalAmount)}</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Yield</p>
        <p className="font-bold text-lg leading-tight">{fd.interestRate}%</p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Start Date</p>
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          {format(parseISO(fd.startDate), 'dd MMM yyyy')}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Maturity</p>
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          {format(parseISO(fd.maturityDate), 'dd MMM yyyy')}
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-2 mt-4 md:mt-0 justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity border-t border-primary/10 md:border-t-0 pt-4 md:pt-0">
      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg mr-2 ${
        fd.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 
        fd.status === 'MATURED' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
      }`}>
        {fd.status}
      </span>
      <button onClick={onRenew} className="p-2 bg-success/10 hover:bg-success/20 text-success rounded-xl transition-colors tooltip" title="Renew">
        <RefreshCw className="w-4 h-4" />
      </button>
      <button onClick={onEdit} className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors tooltip" title="Edit">
        <Edit2 className="w-4 h-4" />
      </button>
      <button onClick={onDelete} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors tooltip" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
  </svg>
);

export default Inventory;
