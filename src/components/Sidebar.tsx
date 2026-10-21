import React from 'react';
import { 
  FolderKanban, 
  BarChart3, 
  CalendarDays, 
  RotateCcw, 
  Sparkles, 
  Target,
  Settings
} from 'lucide-react';
import { ActiveTab, Docket } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  dockets: Docket[];
  todayUrgentCount: number;
  yearlyTasksCount?: number;
  onResetData: () => void;
  onEnableNotifications?: () => void;
  notificationPermission?: NotificationPermission;
  onOpenSettings?: () => void;
  onOpenTemplateManager?: () => void;
  onOpenGitHubSync?: () => void;
  onOpenFontSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  dockets,
  todayUrgentCount,
  yearlyTasksCount = 0,
  onResetData,
  onOpenSettings,
  onOpenFontSettings,
}) => {
  const totalDockets = dockets.length;

  const handleOpenSettings = onOpenSettings || onOpenFontSettings;

  return (
    <aside className="w-64 shrink-0 bg-[#0B0F19]/95 backdrop-blur-md border-r border-slate-800/90 flex flex-col justify-between h-full sticky top-0 select-none text-slate-300 z-20">
      {/* CSS selector 1: Fixed Navigation & Quick Tools Container */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto sticky top-0 overscroll-contain scrollbar-none">
        {/* Main Navigation */}
        <div className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
            <span>Điều hành & Giám sát</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>

          <button
            onClick={() => onSelectTab('today')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'today'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Bàn làm việc hôm nay</span>
            </div>
            {todayUrgentCount > 0 && (
              <span className={`px-2 py-0.5 text-[11px] font-mono tabular-nums font-bold rounded-lg ${
                activeTab === 'today'
                  ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50 shadow-xs'
                  : 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}>
                {todayUrgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('dockets')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'dockets'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'dockets'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <FolderKanban className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Kho hồ sơ công việc</span>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-slate-400 bg-slate-900/90 border border-slate-800 rounded-lg font-bold">
              {totalDockets}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('yearly')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'yearly'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'yearly'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Nhiệm vụ trọng tâm</span>
            </div>
            {yearlyTasksCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-indigo-300 bg-indigo-950/80 border border-indigo-800/80 rounded-lg font-bold">
                {yearlyTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Biểu đồ & Thống kê</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <CalendarDays className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Lịch biểu công việc</span>
            </div>
          </button>
        </div>

        {/* CSS selector 1: Quick Settings & Utilities Container */}
        <div className="pt-4 border-t border-slate-800/90 space-y-2">
          <div className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
            <span>Tiện ích & Cài đặt</span>
            <Settings className="w-3 h-3 text-slate-500" />
          </div>

          {/* Unified Settings Button with Gear Icon */}
          <button
            onClick={handleOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900/70 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-left group shadow-xs cursor-pointer active:scale-98"
            title="Cài đặt hệ thống: Cỡ chữ, Phông Times New Roman, Xuất lịch .ics, Desktop App & Tiện ích"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/60 text-blue-400 flex items-center justify-center shrink-0 group-hover:rotate-90 group-hover:text-blue-300 group-hover:border-blue-500/50 transition-all duration-300 shadow-2xs">
                <Settings className="w-4 h-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="leading-tight font-bold text-slate-100 group-hover:text-white">Cài đặt</span>
                <span className="text-[10px] text-slate-400">Cỡ chữ, phông & tiện ích</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded-md font-serif">
                TNR
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Profile & Storage Reset */}
      <div className="p-3.5 border-t border-slate-800/90 bg-slate-900/60">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs shrink-0">
              VT
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate">
                Vũ Văn Thành
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Chuyên viên quản lý
              </span>
            </div>
          </div>
          <button
            onClick={onResetData}
            title="Khôi phục lại dữ liệu mẫu"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
