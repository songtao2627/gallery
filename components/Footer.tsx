import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 w-full pt-10 pb-6 px-4">
      <div className="mx-auto max-w-7xl rounded-[3rem] bg-white/80 backdrop-blur-sm border border-white px-8 py-12 md:px-12 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-2">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-md">
                  <span className="material-symbols-rounded text-xl">grain</span>
               </div>
               <span className="font-display text-3xl font-black text-slate-900 tracking-tight">灵机</span>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              InspiredJoy.cn<br/>
              数字创意的全新诠释。
            </p>
          </div>
          
          <div className="flex gap-16">
             <div>
               <h4 className="font-black text-slate-900 mb-4 uppercase text-xs tracking-widest">画廊</h4>
               <ul className="space-y-2 text-slate-500 font-bold text-sm">
                 <li><a href="#work" className="hover:text-fresh-cyan transition-colors">工作</a></li>
                 <li><a href="#life" className="hover:text-fresh-lime transition-colors">生活</a></li>
                 <li><a href="#learning" className="hover:text-fresh-teal transition-colors">学习</a></li>
                 <li><a href="#it" className="hover:text-fresh-lemon transition-colors">IT & 成长</a></li>
               </ul>
             </div>
             <div>
               <h4 className="font-black text-slate-900 mb-4 uppercase text-xs tracking-widest">连接</h4>
               <div className="flex gap-3">
                  <a href="#" className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:scale-110 hover:bg-slate-900 hover:text-white transition-all shadow-sm text-slate-600">
                    <span className="material-symbols-rounded">mail</span>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:scale-110 hover:bg-slate-900 hover:text-white transition-all shadow-sm text-slate-600">
                    <span className="material-symbols-rounded">public</span>
                  </a>
               </div>
             </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
           <p>© 2026 InspiredJoy. 版权所有。</p>
           <p className="bg-slate-50 px-3 py-1 rounded-full text-slate-500">京ICP备2026000333号</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;