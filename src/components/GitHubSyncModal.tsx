import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  RefreshCw, 
  FolderGit2, 
  CheckCircle2, 
  Sparkles,
  Download,
  AlertCircle,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CloudUpload
} from 'lucide-react';
import { Docket } from '../types';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJson?: () => void;
  dockets?: Docket[];
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  onExportJson,
  dockets = [],
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [repoName, setRepoName] = useState(() => localStorage.getItem('docuflow_github_repo') || 'vuvanthanh9696-boop/Kho');
  const [patToken, setPatToken] = useState(() => localStorage.getItem('docuflow_github_token') || '');
  const [showToken, setShowToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 3500);
    });
  };

  const cleanRepo = repoName.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
  const cleanToken = patToken.trim();

  // Full Git command with auth embedded so no login prompts or password auth failures!
  const authenticatedRemoteUrl = cleanToken 
    ? `https://${cleanRepo.split('/')[0] || 'vuvanthanh9696-boop'}:${cleanToken}@github.com/${cleanRepo}.git`
    : `https://github.com/${cleanRepo}.git`;

  const fullGitCommand = `git remote set-url origin ${authenticatedRemoteUrl} || git remote add origin ${authenticatedRemoteUrl}
git branch -M main
git push -u origin main`;

  const pushCommand = `git add .
git commit -m "Cập nhật dữ liệu DocuFlow và mở file trực tiếp Word/Excel"
git push origin main`;

  // 1-Click Direct Sync via GitHub REST API
  const handleSyncToGitHub = async () => {
    if (!cleanRepo || !cleanToken) {
      setSyncStatus('error');
      setSyncMessage('Vui lòng nhập Repository và Personal Access Token');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      const branch = 'main';
      const filePath = 'data/dockets.json';

      // 1. Get existing file SHA if present
      let sha: string | undefined = undefined;
      try {
        const getRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${filePath}?ref=${branch}`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (getRes.ok) {
          const fileInfo = await getRes.json();
          sha = fileInfo.sha;
        }
      } catch {
        // File does not exist yet
      }

      // 2. Encode UTF-8 content to base64
      const jsonString = JSON.stringify(dockets, null, 2);
      const utf8Bytes = new TextEncoder().encode(jsonString);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = btoa(binary);

      // 3. Commit file via GitHub API
      const putRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Đồng bộ dữ liệu ${dockets.length} hồ sơ công việc DocuFlow - ${new Date().toLocaleString('vi-VN')} [skip ci]`,
          content: base64Content,
          sha,
          branch,
        }),
      });

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData.message || `Lỗi HTTP ${putRes.status}`);
      }

      setSyncStatus('success');
      setSyncMessage(`Đã đồng bộ thành công ${dockets.length} hồ sơ lên GitHub (${filePath})!`);
      localStorage.setItem('docuflow_github_repo', cleanRepo);
      localStorage.setItem('docuflow_github_token', cleanToken);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(`Không thể đồng bộ: ${err.message || 'Lỗi kết nối GitHub'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-md">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Đồng Bộ Dữ Liệu & Mã Nguồn Lên GitHub
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  API Synced
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Đẩy dữ liệu hồ sơ và cập nhật website lên kho lưu trữ GitHub của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Section 1: 1-Click Direct Sync via GitHub API */}
          <div className="p-4.5 bg-gradient-to-r from-purple-950/60 via-slate-950 to-slate-950 rounded-2xl border-2 border-purple-500/40 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-purple-400" />
                <h4 className="font-black text-white text-sm">
                  Đồng Bộ Dữ Liệu Trực Tiếp Lên GitHub (1-Chạm)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 border border-purple-700/80 px-2.5 py-0.5 rounded-full">
                Không cần Terminal
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Hệ thống sẽ chuyển đổi toàn bộ <strong className="text-white">{dockets.length} hồ sơ công việc</strong> hiện tại thành tệp <code className="text-cyan-300 font-mono">data/dockets.json</code> và tự động Commit trực tiếp lên GitHub thông qua tài khoản của bạn.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-200 mb-1">
                  Kho lưu trữ (Repository):
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="username/repo (VD: vuvanthanh9696-boop/Kho)"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-200">
                    GitHub Personal Access Token:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showToken ? 'Ẩn' : 'Hiện'}</span>
                  </button>
                </div>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncStatus === 'success' && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{syncMessage}</span>
                </div>
                <a
                  href={`https://github.com/${cleanRepo}/blob/main/data/dockets.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Xem trên GitHub</span>
                </a>
              </div>
            )}

            {syncStatus === 'error' && (
              <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">{syncMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Token được lưu cục bộ an toàn trong trình duyệt của bạn.</span>
              </div>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSyncToGitHub}
                className={`px-5 py-2 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  isSyncing
                    ? 'bg-purple-900/60 text-purple-300 cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95'
                }`}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                    <span>Đang đồng bộ dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>Đồng Bộ Dữ Liệu Lên GitHub Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Terminal Commands (Pre-authenticated) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Lệnh Terminal đã cấu hình sẵn Token (Không lo lỗi mật khẩu):</span>
              </label>

              <button
                type="button"
                onClick={() => handleCopy(fullGitCommand, 1)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedIndex === 1 ? 'Đã copy!' : 'Sao chép lệnh'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 select-all space-y-1">
              <div>git remote set-url origin https://vuvanthanh9696-boop:***@github.com/{cleanRepo}.git</div>
              <div>git branch -M main</div>
              <div>git push -u origin main</div>
            </div>
          </div>

          {/* Section 3: Package Downloads */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white block text-xs">
                  Tải tệp sao lưu dữ liệu máy tính (.json)
                </span>
                <span className="text-[11px] text-slate-400">
                  Xuất toàn bộ danh sách {dockets.length} hồ sơ để lưu trữ dự phòng
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onExportJson && (
                <button
                  type="button"
                  onClick={onExportJson}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tải JSON</span>
                </button>
              )}

              <a
                href={`https://github.com/${cleanRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold rounded-lg border border-purple-700/60 flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở Repo GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Đồng bộ 2 chiều: Trực tiếp qua GitHub API hoặc qua Git CLI.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
