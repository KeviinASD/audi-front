import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EquipmentSchema, type EquipmentSchemaType } from '../../schemas/equipos.schema';
import { useEquipmentActions } from '../../hooks/useEquipment';
import { useLaboratories } from '../../hooks/useLaboratory';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface EquipmentFormProps {
    onSuccess?: () => void;
}

export const EquipmentForm = ({ onSuccess }: EquipmentFormProps) => {
    const { createEquipment } = useEquipmentActions(onSuccess);
    const { laboratories } = useLaboratories();

    const form = useForm<EquipmentSchemaType>({
        resolver: zodResolver(EquipmentSchema),
        defaultValues: {
            code: '',
            name: '',
            ubication: '',
        },
    });

    const onSubmit = async (data: EquipmentSchemaType) => {
        await createEquipment(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. LAB01-PC05" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. PC-05 Laboratorio 1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="ubication"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ubicación</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Puesto 5, fila 2" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="laboratoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Laboratorio</FormLabel>
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar laboratorio" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {laboratories.map((lab) => (
                                        <SelectItem key={lab.id} value={lab.id.toString()}>
                                            {lab.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        'Registrar Equipo'
                    )}
                </Button>
            </form>
        </Form>
    );
};
