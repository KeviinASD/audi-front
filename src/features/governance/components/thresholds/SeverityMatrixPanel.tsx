import { Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeverityMatrix } from '../../hooks/useGovernanceThresholds';
import { SEVERITY_STYLES } from '../../lib/threshold-display';

/**
 * Muestra el criterio humano que define cuándo un hallazgo es crítico, alto,
 * medio o bajo. Antes ese criterio lo aplicaba el modelo de IA por su cuenta.
 */
export const SeverityMatrixPanel = () => {
    const { matrix, loading } = useSeverityMatrix();

    if (loading && matrix.length === 0) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-[#1F1F23]">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    Criterio de severidad
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Define qué hace que un hallazgo sea crítico, alto, medio o bajo. Este criterio
                    lo fija el auditor: no lo decide el modelo de IA por su cuenta.
                </p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-[#1F1F23]">
                {matrix.map((entry) => {
                    const style = SEVERITY_STYLES[entry.severity];
                    return (
                        <div key={entry.severity} className="px-5 py-4 flex flex-col sm:flex-row gap-3">
                            <div className="sm:w-28 shrink-0 flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                    {entry.label}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {entry.criterion}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    <span className="uppercase tracking-wider">Ejemplos: </span>
                                    {entry.examples}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
