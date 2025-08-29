import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Commune, Village } from '../types';
import Modal from '../components/common/Modal';



const ManageLocations: React.FC = () => {
    const { communes, setCommunes, villages, setVillages } = useData();
    const [isCommuneModalOpen, setCommuneModalOpen] = useState(false);
    const [isVillageModalOpen, setVillageModalOpen] = useState(false);
    const [currentCommune, setCurrentCommune] = useState<Commune | null>(null);
    const [currentVillage, setCurrentVillage] = useState<Village | null>(null);
    const [communeName, setCommuneName] = useState('');
    const [villageName, setVillageName] = useState('');
    const [selectedCommuneId, setSelectedCommuneId] = useState('');

    const handleOpenCommuneModal = (commune: Commune | null = null) => {
        setCurrentCommune(commune);
        setCommuneName(commune ? commune.name : '');
        setCommuneModalOpen(true);
    };

    const handleOpenVillageModal = (village: Village | null = null) => {
        setCurrentVillage(village);
        setVillageName(village ? village.name : '');
        setSelectedCommuneId(village ? village.communeId : communes[0]?.id || '');
        setVillageModalOpen(true);
    };
    
    const handleSaveCommune = () => {
        if (!communeName.trim()) return;
        if (currentCommune) {
            setCommunes(prev => prev.map(c => c.id === currentCommune.id ? { ...c, name: communeName } : c));
        } else {
            setCommunes(prev => [...prev, { id: Date.now().toString(), name: communeName }]);
        }
        setCommuneModalOpen(false);
    };

    const handleDeleteCommune = (id: string) => {        
            setCommunes(prev => prev.filter(c => c.id !== id));
            setVillages(prev => prev.filter(v => v.communeId !== id));
        };
    
    
    const handleSaveVillage = () => {
        if (!villageName.trim() || !selectedCommuneId) return;
        if (currentVillage) {
            setVillages(prev => prev.map(v => v.id === currentVillage.id ? { ...v, name: villageName, communeId: selectedCommuneId } : v));
        } else {
            setVillages(prev => [...prev, { id: Date.now().toString(), name: villageName, communeId: selectedCommuneId }]);
        }
        setVillageModalOpen(false);
    };

    const handleDeleteVillage = (id: string) => {
            setVillages(prev => prev.filter(v => v.id !== id));
        };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-heading text-gray-800">គ្រប់គ្រងឃុំ និង ភូមិ</h2>
                <div className="space-x-2">
                    <button onClick={() => handleOpenCommuneModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">បន្ថែមឃុំ</button>
                    <button onClick={() => handleOpenVillageModal()} className="bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition" disabled={communes.length === 0}>បន្ថែមភូមិ</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Communes Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-heading mb-4">បញ្ជីឃុំ</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">ឈ្មោះឃុំ</th>
                                    <th scope="col" className="px-6 py-3 text-right">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody>
                                {communes.map(commune => (
                                    <tr key={commune.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{commune.name}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleOpenCommuneModal(commune)} className="font-medium text-blue-600 hover:underline">កែសម្រួល</button>
                                            <button onClick={() => handleDeleteCommune(commune.id)} className="font-medium text-red-600 hover:underline">លុប</button>
                                        </td>
                                    </tr>
                                ))}
                                {communes.length === 0 && (
                                    <tr><td colSpan={2} className="text-center py-4">គ្មានទិន្នន័យ</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Villages Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-heading mb-4">បញ្ជីភូមិ</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">ឈ្មោះភូមិ</th>
                                    <th scope="col" className="px-6 py-3">ចំណុះឃុំ</th>
                                    <th scope="col" className="px-6 py-3 text-right">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody>
                                {villages.map(village => (
                                    <tr key={village.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{village.name}</td>
                                        <td className="px-6 py-4">{communes.find(c => c.id === village.communeId)?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleOpenVillageModal(village)} className="font-medium text-blue-600 hover:underline">កែសម្រួល</button>
                                            <button onClick={() => handleDeleteVillage(village.id)} className="font-medium text-red-600 hover:underline">លុប</button>
                                        </td>
                                    </tr>
                                ))}
                                {villages.length === 0 && (
                                    <tr><td colSpan={3} className="text-center py-4">គ្មានទិន្នន័យ</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Commune Modal */}
            <Modal isOpen={isCommuneModalOpen} onClose={() => setCommuneModalOpen(false)} title={currentCommune ? 'កែសម្រួលឃុំ' : 'បន្ថែមឃុំថ្មី'}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="communeName" className="block mb-2 text-sm font-medium text-gray-900">ឈ្មោះឃុំ</label>
                        <input type="text" id="communeName" value={communeName} onChange={e => setCommuneName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSaveCommune} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">រក្សាទុក</button>
                    </div>
                </div>
            </Modal>

            {/* Village Modal */}
            <Modal isOpen={isVillageModalOpen} onClose={() => setVillageModalOpen(false)} title={currentVillage ? 'កែសម្រួលភូមិ' : 'បន្ថែមភូមិថ្មី'}>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="communeSelect" className="block mb-2 text-sm font-medium text-gray-900">ជ្រើសរើសឃុំ</label>
                        <select id="communeSelect" value={selectedCommuneId} onChange={e => setSelectedCommuneId(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                           {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="villageName" className="block mb-2 text-sm font-medium text-gray-900">ឈ្មោះភូមិ</label>
                        <input type="text" id="villageName" value={villageName} onChange={e => setVillageName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleSaveVillage} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">រក្សាទុក</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageLocations;