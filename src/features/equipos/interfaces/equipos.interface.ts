
export interface ILaboratory {
  id: string;
  name: string;
  location?: string;
  responsible?: string;
  responsibleEmail?: string;
  isActive: boolean;
  createdAt: string;
}

export type EquipmentStatus = 'online' | 'offline' | 'warning' | 'critical' | 'unknown';

export interface IEquipment {
  id: string;
  hostname: string;
  currentUser?: string;
  ipAddress?: string;
  osVersion?: string;
  architecture?: string;
  laboratoryId?: string;
  laboratory?: ILaboratory;
  status: EquipmentStatus;
  lastSeenAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateLaboratoryRequest {
  name: string;
  location?: string;
  responsible?: string;
  responsibleEmail?: string;
}

export interface IUpdateLaboratoryRequest extends Partial<ICreateLaboratoryRequest> {
    isActive?: boolean;
}

export interface IUpdateEquipmentRequest {
  laboratoryId?: string;
  isActive?: boolean;
}
