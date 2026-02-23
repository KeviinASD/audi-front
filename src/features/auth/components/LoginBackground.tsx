import { Image } from '@/components/ui/image';

export const LoginBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/95 via-[#050a14]/90 to-[#050a14] z-10">
            </div>
            <Image
                alt="Universidad Nacional de Trujillo Campus"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFd5OSf_imRyHVp3K4OhciaxZg0nTDkt4OW21sMyZ5k1AN3F4T1d2MNFHtEggVL-uwAwVKm5Ihd_Nlm9lZufPVHa0tOTLy9jLphoi38b20O-MVze7uxj2BqDJI9jts5QLKLvIDyEx9Nk2szW00NzGb_PYpORMwPPN19CBFDa_l6p11fu-67jMfnRu4yOZNwQ3fSrqnlKbbMYTBE9stBw0ilYzjRhX4Lz3Zz3g3r8CWnn9gW1qCP424nTCGYT4P9HYgAOrvYk6GyCpO"
                containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-pattern z-20"></div>
        </div>
    );
};
