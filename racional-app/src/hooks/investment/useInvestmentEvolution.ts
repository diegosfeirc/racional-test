import { useState, useEffect } from 'react';
import { doc, onSnapshot, type Unsubscribe, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import type { InvestmentEvolution } from '../../types/investment.types';
import type { UseInvestmentEvolutionReturn } from '../interfaces';

export const useInvestmentEvolution = (
  userId: string = 'user1'
): UseInvestmentEvolutionReturn => {
  const [data, setData] = useState<InvestmentEvolution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'investmentEvolutions', userId);
    
    const handleSnapshot = (snapshot: DocumentSnapshot): void => {
      if (snapshot.exists()) {
        const docData = snapshot.data();
        
        const investmentData: InvestmentEvolution = {
          userId,
          array: Array.isArray(docData.array) ? docData.array : [],
        };
        
        setData(investmentData);
        setLoading(false);
        setError(null);
      } else {
        setError(new Error(`Document does not exist: investmentEvolutions/${userId}`));
        setLoading(false);
      }
    };

    const handleError = (err: unknown): void => {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setLoading(false);
    };

    const unsubscribe: Unsubscribe = onSnapshot(
      docRef,
      handleSnapshot,
      handleError
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { data, loading, error };
};

