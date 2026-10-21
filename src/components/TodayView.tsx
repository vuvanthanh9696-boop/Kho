import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  Filter, 
  Check, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderKanban,
  ListTodo,
  RotateCcw,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Docket, DocketStep, PRIORITY_CONFIG, DOCKET_STATUS_CONFIG } from '../types';
import { getGoogleCalendarUrl } from '../utils/calendarSync';

interface TodayTaskItem {
  docket: Docket;
  step: DocketStep;
  isOverdue: boolean;
  isDueToday: boolean;
  isUpcoming: boolean;
  diffDays: number;
}

interface GroupedDocketItem {
  docket: Docket;
  tasks: TodayTaskItem[];
  overdueTasks: TodayTaskItem[];
  todayTasks: TodayTaskItem[];
  upcomingTasks: TodayTaskItem[];
  completedTasks: TodayTaskItem[];
}

interface TodayViewProps {
  dockets: Docket[];
  onToggleStepStatus: (docketId: string, stepId: string) => void;
  onOpenDocketDetail: (docket: Docket) => void;
  onOpenCreateModal: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  dockets,
  onToggleStepStatus,
  onOpenDocketDetail,
  onOpenCreateModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'completed'>('all');
  const [viewBy, setViewBy] = useState<'dockets' | 'tasks'>('dockets');
  const [expandedDocketIds, setExpandedDocketIds] = useState<Set<string>>(new Set());

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date(todayStr).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Flatten and calculate all tasks with deadlines
  const allTasks: TodayTaskItem[] = [];

  dockets.forEach((docket) => {
    docket.steps.forEach((step) => {
      if (!step.dueDate) return;
      const stepTime = new Date(step.dueDate).getTime();
      const diffDays = Math.round((stepTime - nowTime) / oneDayMs);

      const isOverdue = step.status !== 'completed' && diffDays < 0;
      const isDueToday = diffDays === 0;
      const isUpcoming = step.status !== 'completed' && diffDays > 0 && diffDays <= 2;

      allTasks.push({
        docket,
        step,
        isOverdue,
        isDueToday,
        isUpcoming,
        diffDays,
      });
    });
  });

  const overdueCount = allTasks.filter((t) => t.isOverdue).length;
  const dueTodayCount = allTasks.filter((t) => t.isDueToday && t.step.status !== 'completed').length;
  const upcomingCount = allTasks.filter((t) => t.isUpcoming).length;
  const completedTodayCount = allTasks.filter((t) => {
    if (t.step.status !== 'completed') return false;
    if (!t.step.completedAt) return false;
    return t.step.completedAt.startsWith(todayStr);
  }).length;

  // Unique dockets counts for each warning group (only unprocessed dockets)
  const overdueDocketsCount = useMemo(() => {
    const docketIds = new Set<string>();
    dockets.forEach((d) => {
      if (d.status === 'completed') return;
      if (d.status === 'delayed' || (d.dueDate && d.dueDate < todayStr)) {
        docketIds.add(d.id);
      } else if (d.steps.some((s) => s.status !== 'completed' && s.dueDate && s.dueDate < todayStr)) {
        docketIds.add(d.id);
      }
    });
    return docketIds.size;
  }, [dockets, todayStr]);

  const dueTodayDocketsCount = useMemo(() => {
    const docketIds = new Set<string>();
    dockets.forEach((d) => {
      if (d.status === 'completed') return;
      if (d.status === 'delayed' || (d.dueDate && d.dueDate < todayStr)) return;
      if (d.steps.some((s) => s.status !== 'completed' && s.dueDate && s.dueDate < todayStr)) return;
      if (d.dueDate === todayStr || d.steps.some((s) => s.status !== 'completed' && s.dueDate === todayStr)) {
        docketIds.add(d.id);
      }
    });
    return docketIds.size;
  }, [dockets, todayStr]);

