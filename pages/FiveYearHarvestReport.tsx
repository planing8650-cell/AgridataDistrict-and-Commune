
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { SEASONS, CROP_TYPES } from '../constants';

type DataTypeKey = 'floweringArea' | 'ripeArea' | 'harvestedArea';

const DATA_TYPE_OPTIONS: { key: DataTypeKey; label: string; color: string }[] = [
    { key: 'floweringArea', label: 'ផ្ទៃដីបែកផ្កា', color: '#8884d8' },
    { key: 'ripeArea', label: 'ផ្ទៃដីទុំ', color: '#82ca9d' },
    { key: 'harvestedArea', label: 'ផ្ទៃដីប្រមូលផល', color: '#ffc658' },
];

const createChartLabel = (start: string, end: string): string => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const startYear = !isNaN(startDate.getTime()) ? startDate.getFullYear() : null;
    const endYear = !isNaN(endDate.getTime()) ? endDate.getFullYear() : null;

    if (startYear === null || endYear === null) return 'កាលបរិច្ឆេទមិនត្រឹមត្រូវ';

    if (startYear === endYear) {
        return startYear.toString();
    }
    return `${startYear}-${endYear}`;
};

const FiveYearHarvestReport: React.FC = () => {
    const { communes, villages, harvestData } = useData();
    const currentYear = new Date().getFullYear();

    const [filters, setFilters] = useState({
        season: '',
        communeId: '',
        villageId: '',
        cropType: '',
        cropName: '',
        dataType: 'harvestedArea' as DataTypeKey,
    });

    const [dateRanges, setDateRanges] = useState(() => {
        return Array.from({ length: 5 }, (_, i) => {
            const year = currentYear - (4 - i);
            return {
                start: `${year}-01-01`,
                end: `${year}-12-31`,
            };
        });
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, ...(name === 'communeId' && { villageId: '' }) }));
    };

    const handleDateChange = (index: number, field: 'start' | 'end', value: string) => {
        const newRanges = [...dateRanges];
        newRanges[index] = { ...newRanges[index], [field]: value };
        setDateRanges(newRanges);
    };
    
    const uniqueCropNames = useMemo(() => [...new Set(harvestData.map(d => d.cropName))], [harvestData]);
    const availableVillages = useMemo(() => filters.communeId ? villages.filter(v => v.communeId === filters.communeId) : [], [filters.communeId, villages]);
    
    const selectedDataType = useMemo(() => DATA_TYPE_OPTIONS.find(opt => opt.key === filters.dataType)!, [filters.dataType]);

    const chartData = useMemo(() => {
        return dateRanges.map(range => {
            const { start, end } = range;
            
            if (!start || !end) {
                 return { name: 'Invalid Range', [selectedDataType.label]: 0 };
            }

            const [startYear, startMonth, startDay] = start.split('-').map(Number);
            const startDate = new Date(startYear, startMonth - 1, startDay);
            
            const [endYear, endMonth, endDay] = end.split('-').map(Number);
            const endDate = new Date(endYear, endMonth - 1, endDay);
            endDate.setHours(23, 59, 59, 999);

            const totalValue = harvestData
                .filter(d => {
                    if (!d.harvestDate) return false;
                    const [hYear, hMonth, hDay] = d.harvestDate.split('-').map(Number);
                    const dDate = new Date(hYear, hMonth - 1, hDay);

                    return dDate >= startDate && dDate <= endDate &&
                        (!filters.season || d.season === filters.season) &&
                        (!filters.communeId || d.communeId === filters.communeId) &&
                        (!filters.villageId || d.villageId === filters.villageId) &&
                        (!filters.cropType || d.cropType === filters.cropType) &&
                        (!filters.cropName || d.cropName === filters.cropName);
                })
                .reduce((sum, d) => sum + d[filters.dataType], 0);

            const chartLabel = createChartLabel(start, end);
            return { name: chartLabel, [selectedDataType.label]: totalValue };
        });
    }, [filters, dateRanges, harvestData, selectedDataType]);


    return (
        <div>
            <h2 className="text-3xl font-heading text-gray-800 mb-6">របាយការណ៍ប្រៀបធៀបការប្រមូលផលរយៈពេល ៥ ឆ្នាំ</h2>
            <div className="p-4 bg-white rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                     <select name="dataType" value={filters.dataType} onChange={handleFilterChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                        {DATA_TYPE_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
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

             <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                 <h3 className="text-lg font-heading text-gray-700 mb-4">កំណត់កាលបរិច្ឆេទសម្រាប់ឆ្នាំនីមួយៗ</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {dateRanges.map((range, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                            <p className="font-bold text-center mb-2">{createChartLabel(range.start, range.end)}</p>
                            <div className="space-y-2">
                                <div><label className="text-xs">ចាប់ពី</label><input type="date" value={range.start} onChange={(e) => handleDateChange(index, 'start', e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1.5"/></div>
                                <div><label className="text-xs">ដល់</label><input type="date" value={range.end} onChange={(e) => handleDateChange(index, 'end', e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-1.5"/></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={selectedDataType.label} fill={selectedDataType.color} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FiveYearHarvestReport;
