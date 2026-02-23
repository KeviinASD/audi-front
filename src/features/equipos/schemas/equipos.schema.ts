import { z } from "zod";

export const LaboratorySchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    location: z.string().optional(),
    responsible: z.string().optional(),
    responsibleEmail: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
});

export type LaboratorySchemaType = z.infer<typeof LaboratorySchema>;

export const EquipmentSchema = z.object({
    code: z.string().min(1, "El código es requerido"),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    ubication: z.string().optional(),
    laboratoryId: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
});

export type EquipmentSchemaType = z.infer<typeof EquipmentSchema>;
