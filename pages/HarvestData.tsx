
import React, { useState, useMemo, ChangeEvent } from 'react';
import { useData } from '../context/DataContext';
import { HarvestData as HarvestDataType, Season, CropType, Village } from '../types';
import { SEASONS, CROP_TYPES } from '../constants';
import Modal from '../components/common/Modal';
import * as XLSX from 'xlsx';

const initialFormState: Omit<HarvestDataType, 'id'> = {
    communeId: '',
    villageId: '',
    season: Season.WET,
    cropName: '',
    cropType: CropType.RICE,
    floweringArea: 0,
    ripeArea: 0,
    harvestedArea: 0,
    yield: 0,
    harvestDate: new Date().toISOString().split('T')[0],
};

const HarvestData: React.FC = () => {
    const { communes, villages, harvestData, setHarvestData } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentData, setCurrentData] = useState<HarvestDataType | null>(null);
    const [formData, setFormData] = useState<Omit<HarvestDataType, 'id'>>(initialFormState);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const availableVillages = useMemo(() => {
        if (!formData.communeId) return [];
        return villages.filter(v => v.communeId === formData.communeId);
    }, [formData.communeId, villages]);

    const handleOpenModal = (data: HarvestDataType | null = null) => {
        setCurrentData(data);
        if (data) {
            setFormData(data);
        } else {
            const defaultCommuneId = communes[0]?.id || '';
            const defaultVillageId = villages.find(v => v.communeId === defaultCommuneId)?.id || '';
            setFormData({ ...initialFormState, communeId: defaultCommuneId, villageId: defaultVillageId });
        }
        setModalOpen(true);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const isNumberField = ['floweringArea', 'ripeArea', 'harvestedArea', 'yield'].includes(name);
            const newState = { ...prev, [name]: isNumberField ? parseFloat(value) : value };
            if (name === 'communeId') {
                 const firstVillage = villages.find(v => v.communeId === value);
                 newState.villageId = firstVillage ? firstVillage.id : '';
            }
            return newState;
        });
    };

    const handleSave = () => {
         if (!formData.communeId || !formData.villageId || !formData.cropName.trim()) {
            alert('សូមបំពេញគ្រប់ប្រអប់។');
            return;
        }
        if (currentData) {
            setHarvestData(harvestData.map(d => d.id === currentData.id ? { ...formData, id: currentData.id } : d));
        } else {
            setHarvestData([...harvestData, { ...formData, id: Date.now().toString() }]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id: string) => {
            setHarvestData(harvestData.filter(d => d.id !== id));
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => {
            const newSelectedIds = new Set(prev);
            if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id);
            } else {
                newSelectedIds.add(id);
            }
            return newSelectedIds;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(harvestData.map(d => d.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleDeleteSelected = () => {
        setHarvestData(prev => prev.filter(d => !selectedIds.has(d.id)));
        setSelectedIds(new Set());
    };

     const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            if(!data) return;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            const newEntries: HarvestDataType[] = json.map((row, index) => {
                const commune = communes.find(c => c.name === row['ឃុំ']);
                const village = villages.find(v => v.name === row['ភូមិ'] && v.communeId === commune?.id);

                if (!commune || !village) {
                    console.warn(`Skipping row ${index + 2}: Could not find matching commune/village for "${row['ឃុំ']}"/"${row['ភូមិ']}"`);
                    return null;
                }

                return {
                    id: `${Date.now()}-${index}`,
                    communeId: commune.id,
                    villageId: village.id,
                    season: row['រដូវ'],
                    cropName: row['ឈ្មោះដំណាំ'],
                    cropType: row['ប្រភេទដំណាំ'],
                    floweringArea: parseFloat(row['ផ្ទៃដីបែកផ្កា (ហិចតា)']),
                    ripeArea: parseFloat(row['ផ្ទៃដីទុំ (ហិចតា)']),
                    harvestedArea: parseFloat(row['ផ្ទៃដីប្រមូលផល (ហិចតា)']),
                    yield: parseFloat(row['ទិន្នផល (តោន/ហិចតា)']),
                    harvestDate: new Date((row['កាលបរិច្ឆេទប្រមូលផល'] - (25567 + 1)) * 86400 * 1000).toISOString().split('T')[0],
                };
            }).filter((item): item is HarvestDataType => item !== null);

            setHarvestData(prev => [...prev, ...newEntries]);
            alert(`បាននាំចូល ${newEntries.length} កំណត់ត្រាដោយជោគជ័យ។`);
        };
        reader.readAsBinaryString(file);
    };

    const getCommuneName = (id: string) => communes.find(c => c.id === id)?.name || 'N/A';
    const getVillageName = (id: string) => villages.find(v => v.id === id)?.name || 'N/A';

    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-heading text-gray-800">
                    {selectedIds.size > 0 ? `បានជ្រើសរើស ${selectedIds.size}` : 'បញ្ចូលទិន្នន័យប្រមូលផល'}
                </h2>
                <div className="flex items-center space-x-2">
                     {selectedIds.size > 0 ? (
                        <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                            លុប
                        </button>
                    ) : (
                        <>
                            <label className="bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition cursor-pointer">
                                <span>នាំចូលពី Excel</span>
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                            </label>
                            <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">បន្ថែមទិន្នន័យ</button>
                        </>
                     )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="p-4">
                                     <input
                                        type="checkbox"
                                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                        onChange={handleSelectAll}
                                        checked={harvestData.length > 0 && selectedIds.size === harvestData.length}
                                        ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < harvestData.length; }}
                                    />
                                </th>
                                <th className="px-2 py-3">ឃុំ</th>
                                <th className="px-2 py-3">ភូមិ</th>
                                <th className="px-2 py-3">ឈ្មោះដំណាំ</th>
                                <th className="px-2 py-3">ប្រភេទដំណាំ</th>
                                <th className="px-2 py-3">ផ្ទៃដីបែកផ្កា</th>
                                <th className="px-2 py-3">ផ្ទៃដីទុំ</th>
                                <th className="px-2 py-3">ផ្ទៃដីប្រមូលផល</th>
                                <th className="px-2 py-3">ទិន្នផល (តោន/ហ)</th>
                                <th className="px-2 py-3">កាលបរិច្ឆេទ</th>
                                <th className="px-2 py-3 text-right">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody>
                            {harvestData.map(data => (
                                <tr key={data.id} className={`bg-white border-b ${selectedIds.has(data.id) ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                                    <td className="p-4">
                                         <input
                                            type="checkbox"
                                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                            checked={selectedIds.has(data.id)}
                                            onChange={() => handleSelectRow(data.id)}
                                        />
                                    </td>
                                    <td className="px-2 py-4">{getCommuneName(data.communeId)}</td> 
                                    <td className="px-2 py-4">{getVillageName(data.villageId)}</td>                                    
                                    <td className="px-2 py-4">{data.cropName}</td>
                                    <td className="px-2 py-4">{data.cropType}</td>
                                    <td className="px-2 py-4">{data.floweringArea.toLocaleString()}</td>
                                    <td className="px-2 py-4">{data.ripeArea.toLocaleString()}</td>
                                    <td className="px-2 py-4">{data.harvestedArea.toLocaleString()}</td>
                                    <td className="px-2 py-4">{data.yield.toLocaleString()}</td>
                                    <td className="px-2 py-4">{data.harvestDate}</td>
                                    <td className="px-2 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(data)} className="font-medium text-blue-600 hover:underline">កែសម្រួល</button>
                                        <button onClick={() => handleDelete(data.id)} className="font-medium text-red-600 hover:underline">លុប</button>
                                    </td>
                                </tr>
                            ))}
                             {harvestData.length === 0 && (
                                <tr><td colSpan={11} className="text-center py-4">គ្មានទិន្នន័យ</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={currentData ? 'កែសម្រួលទិន្នន័យប្រមូលផល' : 'បន្ថែមទិន្នន័យប្រមូលផល'}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <select name="communeId" value={formData.communeId} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                         <option value="">ជ្រើសរើសឃុំ</option>
                         {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                     <select name="villageId" value={formData.villageId} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" disabled={!formData.communeId}>
                          <option value="">ជ្រើសរើសភូមិ</option>
                          {availableVillages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                     </select>
                     <select name="season" value={formData.season} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                         {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                     <input type="text" name="cropName" value={formData.cropName} onChange={handleInputChange} placeholder="ឈ្មោះដំណាំ" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
                     <select name="cropType" value={formData.cropType} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                         {CROP_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                     </select>
                     <input type="number" name="floweringArea" value={formData.floweringArea} onChange={handleInputChange} placeholder="ផ្ទៃដីបែកផ្កា (ហិចតា)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
                     <input type="number" name="ripeArea" value={formData.ripeArea} onChange={handleInputChange} placeholder="ផ្ទៃដីទុំ (ហិចតា)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
                     <input type="number" name="harvestedArea" value={formData.harvestedArea} onChange={handleInputChange} placeholder="ផ្ទៃដីប្រមូលផល (ហិចតា)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
                     <input type="number" name="yield" value={formData.yield} onChange={handleInputChange} placeholder="ទិន្នផល (តោន/ហិចតា)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
                     <input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
                 </div>
                 <div className="flex justify-end mt-6">
                    <button onClick={handleSave} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">រក្សាទុក</button>
                 </div>
            </Modal>
        </div>
    );
};

export default HarvestData;
