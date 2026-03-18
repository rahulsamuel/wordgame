'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, orderBy, type Query } from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useCollection<T>(path: string, order?: string) {
    const db = useFirestore();
    const [data, setData] = useState<T[]>();

    const collectionQuery = useMemo(() => {
        if (!path) return null;
        let q: Query = collection(db, path);
        if (order) {
            q = query(q, orderBy(order, 'desc'));
        }
        return q;
    }, [db, path, order]);

    useEffect(() => {
        if (!collectionQuery) return;
        const unsubscribe = onSnapshot(collectionQuery, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
            setData(docs);
        });
        return unsubscribe;
    }, [collectionQuery]);
    return data;
}
