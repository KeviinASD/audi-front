import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LaboratorySchema, type LaboratorySchemaType } from "../../schemas/equipos.schema";
import { useLaboratoryActions } from "../../hooks/useLaboratory";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LabFormProps {
    onSuccess?: () => void;
    initialData?: LaboratorySchemaType & { id: string };
}

export const LabForm = ({ onSuccess, initialData }: LabFormProps) => {
    const { createLaboratory, updateLaboratory } = useLaboratoryActions(onSuccess);

    const form = useForm<LaboratorySchemaType>({
        resolver: zodResolver(LaboratorySchema),
        defaultValues: initialData || {
            name: "",
            location: "",
            responsible: "",
            responsibleEmail: "",
        },
    });

    const onSubmit = async (data: LaboratorySchemaType) => {
        if (initialData?.id) {
            await updateLaboratory(initialData.id, data);
        } else {
            await createLaboratory(data);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Laboratorio</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Laboratorio A" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ubicación</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Pabellón H, 2do piso" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="responsible"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Responsable</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre del docente" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="responsibleEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Responsable</FormLabel>
                                <FormControl>
                                    <Input placeholder="email@unitru.edu.pe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        initialData?.id ? "Actualizar Laboratorio" : "Crear Laboratorio"
                    )}
                </Button>
            </form>
        </Form>
    );
};
