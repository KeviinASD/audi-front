import api from '@/lib/api/api';
import type { LaboratoryResponse, CreateLaboratoryRequest, UpdateLaboratoryRequest } from '../interfaces';

const BASE_URL = '/laboratorios';

export class LaboratoryService {
    static async getAll(): Promise<LaboratoryResponse[]> {
        const res = await api.get<LaboratoryResponse[]>(BASE_URL);
        return res.data;
    }

    static async getById(id: string): Promise<LaboratoryResponse> {
        const res = await api.get<LaboratoryResponse>(`${BASE_URL}/${id}`);
        return res.data;
    }

    static async create(data: CreateLaboratoryRequest): Promise<LaboratoryResponse> {
        const res = await api.post<LaboratoryResponse>(BASE_URL, data);
        return res.data;
    }

    static async update(id: string, data: UpdateLaboratoryRequest): Promise<LaboratoryResponse> {
        const res = await api.patch<LaboratoryResponse>(`${BASE_URL}/${id}`, data);
        return res.data;
    }
}
