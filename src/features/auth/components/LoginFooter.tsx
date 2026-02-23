import React from 'react';

export const LoginFooter: React.FC = () => {
    return (
        <footer className="relative z-30 w-full p-8 border-t border-white/5 bg-[#050a14]/50 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start space-y-1">
                    <p className="text-sm font-semibold text-white">Unidad de Tecnologías de Información (UTI)</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">© 2024 Universidad Nacional de Trujillo</p>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                        <span className="material-symbols-outlined text-[#C4A84C]" style={{ fontSize: '32px' }}>verified_user</span>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-white leading-none">CERTIFIED</p>
                            <p className="text-[10px] text-slate-400 leading-none">ISO/IEC 27001</p>
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                    <div className="flex items-center space-x-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                        <span className="material-symbols-outlined text-[#C4A84C]" style={{ fontSize: '32px' }}>shield</span>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-white leading-none">SECURE</p>
                            <p className="text-[10px] text-slate-400 leading-none">SSL ENCRYPTED</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
                    <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <a className="hover:text-white transition-colors" href="#">Security Terms</a>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <a className="hover:text-white transition-colors" href="#">Institutional Portal</a>
                </div>
            </div>
        </footer>
    );
};
