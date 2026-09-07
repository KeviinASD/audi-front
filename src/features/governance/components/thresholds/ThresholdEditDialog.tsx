import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import type { GovernanceThresholdResponse, ThresholdSeverity } from '../../interfaces';
import { useGovernanceThresholdActions } from '../../hooks/useGovernanceThresholds';
import { SEVERITY_STYLES } from '../../lib/threshold-display';

interface ThresholdEditDialogProps {
    threshold: GovernanceThresholdResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const SEVERITIES: ThresholdSeverity[] = ['low', 'medium', 'high', 'critical'];

export const ThresholdEditDialog = ({
    threshold,
    open,
    onOpenChange,
    onSuccess,
}: ThresholdEditDialogProps) => {
    const { updateThreshold, loading } = useGovernanceThresholdActions(onSuccess);

    const [value, setValue] = useState('');
    const [severity, setSeverity] = useState<ThresholdSeverity>('medium');
    const [rationale, setRationale] = useState('');

    useEffect(() => {
        if (threshold) {
            setValue(threshold.value ?? '');
            setSeverity(threshold.severityOnBreach);
            setRationale(threshold.rationale);
        }
    }, [threshold]);

    if (!threshold) return null;

    const takesValue = !['is_true', 'is_false'].includes(threshold.operator);

    const handleSubmit = async () => {
        await updateThreshold(threshold.id, {
            ...(takesValue ? { value } : {}),
            severityOnBreach: severity,
            rationale,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                    <DialogTitle>Ajustar umbral</DialogTitle>
                    <DialogDescription>
                        {threshold.code} — {threshold.label}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {takesValue && (
                        <div className="space-y-2">
                            <Label htmlFor="threshold-value">
                                Valor aceptado {threshold.unit ? `(${threshold.unit})` : ''}
                            </Label>
                            <Input
                                id="threshold-value"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="30"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="threshold-severity">Severidad al incumplirse</Label>
                        <Select
                            value={severity}
                            onValueChange={(v) => setSeverity(v as ThresholdSeverity)}
                        >
                            <SelectTrigger id="threshold-severity">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SEVERITIES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        <span className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${SEVERITY_STYLES[s].dot}`} />
                                            {SEVERITY_STYLES[s].label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="threshold-rationale">
                            Justificación — ¿por qué ese valor?
                        </Label>
                        <Textarea
                            id="threshold-rationale"
                            value={rationale}
                            onChange={(e) => setRationale(e.target.value)}
                            rows={4}
                            placeholder="El fundamento técnico o normativo del valor elegido."
                        />
                        <p className="text-xs text-gray-500">
                            Esto es lo que se defiende ante el auditor. Un número sin justificación
                            no es una política.
                        </p>
                    </div>

                    <div className="flex gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10 p-3">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-400">
                            Cambiar el valor o la severidad <strong>revoca la aprobación vigente</strong>.
                            El umbral queda como propuesta hasta que se apruebe otra vez.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Guardando…' : 'Guardar cambios'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
