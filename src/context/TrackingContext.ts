import { createContext, useContext } from 'react';

import { TrackingData } from '@/types';

export type TrackingContextType = {
    trackingData: TrackingData;
    setTrackingData: (value: TrackingData | ((prev: TrackingData) => TrackingData)) => void;
};

export const TrackingContext = createContext<TrackingContextType | null>(null);

export const useTrackingContext = () => {
    const context = useContext(TrackingContext);
    if (!context) throw new Error('useTrackingContext must be used within TrackingProvider');

    return context;
};
