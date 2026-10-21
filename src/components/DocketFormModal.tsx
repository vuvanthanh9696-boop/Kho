import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  HardDrive,
  FolderOpen,
  FileText,
  ArrowDown,
  ArrowUp,
  Layers,
  Calendar,
  FileSpreadsheet,
  Presentation,
  Check
} from 'lucide-react';
import { 
  Docket, 
  DocketStep, 
  Priority, 
  DocketStatus,
  DEFAULT_CATEGORIES, 
  DEFAULT_DEPARTMENTS,
  PRIORITY_CONFIG
} from '../types';
import { checkDuplicateDocketCode, suggestNextDocketCode } from '../utils/storage';
import { WORKFLOW_TEMPLATES } from '../utils/templates';

interface DocketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docket: Docket) => void;
  existingDockets: Docket[];
  editingDocket?: Docket | null;
}

export const DocketFormModal: React.FC<DocketFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingDockets,
  editingDocket,
}) => {
  const isEdit = !!editingDocket;

  // Form states
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENTS[0]);
  const [leadAssignee, setLeadAssignee] = useState('Vũ Văn Thành');
  const [collaboratorsText, setCollaboratorsText] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [status, setStatus] = useState<DocketStatus>('in_progress');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [localFilePath, setLocalFilePath] = useState('');
  const [localFileName, setLocalFileName] = useState('');
  const formFileInputRef = useRef<HTMLInputElement>(null);
  
  // Dynamic Steps
  const [steps, setSteps] = useState<DocketStep[]>([]);
  
  // Real-time duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; matchedTitle?: string } | null>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editingDocket) {
      setCode(editingDocket.code);
      setTitle(editingDocket.title);
      setCategory(editingDocket.category);
      setDepartment(editingDocket.department);
      setLeadAssignee(editingDocket.leadAssignee);
      setCollaboratorsText(editingDocket.collaborators.join(', '));
      setPriority(editingDocket.priority);
      setStatus(editingDocket.status);
      setStartDate(editingDocket.startDate);
      setDueDate(editingDocket.dueDate);
      setNotes(editingDocket.notes || '');
      setTagsText(editingDocket.tags.join(', '));
      setSteps(editingDocket.steps || []);
      setLocalFilePath(editingDocket.localFilePath || '');
      setLocalFileName(editingDocket.localFileName || '');
      setDuplicateWarning(null);
    } else {
      const suggested = suggestNextDocketCode(existingDockets);
      setCode(suggested);
      setTitle('');
      setCategory(DEFAULT_CATEGORIES[0]);
      setDepartment(DEFAULT_DEPARTMENTS[0]);
      setLeadAssignee('Vũ Văn Thành');
      setCollaboratorsText('');
      setPriority('high');
      setStatus('in_progress');
      const todayStr = new Date().toISOString().split('T')[0];
      setStartDate(todayStr);
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setNotes('');
      setTagsText('');
      setLocalFilePath(`ms-word:ofe|u|D:\\HoSoCongViec\\${suggested}\\HoSoGoc.docx`);
      setLocalFileName('HoSoGoc.docx');
      setDuplicateWarning(null);

      // Default with standard 2 sub-steps
      setSteps([
        {
          id: `step-${Date.now()}-1`,
          stepCode: `${suggested}-B01`,
          title: 'Tiếp nhận, kiểm tra hồ sơ và văn bản pháp lý',
          assignee: 'Vũ Văn Thành',
          dueDate: todayStr,
          status: 'todo',
          priority: 'high',
          order: 1,
        },
        {
          id: `step-${Date.now()}-2`,
          stepCode: `${suggested}-B02`,
          title: 'Thẩm định chuyên môn và xây dựng báo cáo kết quả',
          assignee: 'Vũ Văn Thành',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          status: 'todo',
          priority: 'medium',
          order: 2,
        },
      ]);
    }
  }, [isOpen, editingDocket, existingDockets]);

  // Check duplicate code on typing
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const upper = newCode.trim().toUpperCase();
    if (!upper) {
      setDuplicateWarning(null);
      return;
    }

    const dupCheck = checkDuplicateDocketCode(upper, existingDockets, editingDocket?.id);
    if (dupCheck.isDuplicate) {
      setDuplicateWarning({
        isDuplicate: true,
        matchedTitle: dupCheck.matchedDocket?.title,
      });
    } else {
      setDuplicateWarning(null);
    }
  };

  // Quick apply suggested code
  const handleApplySuggestedCode = () => {
    const suggested = suggestNextDocketCode(existingDockets);
    setCode(suggested);
    setDuplicateWarning(null);
    // Update step codes if they use prefix
    setSteps((prev) =>
      prev.map((s, idx) => ({
        ...s,
        stepCode: `${suggested}-B0${idx + 1}`,
      }))
    );
    if (!localFilePath || localFilePath.includes('HS-')) {
      setLocalFilePath(`ms-word:ofe|u|D:\\HoSoCongViec\\${suggested}\\HoSoGoc.docx`);
    }
  };

  // Format path helpers for Office URI Schemes
  const formatAsWordProtocol = () => {
    let clean = localFilePath.trim();
    clean = clean.replace(/^(ms-word:ofe\|u\||ms-excel:ofe\|u\||ms-powerpoint:ofe\|u\|)/i, '');
    clean = clean.replace(/\.[a-zA-Z0-9]+$/, '') + '.docx';
    if (!clean.includes(':\\') && !clean.includes(':/')) {
      clean = `D:\\HoSoCongViec\\${code || 'HS'}\\${clean || 'HoSoGoc.docx'}`;
    }
    setLocalFilePath(`ms-word:ofe|u|${clean}`);
    setLocalFileName(clean.split(/[\\/]/).pop() || 'HoSoGoc.docx');
  };

  const formatAsExcelProtocol = () => {
    let clean = localFilePath.trim();
    clean = clean.replace(/^(ms-word:ofe\|u\||ms-excel:ofe\|u\||ms-powerpoint:ofe\|u\|)/i, '');
    clean = clean.replace(/\.[a-zA-Z0-9]+$/, '') + '.xlsx';
    if (!clean.includes(':\\') && !clean.includes(':/')) {
      clean = `D:\\HoSoCongViec\\${code || 'HS'}\\${clean || 'BangKe.xlsx'}`;
    }
    setLocalFilePath(`ms-excel:ofe|u|${clean}`);
    setLocalFileName(clean.split(/[\\/]/).pop() || 'BangKe.xlsx');
  };

  const formatAsPowerPointProtocol = () => {
    let clean = localFilePath.trim();
    clean = clean.replace(/^(ms-word:ofe\|u\||ms-excel:ofe\|u\||ms-powerpoint:ofe\|u\|)/i, '');
    clean = clean.replace(/\.[a-zA-Z0-9]+$/, '') + '.pptx';
    if (!clean.includes(':\\') && !clean.includes(':/')) {
      clean = `D:\\HoSoCongViec\\${code || 'HS'}\\${clean || 'BaoCao.pptx'}`;
    }
    setLocalFilePath(`ms-powerpoint:ofe|u|${clean}`);
    setLocalFileName(clean.split(/[\\/]/).pop() || 'BaoCao.pptx');
  };

  const formatAsNormalPath = () => {
    const clean = localFilePath.replace(/^(ms-word:ofe\|u\||ms-excel:ofe\|u\||ms-powerpoint:ofe\|u\|)/i, '').trim();
    setLocalFilePath(clean);
  };

  // Add a new step
  const handleAddStep = () => {
    const nextOrder = steps.length + 1;
    const padNum = nextOrder < 10 ? `0${nextOrder}` : `${nextOrder}`;
    const newStep: DocketStep = {
      id: `step-${Date.now()}-${nextOrder}`,
      stepCode: `${code ? code.trim() : 'HS'}-B${padNum}`,
      title: '',
      assignee: leadAssignee || 'Vũ Văn Thành',
      dueDate: dueDate,
      status: 'todo',
      priority: 'medium',
      order: nextOrder,
    };
    setSteps([...steps, newStep]);
  };

  // Remove a step
  const handleRemoveStep = (stepId: string) => {
    const filtered = steps.filter((s) => s.id !== stepId);
    setSteps(filtered.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  // Update step field
  const handleStepFieldChange = (stepId: string, field: keyof DocketStep, value: any) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, [field]: value } : s)));
  };

  // Move step up / down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setSteps(reordered.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  // Load a standard workflow template
  const handleLoadTemplate = (templateId: string) => {
    const tpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    if (steps.length > 0) {
      const confirm = window.confirm(`Áp dụng "${tpl.name}" sẽ thay thế các bước hiện tại. Tiếp tục?`);
      if (!confirm) return;
    }

    setCategory(tpl.defaultCategory);
    const baseCode = code.trim() || 'HS-2026-TPL';
    const nowMs = Date.now();

    const newSteps: DocketStep[] = tpl.steps.map((s, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      stepCode: `${baseCode}-${s.codeSuffix}`,
      title: s.title,
      assignee: leadAssignee || 'Vũ Văn Thành',
      dueDate: new Date(nowMs + s.relativeDays * 86400000).toISOString().split('T')[0],
      status: 'todo',
      priority: s.priority,
      order: idx + 1,
      notes: s.notes || '',
    }));

    setSteps(newSteps);
    const maxDays = Math.max(...tpl.steps.map((s) => s.relativeDays));
    setDueDate(new Date(nowMs + maxDays * 86400000).toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      alert('Vui lòng nhập Mã hồ sơ');
      return;
    }
    if (!title.trim()) {
      alert('Vui lòng nhập Tên/Trích yếu hồ sơ');
      return;
    }
    if (duplicateWarning?.isDuplicate) {
      alert('Mã hồ sơ đang bị trùng lặp. Vui lòng sửa lại mã trước khi lưu!');
      return;
    }

    const collaborators = collaboratorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanPath = localFilePath.trim();
    const inferredFileName = localFileName.trim() || cleanPath.split(/[\\/]/).pop() || `HoSo_${code.trim()}.docx`;

    const docketData: Docket = {
      id: editingDocket?.id || `docket-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      category,
      department,
      leadAssignee: leadAssignee.trim(),
      collaborators,
      priority,
      status,
      startDate,
      dueDate,
      notes: notes.trim(),
      tags,
      attachments: editingDocket?.attachments || [
        { 
          id: `att-${Date.now()}`, 
          name: inferredFileName, 
          size: '1.2 MB', 
          localPath: cleanPath,
          addedAt: startDate 
        }
      ],
      steps: steps.map((s, idx) => ({ ...s, order: idx + 1 })),
      localFilePath: cleanPath || undefined,
      localFileName: inferredFileName,
      createdAt: editingDocket?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: status === 'completed' ? (editingDocket?.completedAt || new Date().toISOString()) : undefined,
    };

    onSave(docketData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Header - Light theme with clear contrast */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                {code || 'MÃ HỒ SƠ'}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Chỉnh sửa Hồ sơ Công việc' : 'Tạo mới Hồ sơ Công việc & Phân rã Bước con'}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Quản lý chi tiết hồ sơ mẹ, phân bổ các bước thực hiện và liên kết tệp mở trực tiếp máy tính cá nhân.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Light background & Black/Dark text */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white text-slate-900">
          
          {/* Section 1: Thông tin Hồ sơ mẹ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Thông tin chung hồ sơ
              </h3>

              {/* Template quick-picker */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Nạp quy trình mẫu:
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleLoadTemplate(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="text-xs py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 focus:outline-hidden cursor-pointer"
                >
                  <option value="" disabled className="bg-white text-slate-500">-- Chọn quy trình mẫu --</option>
                  {WORKFLOW_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id} className="bg-white text-slate-900">
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duplicate Warning Alert */}
            {duplicateWarning?.isDuplicate && (
              <div className="flex items-start justify-between gap-3 p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-800">Cảnh báo trùng lặp mã hồ sơ:</span> Mã{' '}
                    <strong className="font-mono text-rose-950 underline">{code}</strong> đã tồn tại cho hồ sơ: "
                    {duplicateWarning.matchedTitle}". Hệ thống chặn tạo trùng để bảo toàn dữ liệu.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplySuggestedCode}
                  className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  Gợi ý mã khác
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Mã hồ sơ <span className="text-rose-600">*</span>
                  </label>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={handleApplySuggestedCode}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Gợi ý mã
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="VD: HS-2026-048"
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border focus:outline-hidden ${
                    duplicateWarning?.isDuplicate
                      ? 'border-rose-500 bg-rose-50 text-rose-950 focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lĩnh vực / Phân loại
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-slate-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Đơn vị liên quan / Ban ban hành
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  {DEFAULT_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-white text-slate-900">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tên hồ sơ / Trích yếu nội dung <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên trích yếu hồ sơ (VD: Thẩm định hồ sơ thiết kế thi công công trình...)"
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                required
              />
            </div>

            {/* Row: Lead Assignee, Priority, Status, Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Người chủ trì / Phụ trách chính
                </label>
                <input
                  type="text"
                  value={leadAssignee}
                  onChange={(e) => setLeadAssignee(e.target.value)}
                  placeholder="Họ và tên..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mức độ ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="urgent" className="text-rose-700 font-semibold">Hỏa tốc / Khẩn</option>
                  <option value="high" className="text-amber-700 font-semibold">Ưu tiên cao</option>
                  <option value="medium" className="text-blue-700">Bình thường</option>
                  <option value="low" className="text-slate-600">Thấp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ngày tiếp nhận / bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Hạn hoàn thành toàn bộ
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Row: Notes & Collaborators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Người phối hợp (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={collaboratorsText}
                  onChange={(e) => setCollaboratorsText(e.target.value)}
                  placeholder="Trần Thị Mai, Lê Hoàng Nam..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nhãn từ khóa (tags)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Thẩm định, CNTT, Khẩn..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ghi chú / Ý kiến chỉ đạo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ý kiến chỉ đạo hoặc yêu cầu bổ sung đặc biệt..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Field: Đường dẫn hồ sơ gốc & Mở trực tiếp Word/Excel/PowerPoint */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  Đường dẫn mở trực tiếp bằng Microsoft Office (Word / Excel / PowerPoint)
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Office Protocol Ready
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Để máy tính tự động bật trực tiếp bằng <strong>Microsoft Word</strong>, <strong>Excel</strong> hoặc <strong>PowerPoint</strong>, bấm các nút chuyển đổi nhanh bên dưới để tạo đường dẫn giao thức chuẩn:
              </p>

              {/* Protocol Quick-Format Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={formatAsWordProtocol}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-800 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Tự động thêm tiền tố ms-word:ofe|u| để mở trực tiếp bằng Word"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đổi sang ms-word:</span>
                </button>

                <button
                  type="button"
                  onClick={formatAsExcelProtocol}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Tự động thêm tiền tố ms-excel:ofe|u| để mở trực tiếp bằng Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đổi sang ms-excel:</span>
                </button>

                <button
                  type="button"
                  onClick={formatAsPowerPointProtocol}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Tự động thêm tiền tố ms-powerpoint:ofe|u| để mở trực tiếp bằng PowerPoint"
                >
                  <Presentation className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đổi sang ms-powerpoint:</span>
                </button>

                <button
                  type="button"
                  onClick={formatAsNormalPath}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-all cursor-pointer"
                  title="Xóa tiền tố Office, dùng đường dẫn ổ đĩa thông thường D:\..."
                >
                  <span>Về đường dẫn gốc (D:\)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={localFilePath}
                  onChange={(e) => {
                    setLocalFilePath(e.target.value);
                    const clean = e.target.value.replace(/^(ms-word:ofe\|u\||ms-excel:ofe\|u\||ms-powerpoint:ofe\|u\|)/i, '');
                    const name = clean.split(/[\\/]/).pop();
                    if (name) setLocalFileName(name);
                  }}
                  placeholder="ms-word:ofe|u|D:\ThuMuc\TenFile.docx hoặc D:\ThuMuc\TenFile.pdf"
                  className="flex-1 px-3.5 py-2 text-xs font-mono font-medium rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                />

                <input
                  type="file"
                  ref={formFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLocalFileName(file.name);
                      const ext = file.name.split('.').pop()?.toLowerCase();
                      const basePath = `D:\\HoSoCongViec\\${code || 'HS'}\\${file.name}`;
                      if (ext === 'doc' || ext === 'docx') {
                        setLocalFilePath(`ms-word:ofe|u|${basePath}`);
                      } else if (ext === 'xls' || ext === 'xlsx') {
                        setLocalFilePath(`ms-excel:ofe|u|${basePath}`);
                      } else if (ext === 'ppt' || ext === 'pptx') {
                        setLocalFilePath(`ms-powerpoint:ofe|u|${basePath}`);
                      } else {
                        setLocalFilePath(basePath);
                      }
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => formFileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Chọn tệp...
                </button>
              </div>

              {localFileName && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1">
                  <span>Tệp đính kèm nhận diện:</span>
                  <strong className="text-blue-700 font-mono font-bold">{localFileName}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Danh sách các bước công việc con (Sub-steps) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Phân rã các bước công việc con ({steps.length} bước)
                </h3>
                <p className="text-[11px] text-slate-600">
                  Mỗi bước mang mã định danh riêng để theo dõi tiến độ, người làm và hạn định chi tiết.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                Thêm bước tiếp theo
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="p-5 text-center border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs bg-slate-50">
                Chưa có bước con nào. Bấm "+ Thêm bước tiếp theo" hoặc nạp quy trình mẫu ở trên.
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-blue-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.stepCode}
                          onChange={(e) => handleStepFieldChange(step.id, 'stepCode', e.target.value)}
                          placeholder="Mã bước"
                          className="w-32 px-2.5 py-1 text-xs font-mono font-bold bg-white text-blue-800 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveStep(idx, 'up')}
                          className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-20 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === steps.length - 1}
                          onClick={() => handleMoveStep(idx, 'down')}
                          className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-20 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bước này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                      {/* Title */}
                      <div className="md:col-span-6">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepFieldChange(step.id, 'title', e.target.value)}
                          placeholder="Nội dung bước thực hiện..."
                          className="w-full px-3 py-1.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Assignee */}
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={step.assignee}
                          onChange={(e) => handleStepFieldChange(step.id, 'assignee', e.target.value)}
                          placeholder="Người làm..."
                          className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Due Date */}
                      <div className="md:col-span-2">
                        <input
                          type="date"
                          value={step.dueDate}
                          onChange={(e) => handleStepFieldChange(step.id, 'dueDate', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-white text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-hidden cursor-pointer"
                        />
                      </div>

                      {/* Priority */}
                      <div className="md:col-span-2">
                        <select
                          value={step.priority}
                          onChange={(e) => handleStepFieldChange(step.id, 'priority', e.target.value as Priority)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-hidden cursor-pointer"
                        >
                          <option value="urgent" className="text-rose-700 font-semibold">Hỏa tốc</option>
                          <option value="high" className="text-amber-700 font-semibold">Cao</option>
                          <option value="medium" className="text-blue-700">Vừa</option>
                          <option value="low" className="text-slate-600">Thấp</option>
                        </select>
                      </div>
                    </div>

                    {/* Step Notes */}
                    <input
                      type="text"
                      value={step.notes || ''}
                      onChange={(e) => handleStepFieldChange(step.id, 'notes', e.target.value)}
                      placeholder="Ghi chú chi tiết cho bước này (tùy chọn)..."
                      className="w-full px-3 py-1.5 text-[11px] bg-white text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-300 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={duplicateWarning?.isDuplicate}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer ${
                duplicateWarning?.isDuplicate
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20'
              }`}
            >
              {isEdit ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ vào hệ thống'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
