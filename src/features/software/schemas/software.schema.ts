import { z } from 'zod';

export const AuthorizedSoftwareSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    publisher: z.string().optional(),
    description: z.string().optional(),
    laboratoryId: z.number().int().positive().optional(),
});

export type AuthorizedSoftwareSchemaType = z.infer<typeof AuthorizedSoftwareSchema>;
