'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: '首页概览', icon: '📊' },
  { href: '/campaigns', label: '推广管理', icon: '📢' },
  { href: '/analysis', label: '数据报表', icon: '📈' },
  { href: '/tasks', label: '任务中心', icon: '🎯' },
  { href: '/career', label: '成长路径', icon: '🏆' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 路由变化时关闭侧边栏
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  const navLinks = NAV_ITEMS.map(item => (
    <Link key={item.href} href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 my-0.5 rounded text-[13px] transition-colors ${
        isActive(item.href) ? 'bg-blue-600/70 text-white font-medium' : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="text-base w-5 text-center">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <>
      {/* 移动端汉堡按钮 */}
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-2 left-2 z-50 w-8 h-8 bg-[#1e2433] text-white rounded flex items-center justify-center text-sm">
        {open ? '✕' : '☰'}
      </button>

      {/* 移动端遮罩 */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}

      {/* 侧边栏 */}
      <aside className={`w-[200px] bg-[#1e2433] text-white flex flex-col h-screen fixed left-0 top-0 z-30 transition-transform duration-200 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">投</div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">投流高手</div>
            <div className="text-[10px] text-slate-400">AdMaster</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="text-[10px] text-slate-500 px-3 py-1.5 uppercase tracking-wider">工作台</div>
          {navLinks}
        </nav>

        <div className="px-4 py-3 border-t border-white/10">
          <div className="text-[10px] text-slate-500 mb-1">当前账户</div>
          <div className="text-xs text-slate-300">投流高手模拟器</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ID: ADS-2024-0001</div>
        </div>
      </aside>
    </>
  );
}
