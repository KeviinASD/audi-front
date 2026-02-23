import api from '@/lib/api/api';
import type { HardwareSnapshotResponse } from '../interfaces';

const BASE_URL = '/hardware';

export class HardwareService {
    static async getLatest(equipmentId: number): Promise<HardwareSnapshotResponse> {
        const res = await api.get<HardwareSnapshotResponse>(
            `${BASE_URL}/equipment/${equipmentId}/latest`
        );
        return res.data;
    }

    static async getHistory(equipmentId: number, from: Date, to: Date): Promise<HardwareSnapshotResponse[]> {
        const res = await api.get<HardwareSnapshotResponse[]>(
            `${BASE_URL}/equipment/${equipmentId}/history`,
            { params: { from: from.toISOString(), to: to.toISOString() } }
        );
        return res.data;
    }
}
