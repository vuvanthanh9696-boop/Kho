import React, { useState } from 'react';
import { 
  X, 
  Type, 
  RotateCcw, 
  Check, 
  Sliders, 
  FileText, 
  FolderKanban,
  Sparkles,
  Minus,
  Plus
} from 'lucide-react';
import { FontSettings, DEFAULT_FONT_SETTINGS, FontFamilyOption, FONT_FAMILY_MAP } from '../types';

interface FontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FontSettings;
  onUpdateSettings: (settings: FontSettings) => void;
}

export const FontSettingsModal: React.FC<FontSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
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

  const handleReset = () => {
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cài đặt Cỡ chữ & Phông chữ hiển thị
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mặc định sử dụng Times New Roman chuẩn văn thư hành chính
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
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
                const sampleFont = FONT_FAMILY_MAP[family.id];
                return (
                  <div
                    key={family.id}
                    onClick={() => handleFamilyChange(family.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900" style={{ fontFamily: sampleFont }}>
                          {family.name}
                        </span>
                        {family.id === 'times' && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                            Mặc định chuẩn văn thư
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {family.desc}
                      </p>
                      <div 
                        className="text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 italic mt-1.5 shadow-2xs"
                        style={{ fontFamily: sampleFont }}
                      >
                        "{family.sample}"
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Live Preview Box */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Xem trước giao diện thực tế với cỡ chữ & phông hiện tại
              </label>
              <span className="text-[11px] text-slate-600">
                Tự động lưu và áp dụng ngay
              </span>
            </div>

            <div 
              className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 space-y-2.5 shadow-inner"
              style={{
                fontFamily: FONT_FAMILY_MAP[currentFamily],
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
                  HS-2026-088
                </span>
                <span className="text-xs text-amber-400 font-semibold">
                  Hạn hoàn thành: 25/10/2026
                </span>
              </div>
              <h4 className="font-bold text-white leading-snug">
                Báo cáo kết quả thẩm định hồ sơ công việc và giải pháp triển khai năm 2026
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Người chủ trì: <strong>Nguyễn Văn An</strong> • Đơn vị: <strong>Văn phòng Ban</strong> • Tiến độ: <strong>4/5 bước hoàn tất (80%)</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors border border-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định (Times New Roman, 15px)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Đóng & Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
