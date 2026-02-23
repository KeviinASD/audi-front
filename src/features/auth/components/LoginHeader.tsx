import { Image } from '@/components/ui/image';

export const LoginHeader: React.FC = () => {
    return (
        <div className="p-8 pb-4 text-center">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white rounded-full p-2 flex items-center justify-center shadow-lg">
                    <Image
                        alt="Logo UNT"
                        src="/logo.png"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                Sistema de Auditoría de Seguridad
            </h1>
            <p className="text-[#C4A84C] font-medium text-sm tracking-widest uppercase">
                Universidad Nacional de Trujillo
            </p>
        </div>
    );
};
