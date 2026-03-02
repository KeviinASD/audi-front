import api from '@/lib/api/api';
import type {
    SecuritySnapshotResponse,
    SecurityRiskEquipmentResponse,
} from '../interfaces';

export class SecurityService {
    static async getLatest(equipmentId: number): Promise<SecuritySnapshotResponse> {
        const res = await api.get<SecuritySnapshotResponse>(
            `/security/equipment/${equipmentId}/latest`
        );
        return res.data;
    }

    static async getHistory(
        equipmentId: number,
        from: Date,
        to: Date
    ): Promise<SecuritySnapshotResponse[]> {
        const res = await api.get<SecuritySnapshotResponse[]>(
            `/security/equipment/${equipmentId}/history`,
            { params: { from: from.toISOString(), to: to.toISOString() } }
        );
        return res.data;
    }

    static async getEquipmentsWithRisk(): Promise<SecurityRiskEquipmentResponse[]> {
        const res = await api.get<SecurityRiskEquipmentResponse[]>('/security/risks');
        return res.data;
    }

    static async getEquipmentsWithoutAntivirus(): Promise<SecurityRiskEquipmentResponse[]> {
        const res = await api.get<SecurityRiskEquipmentResponse[]>('/security/no-antivirus');
        return res.data;
    }

    static async getEquipmentsWithPendingUpdates(): Promise<SecurityRiskEquipmentResponse[]> {
        const res = await api.get<SecurityRiskEquipmentResponse[]>('/security/pending-updates');
        return res.data;
    }
}
