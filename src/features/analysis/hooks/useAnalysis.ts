import { useEffect, useState } from 'react';
import { AnalysisService } from '../services/analysis.service';
import type { DailyLaboratoryHeatMap, EquipmentDailyDetail } from '../interfaces';

export function useDailyHeatMap(
    laboratoryId: string | number | null,
    date: string,
) {
    const [data, setData] = useState<DailyLaboratoryHeatMap | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = async () => {
        if (!laboratoryId || !date) return;
        setLoading(true);
        setError(null);
        try {
            const result = await AnalysisService.getDailyHeatMap(laboratoryId, date);
            setData(result);
        } catch {
            setData(null);
            setError('No se pudo cargar el análisis. Verifica los datos e intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [laboratoryId, date]);

    return { data, loading, error, refetch: fetch };
}

export function useEquipmentDetail(
    equipmentId: string | null,
    date: string,
) {
    const [data, setData] = useState<EquipmentDailyDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!equipmentId || !date) {
            setData(null);
            return;
        }
        setLoading(true);
        setError(null);
        AnalysisService.getEquipmentDetail(equipmentId, date)
            .then(setData)
            .catch(() => {
                setData(null);
                setError('No se pudo cargar el detalle del equipo.');
            })
            .finally(() => setLoading(false));
    }, [equipmentId, date]);

    return { data, loading, error };
}
