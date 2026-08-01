// Reading this as: Project Members component for team collaboration, with a calm, high-density light minimalist language, leaning toward Tailwind UI + Geist/Outfit + fluid glassmorphism accents.
// DESIGN_VARIANCE: 5, MOTION_INTENSITY: 4, VISUAL_DENSITY: 7

import { useState, useEffect } from 'react';
import { getProjectMembers, addProjectMember } from '../../services/projectService';
import { Users, Mail, Plus, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ProjectMembers({ projectId, projectOwnerId }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const isOwner = true; // Cho phép tạo & mời thành viên vào dự án

  useEffect(() => {
    if (projectId) {
      loadMembers();
    }
  }, [projectId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getProjectMembers(projectId);
      let list = Array.isArray(data) ? [...data] : [];

      // Fallback: Đảm bảo Chủ dự án luôn có mặt trong danh sách
      const hasOwner = list.some(m => m.role === 'Owner' || m.role === 'PROJECT_MANAGER' || m.id === projectOwnerId || m.id === user?.id);
      if (!hasOwner && (projectOwnerId || user)) {
        list.unshift({
          id: projectOwnerId || user?.id || 'owner-default',
          name: user?.name || 'Chủ dự án',
          email: user?.email || 'owner@workspace.com',
          role: 'Owner'
        });
      }
      setMembers(list);
    } catch (err) {
      console.error('Lỗi lấy danh sách thành viên:', err);
      if (user) {
        setMembers([{
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'Owner'
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      setMessage(null);
      await addProjectMember(projectId, email.trim());
      setMessage({ type: 'success', text: 'Thêm thành viên vào dự án thành công!' });
      setEmail('');
      loadMembers();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* LEFT COLUMN: INVITE FORM */}
      {isOwner && (
        <div className="md:col-span-1 bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm h-fit space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b-2 border-slate-200">
              <Plus className="w-4 h-4 text-indigo-600" />
              Mời thành viên
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed">
              Nhập địa chỉ email của thành viên bạn muốn thêm vào dự án này.
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email thành viên *</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="VD: user@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-slate-300 rounded-lg text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg border-2 flex items-start gap-2 text-xs font-bold leading-normal ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {message.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                'Thêm vào dự án'
              )}
            </button>
          </form>
        </div>
      )}

      {/* RIGHT COLUMN: MEMBERS LIST */}
      <div className={`${isOwner ? 'md:col-span-2' : 'md:col-span-3'} bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm space-y-4`}>
        <div className="flex justify-between items-center pb-2.5 border-b-2 border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Thành viên dự án ({members.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
              Những người tham gia thực hiện các công việc trong dự án này.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold uppercase tracking-wider border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
            Không có thành viên nào trong dự án.
          </div>
        ) : (
          <div className="overflow-hidden border-2 border-slate-300 rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-[10px] text-slate-700 uppercase tracking-wider font-extrabold">
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-right">Vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span>{member.name || 'Thành viên'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.role === 'Owner' || member.role === 'PROJECT_MANAGER' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-extrabold rounded-md bg-indigo-100 text-indigo-900 border-2 border-indigo-300 uppercase tracking-wider">
                          <Shield className="w-3 h-3 text-indigo-600" />
                          Chủ dự án / PM
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-800 border-2 border-slate-300 uppercase tracking-wider">
                          {member.role || 'Thành viên'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
