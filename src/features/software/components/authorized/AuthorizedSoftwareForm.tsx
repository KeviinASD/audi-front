import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthorizedSoftwareSchema, type AuthorizedSoftwareSchemaType } from '../../schemas/software.schema';
import { useAuthorizedSoftwareActions } from '../../hooks/useAuthorizedSoftware';
import { useLaboratories } from '@/features/equipos/hooks/useLaboratory';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AuthorizedSoftwareFormProps {
    onSuccess?: () => void;
}

export const AuthorizedSoftwareForm = ({ onSuccess }: AuthorizedSoftwareFormProps) => {
    const { addToWhitelist } = useAuthorizedSoftwareActions(onSuccess);
    const { laboratories } = useLaboratories();

    const form = useForm<AuthorizedSoftwareSchemaType>({
        resolver: zodResolver(AuthorizedSoftwareSchema),
        defaultValues: {
            name: '',
            publisher: '',
            description: '',
        },
    });

    const onSubmit = async (data: AuthorizedSoftwareSchemaType) => {
        await addToWhitelist(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del software</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Python 3.11" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="publisher"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Publisher</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Python Software Foundation" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Motivo de autorización o notas adicionales..."
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                />
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
                                onValueChange={(val) =>
                                    field.onChange(val === 'global' ? undefined : Number(val))
                                }
                                value={field.value?.toString() ?? 'global'}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar alcance" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="global">Global (todos los laboratorios)</SelectItem>
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
                            Autorizando...
                        </>
                    ) : (
                        'Autorizar Software'
                    )}
                </Button>
            </form>
        </Form>
    );
};
