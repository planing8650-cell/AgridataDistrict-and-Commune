
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Card from '../components/common/Card';
import ChartContainer from '../components/common/ChartContainer';
import { Season, CropType } from '../types';
import { SEASONS, CROP_TYPES } from '../constants';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];
const MONTH_NAMES = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const QUARTER_NAMES = ["ត្រីមាស១", "ត្រីមាស២", "ត្រីមាស៣", "ត្រីមាស៤"];

const AnnualPlantingReport: React.FC = () => {
    const { communes, villages, plantingData } = useData();

    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        season: '',
        communeId: '',
        villageId: '',
        cropType: '',
        cropName: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, ...(name === 'communeId' && { villageId: '' }) }));
    };

    const uniqueYears = useMemo(() => [...new Set(plantingData.map(d => new Date(d.plantingDate).getFullYear()))].sort((a,b) => b-a), [plantingData]);
    const uniqueCropNames = useMemo(() => [...new Set(plantingData.map(d => d.cropName))], [plantingData]);
    const availableVillages = useMemo(() => filters.communeId ? villages.filter(v => v.communeId === filters.communeId) : [], [filters.communeId, villages]);

    const filteredData = useMemo(() => {
        return plantingData.filter(d => {
            const date = new Date(d.plantingDate);
            const yearMatch = filters.year ? date.getFullYear().toString() === filters.year : true;
            const seasonMatch = filters.season ? d.season === filters.season : true;
            const communeMatch = filters.communeId ? d.communeId === filters.communeId : true;
            const villageMatch = filters.villageId ? d.villageId === filters.villageId : true;
            const cropTypeMatch = filters.cropType ? d.cropType === filters.cropType : true;
            const cropNameMatch = filters.cropName ? d.cropName === filters.cropName : true;
            return yearMatch && seasonMatch && communeMatch && villageMatch && cropTypeMatch && cropNameMatch;
        });
    }, [filters, plantingData]);

    const totalCultivatedArea = useMemo(() => filteredData.reduce((sum, d) => sum + d.cultivatedArea, 0), [filteredData]);

    const areaByVillage = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredData.forEach(d => {
            const villageName = villages.find(v => v.id === d.villageId)?.name || 'មិនស្គាល់';
            dataMap.set(villageName, (dataMap.get(villageName) || 0) + d.cultivatedArea);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, value }));
    }, [filteredData, villages]);
    
    const areaByCommune = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredData.forEach(d => {
            const communeName = communes.find(c => c.id === d.communeId)?.name || 'មិនស្គាល់';
            dataMap.set(communeName, (dataMap.get(communeName) || 0) + d.cultivatedArea);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, value }));
    }, [filteredData, communes]);

    const areaByCropType = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredData.forEach(d => {
            dataMap.set(d.cropType, (dataMap.get(d.cropType) || 0) + d.cultivatedArea);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, value }));
    }, [filteredData]);

    const areaByMonth = useMemo(() => {
        const data = Array(12).fill(0);
        filteredData.forEach(d => {
            const month = new Date(d.plantingDate).getMonth();
            data[month] += d.cultivatedArea;
        });
        return data.map((value, index) => ({ name: MONTH_NAMES[index], "ផ្ទៃដី": value }));
    }, [filteredData]);

    const areaByQuarter = useMemo(() => {
        const data = Array(4).fill(0);
        filteredData.forEach(d => {
            const quarter = Math.floor(new Date(d.plantingDate).getMonth() / 3);
            data[quarter] += d.cultivatedArea;
        });
        return data.map((value, index) => ({ name: QUARTER_NAMES[index], "ផ្ទៃដី": value }));
    }, [filteredData]);

    return (
        <div>
            <h2 className="text-3xl font-heading text-gray-800 mb-6">របាយការណ៍ដាំដុះប្រចាំឆ្នាំ</h2>

            {/* Filters */}
            <div className="p-4 bg-white rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <select name="year" value={filters.year} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                        <option value="">គ្រប់ឆ្នាំ</option>
                        {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select name="season" value={filters.season} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                        <option value="">គ្រប់រដូវ</option>
                        {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="communeId" value={filters.communeId} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                        <option value="">គ្រប់ឃុំ</option>
                        {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="villageId" value={filters.villageId} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" disabled={!filters.communeId}>
                        <option value="">គ្រប់ភូមិ</option>
                        {availableVillages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <select name="cropType" value={filters.cropType} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                        <option value="">គ្រប់ប្រភេទដំណាំ</option>
                        {CROP_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                    </select>
                    <select name="cropName" value={filters.cropName} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                        <option value="">គ្រប់ដំណាំ</option>
                        {uniqueCropNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card title="ផ្ទៃដីដាំដុះសរុប (ហិចតា)" value={totalCultivatedArea.toLocaleString(undefined, {maximumFractionDigits: 2})} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v4m0 0h-4m4 0l-5-5"></path></svg>} />
               
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <ChartContainer title="ភាគរយផ្ទៃដីដាំដុះតាមភូមិ">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={areaByVillage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={true} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                                {areaByVillage.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="ភាគរយផ្ទៃដីដាំដុះតាមឃុំ">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={areaByCommune} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ffc658" labelLine={true} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                                {areaByCommune.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="ភាគរយផ្ទៃដីដាំដុះតាមប្រភេទដំណាំ">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={areaByCropType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" labelLine={true} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                               {areaByCropType.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="ផ្ទៃដីដាំដុះតាមត្រីមាស">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={areaByQuarter}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ផ្ទៃដី" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="ផ្ទៃដីដាំដុះតាមខែ">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={areaByMonth}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ផ្ទៃដី" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    );
};

export default AnnualPlantingReport;
