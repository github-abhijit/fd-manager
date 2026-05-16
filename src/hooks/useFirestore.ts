import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Bank {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface FixedDeposit {
  id: string;
  userId: string;
  bankId: string;
  accountNumber: string;
  holderName: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
  notes?: string;
  updatedAt: string;
}

export const useBanks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['banks', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, 'banks'), 
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bank[];
    },
    enabled: !!user,
  });
};

export const useFixedDeposits = (bankId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['fixedDeposits', user?.uid, bankId],
    queryFn: async () => {
      if (!user) return [];
      let q = query(
        collection(db, 'fixedDeposits'), 
        where('userId', '==', user.uid)
      );
      
      if (bankId && bankId !== 'all') {
        q = query(q, where('bankId', '==', bankId));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FixedDeposit[];
    },
    enabled: !!user,
  });
};

export const useFirestoreMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addBank = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      return addDoc(collection(db, 'banks'), {
        name,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banks'] }),
  });

  const addFD = useMutation({
    mutationFn: async (fd: Omit<FixedDeposit, 'id' | 'userId' | 'updatedAt'>) => {
      if (!user) throw new Error('Not authenticated');
      return addDoc(collection(db, 'fixedDeposits'), {
        ...fd,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedDeposits'] }),
  });

  const updateFD = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FixedDeposit> & { id: string }) => {
      const fdRef = doc(db, 'fixedDeposits', id);
      return updateDoc(fdRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedDeposits'] }),
  });

  const deleteBank = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      return deleteDoc(doc(db, 'banks', id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banks'] }),
  });

  const deleteFD = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      return deleteDoc(doc(db, 'fixedDeposits', id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fixedDeposits'] }),
  });

  return { addBank, addFD, updateFD, deleteBank, deleteFD };
};
