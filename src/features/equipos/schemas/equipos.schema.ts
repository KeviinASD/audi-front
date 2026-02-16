import { z } from "zod";

export const LaboratorySchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    location: z.string().optional(),
    responsible: z.string().optional(),
    responsibleEmail: z.string().email("Email inválido").optional().or(z.literal("")),
});

export type LaboratorySchemaType = z.infer<typeof LaboratorySchema>;

export const UpdateEquipmentSchema = z.object({
    laboratoryId: z.string().uuid("ID de laboratorio inválido").optional(),
    isActive: z.boolean().optional(),
});

export type UpdateEquipmentSchemaType = z.infer<typeof UpdateEquipmentSchema>;
