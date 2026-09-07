import api from '@/lib/api/api';
import type {
    ParkComplianceResponse,
    EquipmentComplianceResponse,
} from '../interfaces';

const BASE_URL = '/governance/compliance';

/**
 * El timeout global de axios son 10 s, pensado para consultas puntuales.
 * Estos dos endpoints evalúan todo el parque contra todos los umbrales:
 * son reportes agregados y tardan más por naturaleza. Se les da un margen
 * propio en vez de aflojar el timeout global, que existe para detectar
 * justamente los endpoints que se cuelgan.
 */
const REPORT_TIMEOUT_MS = 60_000;

export class ComplianceService {
    /** Cumplimiento agregado de todo el parque. */
    static async getPark(): Promise<ParkComplianceResponse> {
        const res = await api.get<ParkComplianceResponse>(BASE_URL, {
            timeout: REPORT_TIMEOUT_MS,
        });
        return res.data;
    }

    /** Cumplimiento de un equipo puntual, umbral por umbral. */
    static async getByEquipment(equipmentId: number): Promise<EquipmentComplianceResponse> {
        const res = await api.get<EquipmentComplianceResponse>(
            `${BASE_URL}/equipment/${equipmentId}`,
            { timeout: REPORT_TIMEOUT_MS },
        );
        return res.data;
    }
}
