import api from '@/lib/api/api';
import type {
    PerformanceSnapshotResponse,
    PerformanceAveragesResponse,
    PerformanceAlertEquipmentResponse,
} from '../interfaces';

export class PerformanceService {
    static async getLatest(equipmentId: number): Promise<PerformanceSnapshotResponse> {
        const res = await api.get<PerformanceSnapshotResponse>(
            `/performance/equipment/${equipmentId}/latest`
        );
        return res.data;
    }

    static async getHistory(
        equipmentId: number,
        from: Date,
        to: Date
    ): Promise<PerformanceSnapshotResponse[]> {
        const res = await api.get<PerformanceSnapshotResponse[]>(
            `/performance/equipment/${equipmentId}/history`,
            { params: { from: from.toISOString(), to: to.toISOString() } }
        );
        return res.data;
    }

    static async getAverages(
        equipmentId: number,
        from: Date,
        to: Date
    ): Promise<PerformanceAveragesResponse> {
        const res = await api.get<PerformanceAveragesResponse>(
            `/performance/equipment/${equipmentId}/averages`,
            { params: { from: from.toISOString(), to: to.toISOString() } }
        );
        return res.data;
    }

    static async getEquipmentsWithAlerts(): Promise<PerformanceAlertEquipmentResponse[]> {
        const res = await api.get<PerformanceAlertEquipmentResponse[]>('/performance/alerts');
        return res.data;
    }
}
