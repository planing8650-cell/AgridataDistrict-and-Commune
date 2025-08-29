
export interface Commune {
    id: string;
    name: string;
}

export interface Village {
    id: string;
    name: string;
    communeId: string;
}

export enum Season {
    WET = 'រដូវវស្សា',
    DRY = 'រដូវប្រាំង',
}

export enum CropType {
    HORTICULTURE = 'សាកវប្បកម្ម',
    INDUSTRIAL = 'ឧស្សាហកម្ម',
    RICE = 'ស្រូវ',
}

export interface PlantingData {
    id: string;
    communeId: string;
    villageId: string;
    season: Season;
    cropName: string;
    cropType: CropType;
    cultivatedArea: number;
    plantingDate: string;
}

export interface HarvestData {
    id: string;
    communeId: string;
    villageId: string;
    season: Season;
    cropName: string;
    cropType: CropType;
    floweringArea: number;
    ripeArea: number;
    harvestedArea: number;
    yield: number; // tons per hectare
    harvestDate: string;
}
