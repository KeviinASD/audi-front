import { LabTable } from "../components/labs/LabTable";
import { LabForm } from "../components/labs/LabForm";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useLaboratories } from "../hooks/useLaboratory";

export default function LabsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { laboratories, loading, refetch } = useLaboratories();

    const handleSuccess = () => {
        setIsDialogOpen(false);
        refetch();
    };

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-primary" />
                        Gestión de Laboratorios
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Administra las salas y laboratorios de la Escuela de Ingeniería de Sistemas.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Laboratorio
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Registrar Laboratorio</DialogTitle>
                            <DialogDescription>
                                Completa los datos para el nuevo laboratorio o sala de cómputo.
                            </DialogDescription>
                        </DialogHeader>
                        <LabForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <LabTable laboratories={laboratories} loading={loading} />
            </div>
        </div>
    );
}