  const upcomingDocketsCount = useMemo(() => {
    const docketIds = new Set<string>();
    dockets.forEach((d) => {
      if (d.status === 'completed') return;
      if (d.status === 'delayed' || (d.dueDate && d.dueDate <= todayStr)) return;
      if (d.steps.some((s) => s.status !== 'completed' && s.dueDate && s.dueDate <= todayStr)) return;
      const dTime = d.dueDate ? new Date(d.dueDate).getTime() : 0;
      const diffDays = dTime ? Math.round((dTime - nowTime) / oneDayMs) : 999;
      if (diffDays > 0 && diffDays <= 2) {
        docketIds.add(d.id);
      } else if (
        d.steps.some((s) => {
          if (s.status === 'completed' || !s.dueDate) return false;
          const sTime = new Date(s.dueDate).getTime();
          const sDiff = Math.round((sTime - nowTime) / oneDayMs);
          return sDiff > 0 && sDiff <= 2;
        })
      ) {
        docketIds.add(d.id);
      }
    });
    return docketIds.size;
  }, [dockets, todayStr, nowTime]);

  const completedTodayDocketsCount = useMemo(() => {
    const docketIds = new Set<string>();
    dockets.forEach((d) => {
      if (d.status === 'completed' && d.completedAt?.startsWith(todayStr)) {
        docketIds.add(d.id);
      } else if (d.steps.some((s) => s.status === 'completed' && s.completedAt?.startsWith(todayStr))) {
        docketIds.add(d.id);
      }
    });
    return docketIds.size;
  }, [dockets, todayStr]);

  // Handler for clicking on KPI warning cards (toggle on/off)
  const handleKpiClick = (type: 'overdue' | 'today' | 'upcoming' | 'completed') => {
    if (filterType === type) {
      setFilterType('all');
    } else {
      setFilterType(type);
    }
  };

  const toggleDocketExpand = (docketId: string) => {
    setExpandedDocketIds((prev) => {
      const next = new Set(prev);
      if (next.has(docketId)) next.delete(docketId);
      else next.add(docketId);
      return next;
    });
  };

  // Filter tasks based on selected tab
  const filteredTasks = allTasks.filter((item) => {
    if (filterType === 'overdue') return item.isOverdue;
    if (filterType === 'today') return item.isDueToday && item.step.status !== 'completed';
    if (filterType === 'upcoming') return item.isUpcoming;
    if (filterType === 'completed') {
      return item.step.status === 'completed';
    }
    // 'all' shows active tasks: overdue + today + upcoming, plus completed today
    return item.isOverdue || item.isDueToday || item.isUpcoming || (item.step.status === 'completed' && item.step.completedAt?.startsWith(todayStr));
  });

  // Sort by priority and urgency
  filteredTasks.sort((a, b) => {
    if (a.step.status === 'completed' && b.step.status !== 'completed') return 1;
    if (a.step.status !== 'completed' && b.step.status === 'completed') return -1;
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    const pWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    const pDiff = (pWeight[b.step.priority] || 1) - (pWeight[a.step.priority] || 1);
    if (pDiff !== 0) return pDiff;
    return a.diffDays - b.diffDays;
  });

