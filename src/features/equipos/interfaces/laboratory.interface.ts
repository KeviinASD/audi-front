export interface LaboratoryResponse {
    id: number;
    name: string;
    location?: string;
    responsible?: string;
    responsibleEmail?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateLaboratoryRequest {
    name: string;
    location?: string;
    responsible?: string;
    responsibleEmail?: string;
}

export interface UpdateLaboratoryRequest extends Partial<CreateLaboratoryRequest> {
    isActive?: boolean;
}
