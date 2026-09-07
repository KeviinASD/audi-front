import api from '@/lib/api/api';
import type {
    GovernanceThresholdResponse,
    GroupedThresholdsResponse,
    SeverityMatrixEntry,
    UpdateThresholdRequest,
    ApproveThresholdRequest,
} from '../interfaces';

const BASE_URL = '/governance';

export class GovernanceThresholdService {
    static async getGrouped(): Promise<GroupedThresholdsResponse> {
        const res = await api.get<GroupedThresholdsResponse>(`${BASE_URL}/thresholds/grouped`);
        return res.data;
    }

    static async getAll(): Promise<GovernanceThresholdResponse[]> {
        const res = await api.get<GovernanceThresholdResponse[]>(`${BASE_URL}/thresholds`);
        return res.data;
    }

    static async getById(id: number): Promise<GovernanceThresholdResponse> {
        const res = await api.get<GovernanceThresholdResponse>(`${BASE_URL}/thresholds/${id}`);
        return res.data;
    }

    static async getSeverityMatrix(): Promise<SeverityMatrixEntry[]> {
        const res = await api.get<SeverityMatrixEntry[]>(`${BASE_URL}/severity-matrix`);
        return res.data;
    }

    static async update(
        id: number,
        data: UpdateThresholdRequest,
    ): Promise<GovernanceThresholdResponse> {
        const res = await api.patch<GovernanceThresholdResponse>(
            `${BASE_URL}/thresholds/${id}`,
            data,
        );
        return res.data;
    }

    static async approve(
        id: number,
        data: ApproveThresholdRequest,
    ): Promise<GovernanceThresholdResponse> {
        const res = await api.post<GovernanceThresholdResponse>(
            `${BASE_URL}/thresholds/${id}/approve`,
            data,
        );
        return res.data;
    }
}
