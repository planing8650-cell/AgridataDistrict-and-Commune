import React, { createContext, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Commune, Village, PlantingData, HarvestData } from '../types';

// Interface for the unified state, combining all data into a single object.
interface AppData {
    communes: Commune[];
    villages: Village[];
    plantingData: PlantingData[];
    harvestData: HarvestData[];
}

// The context type definition remains the same to ensure the public API is not changed.
interface DataContextType {
    communes: Commune[];
    setCommunes: React.Dispatch<React.SetStateAction<Commune[]>>;
    villages: Village[];
    setVillages: React.Dispatch<React.SetStateAction<Village[]>>;
    plantingData: PlantingData[];
    setPlantingData: React.Dispatch<React.SetStateAction<PlantingData[]>>;
    harvestData: HarvestData[];
    setHarvestData: React.Dispatch<React.SetStateAction<HarvestData[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial empty state for the unified data structure.
const initialAppData: AppData = {
    communes: [],
    villages: [],
    plantingData: [],
    harvestData: [],
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    // A single state object for all application data, persisted to localStorage under one key for atomicity.
    const [appData, setAppData] = useLocalStorage<AppData>('appData', initialAppData);

    // One-time effect to migrate data from old localStorage keys to the new unified 'appData' key.
    // This ensures that users with existing data do not lose it after the update.
    useEffect(() => {
        const isNewDataEmpty = !appData || (appData.communes.length === 0 && appData.villages.length === 0 && appData.plantingData.length === 0 && appData.harvestData.length === 0);
        // Check for an old key to see if migration is needed.
        const oldCommunesRaw = localStorage.getItem('communes');

        if (isNewDataEmpty && oldCommunesRaw) {
            console.log("Attempting to migrate data from old storage keys...");
            try {
                const communes = JSON.parse(oldCommunesRaw || '[]');
                const villages = JSON.parse(localStorage.getItem('villages') || '[]');
                const plantingData = JSON.parse(localStorage.getItem('plantingData') || '[]');
                const harvestData = JSON.parse(localStorage.getItem('harvestData') || '[]');
                
                const migratedData: AppData = { communes, villages, plantingData, harvestData };

                if (migratedData.communes.length > 0 || migratedData.villages.length > 0 || migratedData.plantingData.length > 0 || migratedData.harvestData.length > 0) {
                    setAppData(migratedData);
                    
                    // Clean up old keys after successful migration.
                    localStorage.removeItem('communes');
                    localStorage.removeItem('villages');
                    localStorage.removeItem('plantingData');
                    localStorage.removeItem('harvestData');
                    console.log("Data migration successful.");
                }
            } catch (e) {
                console.error("Failed to migrate old data:", e);
            }
        }
    }, []); // Empty dependency array ensures this runs only once on mount.

    // Wrapped setters are created with useCallback for performance, ensuring they are stable.
    const setCommunes = useCallback((updater: React.SetStateAction<Commune[]>) => {
        setAppData(prev => ({
            ...prev,
            communes: typeof updater === 'function' ? (updater as (prevState: Commune[]) => Commune[])(prev.communes) : updater,
        }));
    }, [setAppData]);

    const setVillages = useCallback((updater: React.SetStateAction<Village[]>) => {
        setAppData(prev => ({
            ...prev,
            villages: typeof updater === 'function' ? (updater as (prevState: Village[]) => Village[])(prev.villages) : updater,
        }));
    }, [setAppData]);

    const setPlantingData = useCallback((updater: React.SetStateAction<PlantingData[]>) => {
        setAppData(prev => ({
            ...prev,
            plantingData: typeof updater === 'function' ? (updater as (prevState: PlantingData[]) => PlantingData[])(prev.plantingData) : updater,
        }));
    }, [setAppData]);

    const setHarvestData = useCallback((updater: React.SetStateAction<HarvestData[]>) => {
        setAppData(prev => ({
            ...prev,
            harvestData: typeof updater === 'function' ? (updater as (prevState: HarvestData[]) => HarvestData[])(prev.harvestData) : updater,
        }));
    }, [setAppData]);

    // The context value is memoized to prevent unnecessary re-renders of consumers.
    const contextValue = useMemo(() => ({
        communes: appData.communes,
        villages: appData.villages,
        plantingData: appData.plantingData,
        harvestData: appData.harvestData,
        setCommunes,
        setVillages,
        setPlantingData,
        setHarvestData,
    }), [appData, setCommunes, setVillages, setPlantingData, setHarvestData]);
    
    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
