import React from 'react';
import { useBanks, useFixedDeposits, useFirestoreMutations } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Wallet,
  Landmark,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, isAfter } from 'date-fns';

const Dashboard: React.FC = () => {
  const { data: banks } = useBanks();
  const { data: fds, isLoading } = useFixedDeposits();
  const { user } = useAuth();
  const { addBank, addFD } = useFirestoreMutations();

  const totalPrincipal = fds?.reduce((acc, curr) => acc + curr.principalAmount, 0) || 0;
  const avgInterest = fds?.length 
    ? (fds.reduce((acc, curr) => acc + curr.interestRate, 0) / fds.length).toFixed(2)
    : 0;
  
  const pendingFDs = fds?.filter(fd => {
    return fd.status === 'ACTIVE' || isAfter(parseISO(fd.maturityDate), new Date());
  }).sort((a, b) => parseISO(a.maturityDate).getTime() - parseISO(b.maturityDate).getTime()) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) return;

      const splitCSV = (row: string) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headers = splitCSV(lines[0]);
      const dataLines = lines.slice(1);
      let successCount = 0;
      const localBankCache: Record<string, string> = {};

      for (const line of dataLines) {
        const values = splitCSV(line);
        const row: any = {};
        headers.forEach((h, i) => {
          if (values[i] !== undefined) row[h.trim()] = values[i];
        });

        const bankName = row['Bank'] || row['Name'] || row['bank'];
        const principal = row['Principal'] || row['AMT'] || row['principal'];
        
        if (!bankName || !principal) continue;

        try {
          // Find or create bank with local cache to prevent race condition
          let bankId = '';
          const normalizedBankName = bankName.toLowerCase();
          
          // Check existing banks from Firestore
          const existingBank = banks?.find(b => b.name.toLowerCase() === normalizedBankName);
          
          if (existingBank) {
            bankId = existingBank.id;
          } else if (localBankCache[normalizedBankName]) {
            bankId = localBankCache[normalizedBankName];
          } else {
            // Create new bank and cache it immediately
            const newBank = await addBank.mutateAsync(bankName);
            bankId = newBank.id;
            localBankCache[normalizedBankName] = bankId;
          }

          const parseDate = (d: string) => {
            if (!d) return format(new Date(), 'yyyy-MM-dd');
            const cleaned = d.replace(',', '.');
            const parts = cleaned.split(/[.-/]/);
            if (parts.length === 3) {
              const day = parts[0].padStart(2, '0');
              const month = parts[1].padStart(2, '0');
              const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
              return `${year}-${month}-${day}`;
            }
            return d;
          };

          await addFD.mutateAsync({
            bankId,
            holderName: row['Remarks'] || row['Holder'] || row['remarks'] || user.displayName || 'Unknown',
            accountNumber: row['Sr no'] || row['Account'] || '',
            principalAmount: Number(principal.replace(/[^0-9.]/g, '')) || 0,
            interestRate: Number((row['Int Rate'] || '0').replace(/[^0-9.]/g, '')) || 0,
            startDate: parseDate(row['Open Date'] || row['Start'] || row['date']),
            maturityDate: parseDate(row['Close Date'] || row['Maturity'] || row['due']),
            status: 'ACTIVE'
          });
          successCount++;
        } catch (err) {
          console.error("Error importing row:", line, err);
        }
      }
      alert(`Import complete! Added ${successCount} records.`);
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.displayName || 'Abhijit'}!</p>
        </motion.div>

        {(user?.email === 'abhijit.harry@gmail.com' || user?.email === 'testuser@arc.com' || user?.email === 'raosaheb.c4@gmail.com') && (
          <label className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer interactive-scale">
            <Plus className="w-5 h-5" />
            Bulk Import CSV
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => handleCSVImport(e)}
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Principal" 
          value={formatCurrency(totalPrincipal)} 
          icon={<Wallet className="w-6 h-6" />}
          color="primary"
        />
        <StatCard 
          title="Avg. Interest Rate" 
          value={`${avgInterest}%`} 
          icon={<TrendingUp className="w-6 h-6" />}
          color="secondary"
        />
        <StatCard 
          title="Total Banks" 
          value={banks?.length || 0} 
          icon={<Landmark className="w-6 h-6" />}
          color="accent"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-primary" />
            Upcoming Bank Visits
          </h2>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            {pendingFDs.length} Active Records
          </span>
        </div>

        {pendingFDs.length > 0 ? (
          <div className="space-y-8">
            {(() => {
              const groupedFDs = pendingFDs.reduce((groups: any, fd) => {
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
                    {groupedFDs[monthYear].map((fd: any) => (
                      <motion.div 
                        key={fd.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card flex flex-col md:flex-row md:items-center justify-between p-5 hover:shadow-lg transition-all border-l-4 border-l-primary"
                      >
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Bank</p>
                            <p className="font-bold text-lg truncate leading-tight">{banks?.find(b => b.id === fd.bankId)?.name}</p>
                            <p className="text-[10px] text-muted-foreground">Holder: {fd.holderName}</p>
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
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-lg">
                              {format(parseISO(fd.startDate), 'dd MMM yyyy')}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Maturity</p>
                            <div className="flex items-center gap-1.5 font-black text-foreground text-lg">
                              <Calendar className="w-4 h-4 text-primary" />
                              {format(parseISO(fd.maturityDate), 'dd MMM yyyy')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold">You're all set!</h3>
            <p className="text-muted-foreground text-lg">No upcoming records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const StatCard = ({ title, value, icon, color }: any) => {
  const colorMap: any = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-8 space-y-4"
    >
      <div className={`p-4 rounded-2xl w-fit ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <p className="text-4xl font-black mt-2 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
};

export default Dashboard;
