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

  const isOwner = user?.id === projectOwnerId;

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách thành viên:', err);
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
        <div className="md:col-span-1 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-5 shadow-sm h-fit space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Mời thành viên
            </h3>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-relaxed">
              Nhập địa chỉ email của thành viên bạn muốn thêm vào dự án này.
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email thành viên</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="VD: user@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-semibold"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl border flex items-start gap-2 text-[11px] font-semibold leading-normal ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
                {message.type === 'success' ? (
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
      <div className={`${isOwner ? 'md:col-span-2' : 'md:col-span-3'} bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Thành viên dự án ({members.length})
            </h3>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-relaxed">
              Những người tham gia thực hiện các công việc trong dự án này.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wider border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
            Không có thành viên nào trong dự án.
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200/60 rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200/60 text-[10px] text-slate-450 uppercase tracking-widest font-black">
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-right">Vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.role === 'Owner' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 text-[9px] font-black rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white uppercase tracking-wider shadow-sm shadow-indigo-600/10">
                          <Shield className="w-2.5 h-2.5" />
                          Chủ dự án
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 text-[9px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                          Thành viên
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
