import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import type { GovernanceThresholdResponse } from '../../interfaces';
import { useGovernanceThresholdActions } from '../../hooks/useGovernanceThresholds';
import { formatThresholdValue } from '../../lib/threshold-display';

interface ThresholdApproveDialogProps {
    threshold: GovernanceThresholdResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const ThresholdApproveDialog = ({
    threshold,
    open,
    onOpenChange,
    onSuccess,
}: ThresholdApproveDialogProps) => {
    const { approveThreshold, loading } = useGovernanceThresholdActions(onSuccess);
    const [approvedBy, setApprovedBy] = useState('');

    if (!threshold) return null;

    const handleSubmit = async () => {
        if (!approvedBy.trim()) return;
        const ok = await approveThreshold(threshold.id, approvedBy.trim());
        if (ok) setApprovedBy('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Aprobar umbral</DialogTitle>
                    <DialogDescription>
                        Aprobar es el acto de gobierno: alguien con autoridad declara que este
                        valor es el aceptable para la organización.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 dark:border-[#2a2a30] bg-gray-50/60 dark:bg-[#1F1F23]/50 p-4">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                            {threshold.code}
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {threshold.label}
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Valor aceptado:{' '}
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                {formatThresholdValue(threshold)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="approved-by">Nombre y cargo de quien aprueba</Label>
                        <Input
                            id="approved-by"
                            value={approvedBy}
                            onChange={(e) => setApprovedBy(e.target.value)}
                            placeholder="Ej. Kevin Rivas — Responsable de TI"
                        />
                        <p className="text-xs text-gray-500">
                            Queda registrado con fecha y hora. Es la evidencia de EDM01:
                            quién decidió qué, y cuándo.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !approvedBy.trim()}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        {loading ? 'Aprobando…' : 'Aprobar umbral'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
