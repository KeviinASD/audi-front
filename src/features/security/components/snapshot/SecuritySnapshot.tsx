import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldOff,
    Wifi,
    WifiOff,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    User,
    Monitor,
    Lock,
    Eye,
    Key,
} from 'lucide-react';
import type { LocalUserInfo, SecuritySnapshotResponse } from '../../interfaces';

// ── helpers ──────────────────────────────────────────────────────────────────

function BoolRow({ label, value, invertColors = false }: { label: string; value: boolean; invertColors?: boolean }) {
    const isGood = invertColors ? !value : value;
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            {isGood
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                : <XCircle className="h-4 w-4 text-red-500" />}
        </div>
    );
}

function TextRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[55%] truncate">
                {value ?? <span className="text-gray-400 italic font-normal">N/A</span>}
            </span>
        </div>
    );
}

function Section({ title, icon: Icon, children, danger = false }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    danger?: boolean;
}) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-[#1F1F23] ${danger ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50/50 dark:bg-[#1F1F23]/50'}`}>
                <Icon className={`h-4 w-4 ${danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`text-sm font-semibold ${danger ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{title}</span>
            </div>
            <div className="px-4 py-1">{children}</div>
        </div>
    );
}

// ── LocalUsers table ──────────────────────────────────────────────────────────

function LocalUsersTable({ users }: { users: LocalUserInfo[] }) {
    if (!users || users.length === 0) {
        return <p className="text-sm text-gray-400 italic py-2">Sin usuarios locales registrados.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs mt-1 mb-1">
                <thead>
                    <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left py-1.5 font-medium">Usuario</th>
                        <th className="text-center py-1.5 font-medium">Admin</th>
                        <th className="text-center py-1.5 font-medium">Activo</th>
                        <th className="text-left py-1.5 font-medium">Último login</th>
                        <th className="text-center py-1.5 font-medium">Pass no expira</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.username} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                            <td className="py-1.5 font-mono text-gray-800 dark:text-gray-200">{u.username}</td>
                            <td className="py-1.5 text-center">
                                {u.isAdmin
                                    ? <Badge variant="outline" className="text-red-600 border-red-200 dark:border-red-800 text-[10px] px-1">Admin</Badge>
                                    : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="py-1.5 text-center">
                                {u.isEnabled
                                    ? <CheckCircle2 className="h-3 w-3 text-emerald-500 mx-auto" />
                                    : <XCircle className="h-3 w-3 text-gray-400 mx-auto" />}
                            </td>
                            <td className="py-1.5 text-gray-500">
                                {u.lastLogin
                                    ? new Date(u.lastLogin).toLocaleDateString()
                                    : <span className="italic text-gray-400">Nunca</span>}
                            </td>
                            <td className="py-1.5 text-center">
                                {u.passwordNeverExpires
                                    ? <AlertTriangle className="h-3 w-3 text-amber-500 mx-auto" />
                                    : <span className="text-gray-400">—</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── SecuritySnapshot ──────────────────────────────────────────────────────────

interface SecuritySnapshotProps {
    snapshot: SecuritySnapshotResponse;
}

export function SecuritySnapshot({ snapshot }: SecuritySnapshotProps) {
    const capturedDate = new Date(snapshot.capturedAt).toLocaleString();

    return (
        <div className="flex flex-col gap-4 py-3">
            {/* Risk banner */}
            {snapshot.hasSecurityRisk && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Este equipo tiene riesgos de seguridad activos.
                    </p>
                </div>
            )}

            <p className="text-xs text-gray-400 -mb-2">Capturado: {capturedDate}</p>

            {/* OS */}
            <Section title="Sistema Operativo" icon={Monitor}>
                <TextRow label="Nombre" value={snapshot.osName} />
                <TextRow label="Versión" value={snapshot.osVersion} />
                <TextRow label="Build" value={snapshot.osBuild} />
                <TextRow label="Arquitectura" value={snapshot.osArchitecture} />
            </Section>

            {/* Windows Update */}
            <Section
                title="Windows Update"
                icon={RefreshCw}
                danger={snapshot.isCriticalUpdatePending}
            >
                <TextRow
                    label="Última actualización"
                    value={snapshot.lastUpdateDate
                        ? new Date(snapshot.lastUpdateDate).toLocaleDateString()
                        : undefined}
                />
                <TextRow label="Días sin actualizar" value={snapshot.daysSinceLastUpdate} />
                <TextRow label="Actualizaciones pendientes" value={snapshot.pendingUpdatesCount} />
                <BoolRow label="Actualización crítica pendiente" value={snapshot.isCriticalUpdatePending} invertColors />
            </Section>

            {/* Antivirus */}
            <Section
                title="Antivirus"
                icon={snapshot.antivirusEnabled ? ShieldCheck : ShieldOff}
                danger={!snapshot.antivirusInstalled || !snapshot.antivirusEnabled}
            >
                <BoolRow label="Instalado" value={snapshot.antivirusInstalled} />
                <BoolRow label="Activo" value={snapshot.antivirusEnabled} />
                <TextRow label="Nombre" value={snapshot.antivirusName} />
                <TextRow label="Versión" value={snapshot.antivirusVersion} />
                <BoolRow label="Definiciones actualizadas" value={snapshot.antivirusDefinitionsUpdated} />
                <TextRow
                    label="Último escaneo"
                    value={snapshot.antivirusLastScanDate
                        ? new Date(snapshot.antivirusLastScanDate).toLocaleDateString()
                        : undefined}
                />
            </Section>

            {/* Firewall */}
            <Section
                title="Firewall"
                icon={snapshot.firewallEnabled ? Shield : ShieldOff}
                danger={!snapshot.firewallEnabled}
            >
                <BoolRow label="Firewall activo" value={snapshot.firewallEnabled} />
                <BoolRow label="Perfil Dominio" value={snapshot.firewallDomainEnabled} />
                <BoolRow label="Perfil Privado" value={snapshot.firewallPrivateEnabled} />
                <BoolRow label="Perfil Público" value={snapshot.firewallPublicEnabled} />
            </Section>

            {/* Password Policy */}
            <Section title="Política de Contraseñas" icon={Key}>
                <TextRow label="Longitud mínima" value={snapshot.passwordMinLength} />
                <TextRow label="Máx. antigüedad (días)" value={snapshot.passwordMaxAgeDays} />
                <TextRow label="Mín. antigüedad (días)" value={snapshot.passwordMinAgeDays} />
                <BoolRow label="Complejidad requerida" value={snapshot.passwordComplexityEnabled} />
                <TextRow label="Umbral de bloqueo de cuenta" value={snapshot.accountLockoutThreshold} />
            </Section>

            {/* Local Users */}
            <Section title="Usuarios Locales" icon={User}>
                <LocalUsersTable users={snapshot.localUsers ?? []} />
            </Section>

            {/* Login Info */}
            <Section title="Sesión e Inicio de Sesión" icon={Eye}>
                <TextRow label="Usuario actual" value={snapshot.currentLoggedUser} />
                <TextRow label="Último usuario" value={snapshot.lastLoggedUser} />
                <TextRow
                    label="Fecha último login"
                    value={snapshot.lastLoginDate
                        ? new Date(snapshot.lastLoginDate).toLocaleString()
                        : undefined}
                />
            </Section>

            {/* Security Flags */}
            <Section title="Configuración de Acceso" icon={Lock}>
                <BoolRow label="UAC activado" value={snapshot.uacEnabled} />
                <BoolRow label="RDP habilitado" value={snapshot.rdpEnabled} invertColors />
                <BoolRow label="Registro remoto habilitado" value={snapshot.remoteRegistryEnabled} invertColors />
            </Section>
        </div>
    );
}

export function SecuritySnapshotSkeleton() {
    return (
        <div className="flex flex-col gap-4 py-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
                    <Skeleton className="h-9 w-full" />
                    <div className="px-4 py-2 space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-4/5" />
                        <Skeleton className="h-6 w-3/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}
