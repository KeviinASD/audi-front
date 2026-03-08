import api from '@/lib/api/api';
import type { AiAuditReportResponse, DailyLaboratoryHeatMap, EquipmentDailyDetail } from '../interfaces';

export class AnalysisService {
    static async getDailyHeatMap(
        laboratoryId: string | number,
        date: string,
    ): Promise<DailyLaboratoryHeatMap> {
        const res = await api.get<DailyLaboratoryHeatMap>('/audit-analysis/daily', {
            params: { laboratoryId: String(laboratoryId), date },
        });
        return res.data;
    }

    static async getEquipmentDetail(
        equipmentId: string,
        date: string,
    ): Promise<EquipmentDailyDetail> {
        const res = await api.get<EquipmentDailyDetail>('/audit-analysis/equipment-detail', {
            params: { equipmentId, date },
        });
        return res.data;
    }

    static async requestAiAnalysis(params: {
        equipmentId?: string | number;
        laboratoryId?: string | number;
        date: string;
        autoCreateFindings?: boolean;
    }): Promise<AiAuditReportResponse> {
        const { autoCreateFindings = true, ...rest } = params;
        // Claude puede tardar hasta ~60 s — se sobreescribe el timeout solo para esta petición
        const res = await api.post<AiAuditReportResponse>(
            '/audit-analysis/ai',
            { ...rest, autoCreateFindings },
            { timeout: 120_000 },   // 2 minutos
        );
        return res.data;
    }
}
