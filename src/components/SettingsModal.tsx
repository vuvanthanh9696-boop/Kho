import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Type, 
  Sliders, 
  RotateCcw, 
  Check, 
  FileText, 
  Minus, 
  Plus, 
  CalendarCheck2, 
  DownloadCloud, 
  BellRing, 
  Layers, 
  Github, 
  Database,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { FontSettings, DEFAULT_FONT_SETTINGS, FontFamilyOption } from '../types';
import { downloadICSFile } from '../utils/calendarSync';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FontSettings;
  onUpdateSettings: (settings: FontSettings) => void;
  dockets: any[];
  notificationPermission: NotificationPermission;
  onEnableNotifications: () => void;
  onOpenTemplateManager?: () => void;
  onOpenBackupModal?: () => void;
  onOpenGitHubSync?: () => void;
  initialTab?: 'font' | 'utilities' | 'data';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  dockets,
  notificationPermission,
  onEnableNotifications,
  onOpenTemplateManager,
  onOpenBackupModal,
  onOpenGitHubSync,
  initialTab = 'font',
}) => {
  const [activeTab, setActiveTab] = useState<'font' | 'utilities' | 'data'>(initialTab);
  const [currentSize, setCurrentSize] = useState<number>(settings.fontSize);
  const [currentFamily, setCurrentFamily] = useState<FontFamilyOption>(settings.fontFamily);

  if (!isOpen) return null;

  const handleSizeChange = (newSize: number) => {
    const clamped = Math.max(12, Math.min(22, newSize));
    setCurrentSize(clamped);
    onUpdateSettings({
      fontSize: clamped,
      fontFamily: currentFamily,
    });
  };

  const handleFamilyChange = (newFamily: FontFamilyOption) => {
    setCurrentFamily(newFamily);
    onUpdateSettings({
      fontSize: currentSize,
      fontFamily: newFamily,
    });
  };

  const handleResetFont = () => {
    setCurrentSize(DEFAULT_FONT_SETTINGS.fontSize);
    setCurrentFamily(DEFAULT_FONT_SETTINGS.fontFamily);
    onUpdateSettings(DEFAULT_FONT_SETTINGS);
  };

  const FONT_SIZE_PRESETS = [
    { label: 'Nhỏ', size: 13 },
    { label: 'Vừa', size: 14 },
    { label: 'Tiêu chuẩn (Mặc định)', size: 15 },
    { label: 'Lớn', size: 17 },
    { label: 'Rất lớn', size: 19 },
    { label: 'Cực lớn', size: 21 },
  ];

  const FONT_FAMILIES: { id: FontFamilyOption; name: string; desc: string; sample: string }[] = [
    {
      id: 'times',
      name: 'Times New Roman (Mặc định)',
      desc: 'Quy chuẩn thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP). Trang trọng, dễ đọc tài liệu dài.',
      sample: 'Cộng hòa Xã hội Chủ nghĩa Việt Nam - Độc lập - Tự do - Hạnh phúc',
    },
    {
      id: 'arial',
      name: 'Arial',
      desc: 'Phông chữ không chân hiện đại, rõ ràng, tối ưu cho màn hình máy tính độ phân giải cao.',
      sample: 'Báo cáo tiến độ giải quyết hồ sơ công việc tuần thứ 42',
    },
    {
      id: 'system',
      name: 'Plus Jakarta Sans (Giao diện số)',
      desc: 'Phông chữ hiện đại của các phần mềm ứng dụng đám mây thế hệ mới.',
      sample: 'Quản trị danh mục hồ sơ và công đoạn tự động hóa',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cài đặt & Tiện ích hệ thống
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tùy chỉnh cỡ chữ, phông Times New Roman và các công cụ tiện ích
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Đóng bảng cài đặt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-slate-100/70 gap-2">
          <button
            onClick={() => setActiveTab('font')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'font'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Phông chữ & Cỡ chữ</span>
          </button>

          <button
            onClick={() => setActiveTab('utilities')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'utilities'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Tiện ích Lịch & Ứng dụng</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'data'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Quy trình & Dữ liệu</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: FONT SETTINGS */}
          {activeTab === 'font' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Section 1: Font Size Stepper & Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Cỡ chữ giao diện (Font Size)
                  </label>
                  <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-lg">
                    {currentSize}px
                  </span>
                </div>

                {/* Stepper & Slider Controls */}
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleSizeChange(currentSize - 1)}
                    disabled={currentSize <= 12}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Giảm 1px"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 px-2">
                    <input
                      type="range"
                      min="12"
                      max="22"
                      step="1"
                      value={currentSize}
                      onChange={(e) => handleSizeChange(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[11px] text-slate-600 mt-1.5 font-mono">
                      <span>12px (Nhỏ)</span>
                      <span className="text-blue-700 font-bold">15px (Chuẩn)</span>
                      <span>22px (Rất lớn)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSizeChange(currentSize + 1)}
                    disabled={currentSize >= 22}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Tăng 1px"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset chips */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {FONT_SIZE_PRESETS.map((preset) => {
                    const isActive = currentSize === preset.size;
                    return (
                      <button
                        key={preset.size}
                        type="button"
                        onClick={() => handleSizeChange(preset.size)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Font Family Selection */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-blue-600" />
                  Kiểu phông chữ (Font Family)
                </label>

                <div className="space-y-2.5">
                  {FONT_FAMILIES.map((family) => {
                    const isSelected = currentFamily === family.id;
                    return (
                      <div
                        key={family.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleFamilyChange(family.id)}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-600 shadow-xs ring-1 ring-blue-600/30'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {family.name}
                              </span>
                              {family.id === 'times' && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono">
                                  Khuyên dùng
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {family.desc}
                            </p>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Visual sample text */}
                        <div 
                          className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs truncate"
                          style={{
                            fontFamily: 
                              family.id === 'times' 
                                ? '"Times New Roman", Times, serif' 
                                : family.id === 'arial' 
                                  ? 'Arial, Helvetica, sans-serif' 
                                  : '"Plus Jakarta Sans", sans-serif'
                          }}
                        >
                          <span className="text-slate-400 select-none mr-2 font-mono text-[10px]">Mẫu:</span>
                          {family.sample}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Live Preview Box */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Xem trước trực tiếp giao diện
                </label>

                <div 
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 transition-all shadow-inner"
                  style={{
                    fontFamily: 
                      currentFamily === 'times' 
                        ? '"Times New Roman", Times, serif' 
                        : currentFamily === 'arial' 
                          ? 'Arial, Helvetica, sans-serif' 
                          : '"Plus Jakarta Sans", sans-serif',
                    fontSize: `${currentSize}px`
                  }}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900">
                      HỒ SƠ: HS-2026/042 - Thẩm định quy hoạch chi tiết 1/500
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                      Đang xử lý
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Đây là dòng văn bản mẫu thể hiện cỡ chữ <strong>{currentSize}px</strong> với phông chữ <strong>{FONT_FAMILIES.find(f => f.id === currentFamily)?.name}</strong>. Mọi tiêu đề, nội dung công đoạn, danh sách hồ sơ và báo cáo trên hệ thống sẽ áp dụng theo cấu hình này.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UTILITIES & CALENDAR */}
          {activeTab === 'utilities' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Item 1: Calendar Sync */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CalendarCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Xuất Lịch biểu công việc (.ics)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Tải tệp lịch chuẩn iCalendar chứa toàn bộ thời hạn hồ sơ và bước con để nhập tự động vào Google Calendar, Outlook hoặc Apple Calendar trên máy tính & điện thoại.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadICSFile(dockets)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  <span>Tải .ics ngay</span>
                </button>
              </div>

              {/* Item 2: Desktop App PWA */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Cài đặt ứng dụng Desktop (Chạy Offline 100%)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Cài đặt ứng dụng như phần mềm máy tính độc lập (Desktop App), khởi động từ thanh Taskbar, chạy nhanh và an toàn không cần kết nối mạng.
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <PWAInstallButton variant="full" />
                </div>
              </div>

              {/* Item 3: Browser Notifications */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Thông báo đẩy nhắc việc trình duyệt
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Tự động gửi cảnh báo khi có hồ sơ sắp đến hạn hoặc quá hạn xử lý ngay trên màn hình.
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  {notificationPermission === 'granted' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Đã cấp quyền</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onEnableNotifications}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>Bật nhắc việc</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROCEDURES & DATA */}
          {activeTab === 'data' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Item 1: Template Manager */}
              {onOpenTemplateManager && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Quản lý Bộ mẫu Quy trình chuẩn hóa
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Thiết lập các công đoạn chuẩn, số ngày xử lý mẫu để tái sử dụng khi tạo mới hồ sơ công việc.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTemplateManager();
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                  >
                    <span>Mở bộ mẫu</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Item 2: Backup & Restore */}
              {onOpenBackupModal && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Sao lưu, Xuất Excel & Phục hồi dữ liệu
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Xuất dữ liệu hồ sơ ra file JSON/CSV Excel để lưu trữ an toàn hoặc chuyển đổi sang máy tính khác.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBackupModal();
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                  >
                    <span>Sao lưu / Nạp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Item 3: GitHub Sync */}
              {onOpenGitHubSync && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Đồng bộ kho lưu trữ GitHub
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Đẩy mã nguồn và cập nhật ứng dụng tự động lên kho GitHub cá nhân.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGitHubSync();
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 border border-slate-300 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                  >
                    <span>Đồng bộ GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          {activeTab === 'font' ? (
            <button
              type="button"
              onClick={handleResetFont}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Khôi phục về Times New Roman 15px chuẩn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục chuẩn Times New Roman</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500">
              Toàn bộ dữ liệu được lưu cục bộ an toàn trên thiết bị của bạn
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Hoàn tất & Đóng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
