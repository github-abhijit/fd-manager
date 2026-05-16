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
import { format, parseISO, addMonths, isAfter, isBefore } from 'date-fns';

const Dashboard: React.FC = () => {
  const { data: banks } = useBanks();
  const { data: fds, isLoading } = useFixedDeposits();
  const { user } = useAuth();
  const { addBank, addFD } = useFirestoreMutations();

  const totalPrincipal = fds?.reduce((acc, curr) => acc + curr.principalAmount, 0) || 0;
  const avgInterest = fds?.length 
    ? (fds.reduce((acc, curr) => acc + curr.interestRate, 0) / fds.length).toFixed(2)
    : 0;
  
  const maturingSoon = fds?.filter(fd => {
    const maturityDate = parseISO(fd.maturityDate);
    const thirtyDaysFromNow = addMonths(new Date(), 1);
    return isBefore(maturityDate, thirtyDaysFromNow) && isAfter(maturityDate, new Date());
  }) || [];

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
        const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches) return row.split(',').map(v => v.trim());
        return matches.map(v => v.replace(/^"|"$/g, '').trim());
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
            Next Visit Alerts
          </h2>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            {maturingSoon.length} Records Maturing Soon
          </span>
        </div>

        {maturingSoon.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {maturingSoon.map(fd => (
              <motion.div 
                key={fd.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 border-l-4 border-l-primary flex flex-col justify-between gap-6"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Bank Visit Needed</p>
                    <p className="text-3xl font-black text-primary">
                      {format(parseISO(fd.maturityDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Calendar className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Bank</span>
                    <span className="font-bold">{banks?.find(b => b.id === fd.bankId)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Amount</span>
                    <span className="font-bold">{formatCurrency(fd.principalAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 border-primary/10">
                    <span className="text-muted-foreground font-medium">Holder</span>
                    <span className="font-bold text-primary">{fd.holderName}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold">You're all set!</h3>
            <p className="text-muted-foreground text-lg">No FDs are maturing in the next 30 days.</p>
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