  // Group filtered tasks by parent Docket
  const groupedDockets: GroupedDocketItem[] = useMemo(() => {
    const targetDocketIds = new Set<string>();

    if (filterType === 'overdue') {
      dockets.forEach((d) => {
        if (d.status === 'completed') return;
        if (d.status === 'delayed' || (d.dueDate && d.dueDate < todayStr)) {
          targetDocketIds.add(d.id);
        } else if (d.steps.some((s) => s.status !== 'completed' && s.dueDate && s.dueDate < todayStr)) {
          targetDocketIds.add(d.id);
        }
      });
    } else if (filterType === 'today') {
      dockets.forEach((d) => {
        if (d.status === 'completed') return;
        if (d.status === 'delayed' || (d.dueDate && d.dueDate < todayStr)) return;
        if (d.steps.some((s) => s.status !== 'completed' && s.dueDate && s.dueDate < todayStr)) return;
        if (d.dueDate === todayStr || d.steps.some((s) => s.status !== 'completed' && s.dueDate === todayStr)) {
          targetDocketIds.add(d.id);
        }
      });
    } else if (filterType === 'upcoming') {
      dockets.forEach((d) => {
        if (d.status === 'completed') return;
        if (d.status === 'delayed' || (d.dueDate && d.dueDate <= todayStr)) return;
        if (d.steps.some((s) => s.status !== 'completed' && s.dueDate && s.dueDate <= todayStr)) return;
        const dTime = d.dueDate ? new Date(d.dueDate).getTime() : 0;
        const diffDays = dTime ? Math.round((dTime - nowTime) / oneDayMs) : 999;
        if (diffDays > 0 && diffDays <= 2) {
          targetDocketIds.add(d.id);
        } else if (
          d.steps.some((s) => {
            if (s.status === 'completed' || !s.dueDate) return false;
            const sTime = new Date(s.dueDate).getTime();
            const sDiff = Math.round((sTime - nowTime) / oneDayMs);
            return sDiff > 0 && sDiff <= 2;
          })
        ) {
          targetDocketIds.add(d.id);
        }
      });
    } else if (filterType === 'completed') {
      dockets.forEach((d) => {
        if (d.status === 'completed' && d.completedAt?.startsWith(todayStr)) {
          targetDocketIds.add(d.id);
        } else if (d.steps.some((s) => s.status === 'completed' && s.completedAt?.startsWith(todayStr))) {
          targetDocketIds.add(d.id);
        }
      });
    } else {
      // 'all': overdue + due today + upcoming + completed today
      dockets.forEach((d) => {
        if (d.status === 'completed') {
          if (d.completedAt?.startsWith(todayStr) || d.steps.some((s) => s.status === 'completed' && s.completedAt?.startsWith(todayStr))) {
            targetDocketIds.add(d.id);
          }
          return;
        }
        if (d.status === 'delayed' || (d.dueDate && d.dueDate <= todayStr)) {
          targetDocketIds.add(d.id);
          return;
        }
        const dTime = d.dueDate ? new Date(d.dueDate).getTime() : 0;
        const diffDays = dTime ? Math.round((dTime - nowTime) / oneDayMs) : 999;
        if (diffDays <= 2) {
          targetDocketIds.add(d.id);
          return;
        }
        if (
          d.steps.some((s) => {
            if (s.status === 'completed') return s.completedAt?.startsWith(todayStr);
            if (!s.dueDate) return false;
            const sDiff = Math.round((new Date(s.dueDate).getTime() - nowTime) / oneDayMs);
            return sDiff <= 2;
          })
        ) {
          targetDocketIds.add(d.id);
        }
      });
    }

    const result: GroupedDocketItem[] = [];
    dockets.forEach((docket) => {
      if (!targetDocketIds.has(docket.id)) return;
      const tasks = allTasks.filter((t) => t.docket.id === docket.id);
      const overdueTasks = tasks.filter((t) => t.isOverdue);
      const todayTasks = tasks.filter((t) => t.isDueToday && t.step.status !== 'completed');
      const upcomingTasks = tasks.filter((t) => t.isUpcoming);
      const completedTasks = tasks.filter((t) => t.step.status === 'completed');

      result.push({
        docket,
        tasks,
        overdueTasks,
        todayTasks,
        upcomingTasks,
        completedTasks,
      });
    });

    return result.sort((a, b) => {
      if (a.overdueTasks.length > 0 && b.overdueTasks.length === 0) return -1;
      if (a.overdueTasks.length === 0 && b.overdueTasks.length > 0) return 1;
      const pWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pWeight[b.docket.priority] || 1) - (pWeight[a.docket.priority] || 1);
    });
  }, [dockets, allTasks, filterType, todayStr, nowTime]);

  const filterLabels: Record<string, { title: string; color: string; badgeBg: string }> = {
    all: { title: 'Tất cả trọng tâm', color: 'text-slate-300', badgeBg: 'bg-slate-800' },
    overdue: { title: 'Quá hạn xử lý', color: 'text-rose-400', badgeBg: 'bg-rose-950 border-rose-800' },
    today: { title: 'Hạn trong ngày', color: 'text-amber-400', badgeBg: 'bg-amber-950 border-amber-800' },
    upcoming: { title: 'Sắp tới hạn (48h)', color: 'text-blue-400', badgeBg: 'bg-blue-950 border-blue-800' },
    completed: { title: 'Đã hoàn thành', color: 'text-emerald-400', badgeBg: 'bg-emerald-950 border-emerald-800' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Bàn làm việc hôm nay
            </h1>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-md tabular-nums font-semibold">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Thêm hồ sơ công việc
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip - Compact 3D Tactile Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* KPI 1: Overdue (CSS selector 1) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('overdue')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick('overdue');
            }
          }}
          title={filterType === 'overdue' ? 'Bấm lại để hủy lọc' : 'Nhấn để lọc hồ sơ quá hạn'}
          className={`card-3d-interactive p-3.5 sm:p-4 rounded-xl sm:rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-200 select-none ${
            filterType === 'overdue'
              ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-slate-950 border-rose-500/90 bg-rose-950/40 shadow-[0_8px_20px_rgba(244,63,94,0.3)] -translate-y-0.5'
              : 'border-slate-800/90 hover:border-rose-500/60 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(244,63,94,0.18)] active:translate-y-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-rose-300 uppercase tracking-wider truncate">
              Quá hạn xử lý
            </span>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              filterType === 'overdue'
                ? 'bg-rose-500/30 border border-rose-400 text-rose-300 scale-105 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-rose-500/20 border border-rose-500/30 text-rose-400 group-hover:scale-105'
            }`}>
              <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-400 drop-shadow-xs">
              {overdueDocketsCount}
            </span>
            <span className="text-xs text-rose-300/70 font-medium">hồ sơ</span>
          </div>
          <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600 ${filterType === 'overdue' ? 'opacity-100' : 'opacity-70'}`} />
        </div>

        {/* KPI 2: Due Today (CSS selector 2) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('today')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick('today');
            }
          }}
          title={filterType === 'today' ? 'Bấm lại để hủy lọc' : 'Nhấn để lọc hồ sơ đến hạn hôm nay'}
          className={`card-3d-interactive p-3.5 sm:p-4 rounded-xl sm:rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-200 select-none ${
            filterType === 'today'
              ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950 border-amber-500/90 bg-amber-950/40 shadow-[0_8px_20px_rgba(245,158,11,0.3)] -translate-y-0.5'
              : 'border-slate-800/90 hover:border-amber-500/60 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(245,158,11,0.18)] active:translate-y-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider truncate">
              Hạn trong ngày
            </span>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              filterType === 'today'
                ? 'bg-amber-500/30 border border-amber-400 text-amber-300 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-amber-500/20 border border-amber-500/30 text-amber-400 group-hover:scale-105'
            }`}>
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-400 drop-shadow-xs">
              {dueTodayDocketsCount}
            </span>
            <span className="text-xs text-amber-300/70 font-medium">hồ sơ</span>
          </div>
          <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 ${filterType === 'today' ? 'opacity-100' : 'opacity-70'}`} />
        </div>

        {/* KPI 3: Upcoming (CSS selector 3) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('upcoming')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick('upcoming');
            }
          }}
          title={filterType === 'upcoming' ? 'Bấm lại để hủy lọc' : 'Nhấn để lọc hồ sơ sắp đến hạn'}
          className={`card-3d-interactive p-3.5 sm:p-4 rounded-xl sm:rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-200 select-none ${
            filterType === 'upcoming'
              ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 border-blue-500/90 bg-blue-950/40 shadow-[0_8px_20px_rgba(59,130,246,0.3)] -translate-y-0.5'
              : 'border-slate-800/90 hover:border-blue-500/60 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(59,130,246,0.18)] active:translate-y-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-blue-300 uppercase tracking-wider truncate">
              Sắp đến hạn (48h)
            </span>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              filterType === 'upcoming'
                ? 'bg-blue-500/30 border border-blue-400 text-blue-300 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 group-hover:scale-105'
            }`}>
              <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-blue-400 drop-shadow-xs">
              {upcomingDocketsCount}
            </span>
            <span className="text-xs text-blue-300/70 font-medium">hồ sơ</span>
          </div>
          <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 ${filterType === 'upcoming' ? 'opacity-100' : 'opacity-70'}`} />
        </div>

        {/* KPI 4: Done Today (CSS selector 4) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('completed')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick('completed');
            }
          }}
          title={filterType === 'completed' ? 'Bấm lại để hủy lọc' : 'Nhấn để lọc hồ sơ đã xong'}
          className={`card-3d-interactive p-3.5 sm:p-4 rounded-xl sm:rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-200 select-none ${
            filterType === 'completed'
              ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 border-emerald-500/90 bg-emerald-950/40 shadow-[0_8px_20px_rgba(16,185,129,0.3)] -translate-y-0.5'
              : 'border-slate-800/90 hover:border-emerald-500/60 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.18)] active:translate-y-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider truncate">
              Đã xong hôm nay
            </span>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              filterType === 'completed'
                ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 group-hover:scale-105'
            }`}>
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-400 drop-shadow-xs">
              {completedTodayDocketsCount}
            </span>
            <span className="text-xs text-emerald-300/70 font-medium">hồ sơ</span>
          </div>
          <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 ${filterType === 'completed' ? 'opacity-100' : 'opacity-70'}`} />
        </div>
      </div>

      {/* Active Filter Notice Bar & View Switcher */}
      <div className="card-3d p-3.5 md:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800/90">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Đang lọc:
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${filterLabels[filterType]?.badgeBg} ${filterLabels[filterType]?.color}`}>
            {filterLabels[filterType]?.title}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            ({groupedDockets.length} hồ sơ)
          </span>
          {filterType !== 'all' && (
            <button
              onClick={() => setFilterType('all')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors ml-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xem tất cả</span>
            </button>
          )}
        </div>

        {/* View switcher: By Docket vs By Task */}
        <div className="flex items-center gap-1.5 p-1 inner-groove rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewBy('dockets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
              viewBy === 'dockets'
                ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Theo Hồ sơ ({groupedDockets.length})</span>
          </button>
          <button
            onClick={() => setViewBy('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
              viewBy === 'tasks'
                ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Theo từng Nhiệm vụ ({filteredTasks.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Grouped By Docket or By Individual Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="card-3d p-12 text-center rounded-3xl border border-slate-800/80">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">
            Không có hồ sơ nào thuộc nhóm "{filterLabels[filterType]?.title}"
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            Tất cả các hồ sơ đã được xử lý xong hoặc đang nằm trong thời hạn an toàn.
          </p>
          {filterType !== 'all' && (
            <button
              onClick={() => setFilterType('all')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xem lại toàn bộ hồ sơ trọng tâm</span>
            </button>
          )}
        </div>
      ) : viewBy === 'dockets' ? (
        /* ========================================================================= */
        /* VIEW 1: GROUPED BY DOCKET (Hiển thị trực quan danh sách hồ sơ thuộc nhóm) */
        /* ========================================================================= */
        <div className="space-y-4">
          {groupedDockets.map(({ docket, tasks, overdueTasks, todayTasks, upcomingTasks, completedTasks }) => {
            const totalSteps = docket.steps.length;
            const doneSteps = docket.steps.filter((s) => s.status === 'completed').length;
            const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
            const priorityConfig = PRIORITY_CONFIG[docket.priority] || PRIORITY_CONFIG.medium;
            const statusConfig = DOCKET_STATUS_CONFIG[docket.status] || DOCKET_STATUS_CONFIG.pending;
            const isExpanded = expandedDocketIds.has(docket.id);

            const hasOverdue = overdueTasks.length > 0;
            const hasToday = todayTasks.length > 0;

            return (
              <div
                key={docket.id}
                className={`card-3d-interactive rounded-2xl overflow-hidden transition-all border ${
                  hasOverdue
                    ? 'border-rose-500/50 bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-900/95 shadow-[0_8px_24px_-4px_rgba(244,63,94,0.15)]'
                    : hasToday
                    ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-900/95 shadow-[0_8px_24px_-4px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800/90 bg-slate-900/85'
                }`}
              >
                {/* Docket Header Strip */}
                <div className="p-4 md:p-5 space-y-3.5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Docket Code */}
                        <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-700/70 px-2.5 py-0.5 rounded-lg badge-3d tabular-nums">
                          {docket.code}
                        </span>

                        {/* Category */}
                        <span className="text-[11px] font-medium text-slate-300 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded-lg">
                          {docket.category}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border badge-3d ${
                            docket.priority === 'urgent'
                              ? 'bg-rose-950/90 text-rose-300 border-rose-700/70 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                              : docket.priority === 'high'
                              ? 'bg-amber-950/90 text-amber-300 border-amber-700/70'
                              : 'bg-blue-950/90 text-blue-300 border-blue-700/70'
                          }`}
                        >
                          {priorityConfig.label}
                        </span>

                        {/* Overall Status */}
                        <span className="text-[11px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                          {statusConfig.label}
                        </span>

                        {/* Alert Badges */}
                        {hasOverdue && (
                          <span className="text-[11px] font-bold text-rose-200 bg-rose-600/30 border border-rose-500/70 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                            {overdueTasks.length} bước quá hạn
                          </span>
                        )}
                        {hasToday && (
                          <span className="text-[11px] font-bold text-amber-200 bg-amber-600/30 border border-amber-500/70 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {todayTasks.length} bước hạn hôm nay
                          </span>
                        )}
                      </div>

                      {/* Docket Title */}
                      <h3
                        onClick={() => onOpenDocketDetail(docket)}
                        className="text-base font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer leading-snug"
                      >
                        {docket.title}
                      </h3>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                      <button
                        onClick={() => onOpenDocketDetail(docket)}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all badge-3d flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Mở hồ sơ</span>
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button
                        onClick={() => toggleDocketExpand(docket.id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
                        title={isExpanded ? 'Thu gọn các bước' : 'Mở rộng xem tất cả các bước'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress & Meta Sub-row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-500">Chủ trì:</span>
                        <span className="font-semibold text-slate-200">{docket.leadAssignee}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Đơn vị:</span>
                        <span className="text-slate-300">{docket.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs">
                        Tiến độ hồ sơ: <span className="font-mono font-bold text-white tabular-nums">{progress}%</span> ({doneSteps}/{totalSteps} bước)
                      </span>
                      <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress === 100
                              ? 'bg-emerald-500'
                              : hasOverdue
                              ? 'bg-rose-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Tasks inside this Docket */}
                <div className="bg-slate-950/60 p-4 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span className="font-semibold text-slate-300">
                      Nhiệm vụ trọng tâm trong hồ sơ này ({tasks.length}):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tích chọn ô tròn để hoàn thành bước
                    </span>
                  </div>

                  <div className="space-y-2">
                    {tasks.map(({ step, isOverdue, isDueToday, isUpcoming, diffDays }) => {
                      const isDone = step.status === 'completed';
                      const stepPriority = PRIORITY_CONFIG[step.priority] || PRIORITY_CONFIG.medium;
                      const calUrl = getGoogleCalendarUrl({
                        title: `[Bước ${step.stepCode}] ${step.title} - Hồ sơ ${docket.code}`,
                        details: `Mã bước: ${step.stepCode}\nThuộc hồ sơ: ${docket.code} - ${docket.title}\nNgười phụ trách: ${step.assignee}\nTrạng thái: ${step.status}`,
                        dueDate: step.dueDate,
                      });

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                            isDone
                              ? 'opacity-60 bg-slate-900/40 border-slate-800/60'
                              : isOverdue
                              ? 'bg-rose-950/30 border-rose-600/40'
                              : isDueToday
                              ? 'bg-amber-950/30 border-amber-600/40'
                              : 'bg-slate-900/70 border-slate-800'
                          }`}
                        >
                          {/* Left: Checkbox + Title + Meta */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={() => onToggleStepStatus(docket.id, step.id)}
                              title={isDone ? 'Đánh dấu chưa hoàn tất' : 'Đánh dấu hoàn thành bước này'}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                                isDone
                                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400'
                                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <Circle className="w-3 h-3 stroke-[2]" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 tabular-nums">
                                  {step.stepCode}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  step.priority === 'urgent'
                                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}>
                                  {stepPriority.label}
                                </span>
                                {isOverdue && (
                                  <span className="text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700">
                                    Quá hạn {Math.abs(diffDays)} ngày
                                  </span>
                                )}
                                {isDueToday && !isDone && (
                                  <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">
                                    Hạn hôm nay
                                  </span>
                                )}
                                {isUpcoming && (
                                  <span className="text-[10px] font-medium text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded border border-blue-800">
                                    Còn {diffDays} ngày ({step.dueDate})
                                  </span>
                                )}
                              </div>

                              <p className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                {step.title}
                              </p>
                            </div>
                          </div>

                          {/* Right: Assignee & Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              {step.assignee}
                            </span>
                            <a
                              href={calUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Thêm vào Google Calendar"
                              className="p-1.5 text-slate-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: GRANULAR TASKS LIST (Xem theo từng bước nhiệm vụ cụ thể)           */
        /* ========================================================================= */
        <div className="space-y-3.5">
          {filteredTasks.map(({ docket, step, isOverdue, isDueToday, isUpcoming, diffDays }) => {
            const isDone = step.status === 'completed';
            const priorityConfig = PRIORITY_CONFIG[step.priority] || PRIORITY_CONFIG.medium;
            const parentTotalSteps = docket.steps.length;
            const parentDoneSteps = docket.steps.filter((s) => s.status === 'completed').length;
            const parentProgress = parentTotalSteps > 0 ? Math.round((parentDoneSteps / parentTotalSteps) * 100) : 0;

            const googleCalUrl = getGoogleCalendarUrl({
              title: `[Bước ${step.stepCode}] ${step.title} - Hồ sơ ${docket.code}`,
              details: `Mã bước: ${step.stepCode}\nThuộc hồ sơ: ${docket.code} - ${docket.title}\nNgười phụ trách: ${step.assignee}\nTrạng thái: ${step.status}`,
              dueDate: step.dueDate,
            });

            return (
              <div
                key={step.id}
                className={`card-3d-interactive p-4 md:p-5 rounded-2xl relative transition-all border ${
                  isDone
                    ? 'opacity-60 bg-slate-950/60 border-slate-800/60'
                    : isOverdue
                    ? 'border-rose-500/50 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 shadow-[0_8px_24px_-4px_rgba(244,63,94,0.15)]'
                    : isDueToday
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 shadow-[0_8px_24px_-4px_rgba(245,158,11,0.15)]'
                    : 'border-slate-700/60 bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Checkbox + Primary Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleStepStatus(docket.id, step.id)}
                      title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành bước này'}
                      className={`mt-1 w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isDone
                          ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400'
                          : 'bg-slate-800/90 border border-slate-700 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 shadow-inner'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 stroke-[2]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 px-2.5 py-0.5 rounded-lg badge-3d tabular-nums">
                          {step.stepCode}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border badge-3d ${
                            step.priority === 'urgent'
                              ? 'bg-rose-950/90 text-rose-300 border-rose-700/70 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                              : step.priority === 'high'
                              ? 'bg-amber-950/90 text-amber-300 border-amber-700/70'
                              : step.priority === 'medium'
                              ? 'bg-blue-950/90 text-blue-300 border-blue-700/70'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {priorityConfig.label}
                        </span>

                        {isOverdue && (
                          <span className="text-[11px] font-bold text-rose-200 bg-rose-600/30 border border-rose-500/70 px-2.5 py-0.5 rounded-lg font-mono tabular-nums flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                            Quá hạn {Math.abs(diffDays)} ngày
                          </span>
                        )}
                        {isDueToday && !isDone && (
                          <span className="text-[11px] font-bold text-amber-200 bg-amber-600/30 border border-amber-500/70 px-2.5 py-0.5 rounded-lg font-mono tabular-nums flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Đến hạn hôm nay
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="text-[11px] font-medium text-blue-200 bg-blue-600/20 border border-blue-500/50 px-2.5 py-0.5 rounded-lg font-mono tabular-nums">
                            Còn {diffDays} ngày ({step.dueDate})
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/90 border border-emerald-700/60 px-2.5 py-0.5 rounded-lg">
                            ✓ Đã hoàn tất
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-base font-bold leading-snug tracking-tight ${
                          isDone ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {step.title}
                      </h4>

                      {step.notes && (
                        <div className="text-xs text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80 italic">
                          Lưu ý: {step.notes}
                        </div>
                      )}

                      {/* Parent Docket Attribution Card */}
                      <div className="flex items-center gap-3 pt-1 flex-wrap text-xs">
                        <button
                          onClick={() => onOpenDocketDetail(docket)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all group cursor-pointer"
                          title="Bấm để mở hồ sơ gốc"
                        >
                          <span className="font-mono text-cyan-400 font-bold tabular-nums">
                            [{docket.code}]
                          </span>
                          <span className="font-medium text-slate-300 group-hover:text-white truncate max-w-xs md:max-w-md">
                            {docket.title}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100" />
                        </button>

                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-[11px] text-slate-500 font-medium">Chủ trì:</span>
                          <span className="font-semibold text-slate-200">{step.assignee}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-[11px] text-slate-500 font-medium">Tiến độ hồ sơ:</span>
                          <span className="font-mono text-xs font-bold text-white tabular-nums">
                            {parentProgress}%
                          </span>
                          <div className="w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              style={{ width: `${parentProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Tactile 3D Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center pt-2 lg:pt-0">
                    <a
                      href={googleCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Đưa mốc hạn này vào Google Calendar"
                      className="p-2.5 text-slate-400 hover:text-cyan-300 bg-slate-950 hover:bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onOpenDocketDetail(docket)}
                      className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white bg-gradient-to-b from-slate-750 to-slate-850 hover:from-slate-700 hover:to-slate-800 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all badge-3d shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem hồ sơ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
