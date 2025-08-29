
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Card from '../components/common/Card';
import ChartContainer from '../components/common/ChartContainer';
import { SEASONS, CROP_TYPES } from '../constants';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];
const MONTH_NAMES = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const QUARTER_NAMES = ["ត្រីមាស១", "ត្រីមាស២", "ត្រីមាស៣", "ត្រីមាស៤"];

const AnnualHarvestReport: React.FC = () => {
    const { communes, villages, harvestData } = useData();
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        season: '', communeId: '', villageId: '', cropType: '', cropName: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, ...(name === 'communeId' && { villageId: '' }) }));
    };

    const uniqueYears = useMemo(() => [...new Set(harvestData.map(d => new Date(d.harvestDate).getFullYear()))].sort((a,b)=>b-a), [harvestData]);
    const uniqueCropNames = useMemo(() => [...new Set(harvestData.map(d => d.cropName))], [harvestData]);
    const availableVillages = useMemo(() => filters.communeId ? villages.filter(v => v.communeId === filters.communeId) : [], [filters.communeId, villages]);

    const filteredData = useMemo(() => {
        return harvestData.filter(d => {
            const date = new Date(d.harvestDate);
            return (filters.year ? date.getFullYear().toString() === filters.year : true) &&
                   (filters.season ? d.season === filters.season : true) &&
                   (filters.communeId ? d.communeId === filters.communeId : true) &&
                   (filters.villageId ? d.villageId === filters.villageId : true) &&
                   (filters.cropType ? d.cropType === filters.cropType : true) &&
                   (filters.cropName ? d.cropName === filters.cropName : true);
        });
    }, [filters, harvestData]);
    
    const { totalFlowering, totalRipe, totalHarvested, totalProduction } = useMemo(() => {
        return filteredData.reduce((acc, d) => {
            acc.totalFlowering += d.floweringArea;
            acc.totalRipe += d.ripeArea;
            acc.totalHarvested += d.harvestedArea;
            acc.totalProduction += d.harvestedArea * d.yield;
            return acc;
        }, { totalFlowering: 0, totalRipe: 0, totalHarvested: 0, totalProduction: 0 });
    }, [filteredData]);

    const createVillagePieData = (key: 'floweringArea' | 'ripeArea' | 'harvestedArea') => {
        const dataMap = new Map<string, number>();
        filteredData.forEach(d => {
            const villageName = villages.find(v => v.id === d.villageId)?.name || 'មិនស្គាល់';
            dataMap.set(villageName, (dataMap.get(villageName) || 0) + d[key]);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, value }));
    };

    const floweringByVillage = useMemo(() => createVillagePieData('floweringArea'), [filteredData, villages]);
    const ripeByVillage = useMemo(() => createVillagePieData('ripeArea'), [filteredData, villages]);
    const harvestedByVillage = useMemo(() => createVillagePieData('harvestedArea'), [filteredData, villages]);

    const floweringByCommune = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredData.forEach(d => {
            const communeName = communes.find(c => c.id === d.communeId)?.name || 'មិនស្គាល់';
            dataMap.set(communeName, (dataMap.get(communeName) || 0) + d.floweringArea);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, value }));
    }, [filteredData, communes]);

    const ripeByCommune = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredData.forEach(d => {
            const communeName = communes.find(c => c.id === d.communeId)?.name || 'មិនស្គាល់';
            dataMap.set(communeName, (dataMap.get(communeName) || 0) + d.ripeArea);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, value }));
    }, [filteredData, communes]);
    
    const harvestedByCommune = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredData.forEach(d => {
            const communeName = communes.find(c => c.id === d.communeId)?.name || 'មិនស្គាល់';
            dataMap.set(communeName, (dataMap.get(communeName) || 0) + d.harvestedArea);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, value }));
    }, [filteredData, communes]);

    const createLineData = (period: 'month' | 'quarter') => {
        const periods = period === 'month' ? 12 : 4;
        const periodNames = period === 'month' ? MONTH_NAMES : QUARTER_NAMES;
        const data = Array.from({ length: periods }, (_, i) => ({ 
            name: periodNames[i],
            'ផ្ទៃដីបែកផ្កា': 0, 'ផ្ទៃដីទុំ': 0, 'ផ្ទៃដីប្រមូលផល': 0
        }));
        
        filteredData.forEach(d => {
            const date = new Date(d.harvestDate);
            const index = period === 'month' ? date.getMonth() : Math.floor(date.getMonth() / 3);
            data[index]['ផ្ទៃដីបែកផ្កា'] += d.floweringArea;
            data[index]['ផ្ទៃដីទុំ'] += d.ripeArea;
            data[index]['ផ្ទៃដីប្រមូលផល'] += d.harvestedArea;
        });
        return data;
    }
    
    const dataByQuarter = useMemo(() => createLineData('quarter'), [filteredData]);
    const dataByMonth = useMemo(() => createLineData('month'), [filteredData]);

    const renderCustomLabel = ({ name, percent }: any) => {
        if (!percent || percent === 0) return null;
        return `${name} ${(percent * 100).toFixed(0)}%`;
    };

    return (
        <div>
            <h2 className="text-3xl font-heading text-gray-800 mb-6">របាយការណ៍ប្រមូលផលប្រចាំឆ្នាំ</h2>

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

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card title="ផ្ទៃដីបែកផ្កា (ហ)" value={totalFlowering.toLocaleString()} icon={<div/>}/>
                <Card title="ផ្ទៃដីទុំ (ហ)" value={totalRipe.toLocaleString()} color="bg-yellow-500" icon={<div/>}/>
                <Card title="ផ្ទៃដីប្រមូលផល (ហ)" value={totalHarvested.toLocaleString()} color="bg-success-500" icon={<div/>}/>
                <Card title="បរិមាណផល (តោន)" value={totalProduction.toLocaleString(undefined, {maximumFractionDigits: 2})} color="bg-red-500" icon={<div/>}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <ChartContainer title="% ផ្ទៃដីបែកផ្កាតាមភូមិ">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={floweringByVillage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={true} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                                {floweringByVillage.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="% ផ្ទៃដីទុំតាមភូមិ">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={ripeByVillage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" labelLine={true} label={renderCustomLabel}>
                                {ripeByVillage.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="% ផ្ទៃដីប្រមូលផលតាមភូមិ">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={harvestedByVillage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ffc658" labelLine={true} label={renderCustomLabel}>
                                {harvestedByVillage.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
             
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <ChartContainer title="% ផ្ទៃដីបែកផ្កាតាមឃុំ">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={floweringByCommune} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={true} label={renderCustomLabel}>
                                {floweringByCommune.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="% ផ្ទៃដីទុំតាមឃុំ">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={ripeByCommune} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" labelLine={true} label={renderCustomLabel}>
                                {ripeByCommune.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="% ផ្ទៃដីប្រមូលផលតាមឃុំ">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={harvestedByCommune} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ffc658" labelLine={true} label={renderCustomLabel}>
                                {harvestedByCommune.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip/>
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="ទិន្នន័យប្រមូលផលតាមត្រីមាស">
                    <ResponsiveContainer>
                        <LineChart data={dataByQuarter}>
                            <CartesianGrid/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Line type="monotone" dataKey="ផ្ទៃដីបែកផ្កា" stroke="#8884d8"/>
                            <Line type="monotone" dataKey="ផ្ទៃដីទុំ" stroke="#82ca9d"/>
                            <Line type="monotone" dataKey="ផ្ទៃដីប្រមូលផល" stroke="#ffc658"/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                 <ChartContainer title="ទិន្នន័យប្រមូលផលតាមខែ">
                    <ResponsiveContainer>
                        <LineChart data={dataByMonth}>
                            <CartesianGrid/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Line type="monotone" dataKey="ផ្ទៃដីបែកផ្កា" stroke="#8884d8"/>
                            <Line type="monotone" dataKey="ផ្ទៃដីទុំ" stroke="#82ca9d"/>
                            <Line type="monotone" dataKey="ផ្ទៃដីប្រមូលផល" stroke="#ffc658"/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

        </div>
    );
};

export default AnnualHarvestReport;
