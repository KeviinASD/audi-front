import api from '@/lib/api/api';
import type {
    SoftwareInstalledResponse,
    SnapshotHistoryEntry,
    CreateAuthorizedSoftwareRequest,
    AuthorizedSoftwareResponse,
} from '../interfaces';

const BASE_URL = '/software';

export class SoftwareService {
    static async getLatestByEquipment(equipmentId: number): Promise<SoftwareInstalledResponse[]> {
        const res = await api.get<SoftwareInstalledResponse[]>(
            `${BASE_URL}/equipment/${equipmentId}/latest`
        );
        return res.data;
    }

    static async getHistory(equipmentId: number): Promise<SnapshotHistoryEntry[]> {
        const res = await api.get<SnapshotHistoryEntry[]>(
            `${BASE_URL}/equipment/${equipmentId}/history`
        );
        return res.data;
    }

    static async getAuthorizedSoftware(): Promise<AuthorizedSoftwareResponse[]> {
        const res = await api.get<AuthorizedSoftwareResponse[]>(`${BASE_URL}/whitelist`);
        return res.data;
    }

    static async addToWhitelist(data: CreateAuthorizedSoftwareRequest): Promise<AuthorizedSoftwareResponse> {
        const res = await api.post<AuthorizedSoftwareResponse>(`${BASE_URL}/whitelist`, data);
        return res.data;
    }
}
