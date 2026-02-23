import api from '@/lib/api/api';
import type { SoftwareInstalledResponse } from '../interfaces';

const BASE_URL = '/software';

export class SoftwareService {
    static async getLatestByEquipment(equipmentId: number): Promise<SoftwareInstalledResponse[]> {
        const res = await api.get<SoftwareInstalledResponse[]>(
            `${BASE_URL}/equipment/${equipmentId}/latest`
        );
        return res.data;
    }
}
