import { EquipmentTable } from "../components/equipos/EquipmentTable";
import { Monitor, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EquiposPage() {
    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Monitor className="h-8 w-8 text-primary" />
                        Catálogo de Equipos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Listado de máquinas registradas y auditadas por el sistema.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por hostname o IP..."
                            className="pl-10 bg-white dark:bg-[#16161a] border-gray-200 dark:border-[#1F1F23]"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="border-gray-200 dark:border-[#1F1F23]">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Online</div>
                    <div className="text-2xl font-bold mt-1">24</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Alertas Activas</div>
                    <div className="text-2xl font-bold mt-1">3</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-red-50/50 dark:bg-red-900/10">
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">Críticos</div>
                    <div className="text-2xl font-bold mt-1">1</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <EquipmentTable />
            </div>
        </div>
    );
}
