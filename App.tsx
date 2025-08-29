
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import ManageLocations from './pages/ManageLocations';
import PlantingData from './pages/PlantingData';
import AnnualPlantingReport from './pages/AnnualPlantingReport';
import FiveYearPlantingReport from './pages/FiveYearPlantingReport';
import HarvestData from './pages/HarvestData';
import AnnualHarvestReport from './pages/AnnualHarvestReport';
import FiveYearHarvestReport from './pages/FiveYearHarvestReport';
import FiveYearCombinedReport from './pages/FiveYearCombinedReport';


const App = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ManageLocations />} />
            <Route path="/planting-entry" element={<PlantingData />} />
            <Route path="/planting-annual-report" element={<AnnualPlantingReport />} />
            <Route path="/planting-5year-report" element={<FiveYearPlantingReport />} />
            <Route path="/harvest-entry" element={<HarvestData />} />
            <Route path="/harvest-annual-report" element={<AnnualHarvestReport />} />
            <Route path="/harvest-5year-report" element={<FiveYearHarvestReport />} />
            <Route path="/combined-5year-report" element={<FiveYearCombinedReport />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
