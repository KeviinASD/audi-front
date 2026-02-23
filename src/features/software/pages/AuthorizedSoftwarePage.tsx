import { useState } from 'react';
import { AuthorizedSoftwareTable } from '../components/authorized/AuthorizedSoftwareTable';
import { AuthorizedSoftwareForm } from '../components/authorized/AuthorizedSoftwareForm';
import { useAuthorizedSoftware } from '../hooks/useAuthorizedSoftware';
import { ShieldCheck, Plus, Globe, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function AuthorizedSoftwarePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { authorizedSoftware, loading, refetch } = useAuthorizedSoftware();

    const handleSuccess = () => {
        setIsDialogOpen(false);
        refetch();
    };

    const globalCount     = authorizedSoftware.filter(s => !s.laboratoryId).length;
    const specificCount   = authorizedSoftware.filter(s => !!s.laboratoryId).length;

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        Software Autorizado
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Lista blanca de software permitido en los laboratorios.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" />
                            Autorizar Software
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px]">
                        <DialogHeader>
                            <DialogTitle>Autorizar Software</DialogTitle>
                            <DialogDescription>
                                Agrega un software a la lista blanca. Si no seleccionas laboratorio, aplica a todos.
                            </DialogDescription>
                        </DialogHeader>
                        <AuthorizedSoftwareForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total autorizado</div>
                    <div className="text-2xl font-bold mt-1">{authorizedSoftware.length}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-blue-50/50 dark:bg-blue-900/10">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Alcance global
                    </div>
                    <div className="text-2xl font-bold mt-1">{globalCount}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-violet-50/50 dark:bg-violet-900/10">
                    <div className="text-sm font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        Por laboratorio
                    </div>
                    <div className="text-2xl font-bold mt-1">{specificCount}</div>
                </div>
            </div>

            <AuthorizedSoftwareTable
                authorizedSoftware={authorizedSoftware}
                loading={loading}
            />
        </div>
    );
}
