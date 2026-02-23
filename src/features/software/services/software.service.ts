import api from '@/lib/api/api';
import type { SoftwareInstalledResponse, CreateAuthorizedSoftwareRequest, AuthorizedSoftwareResponse } from '../interfaces';

const BASE_URL = '/software';

export class SoftwareService {
    static async getLatestByEquipment(equipmentId: number): Promise<SoftwareInstalledResponse[]> {
        const res = await api.get<SoftwareInstalledResponse[]>(
            `${BASE_URL}/equipment/${equipmentId}/latest`
        );
        return res.data;
    }

    static async addToWhitelist(data: CreateAuthorizedSoftwareRequest): Promise<AuthorizedSoftwareResponse> {
        const res = await api.post<AuthorizedSoftwareResponse>(
            `${BASE_URL}/whitelist`,
            data
        );
        return res.data;
    }
}
