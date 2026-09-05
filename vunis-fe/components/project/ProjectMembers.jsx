import { useState, useEffect } from 'react';
import { getProjectMembers, addProjectMember, updateProjectMemberRole, removeProjectMember } from '../../services/projectService';
import { getAllUsers } from '../../services/authService';
import { Users, Mail, Plus, Shield, Check, AlertCircle, Loader2, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AVAILABLE_ROLES = [
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'FRONTEND_LEAD', label: 'Frontend Lead' },
  { value: 'FRONTEND_DEVELOPER', label: 'Frontend Developer' },
  { value: 'BACKEND_LEAD', label: 'Backend Lead' },
  { value: 'BACKEND_DEVELOPER', label: 'Backend Developer' },
  { value: 'DESIGN_LEAD', label: 'Design Lead' },
  { value: 'UI_UX_DESIGNER', label: 'UI/UX Designer' },
  { value: 'QA_LEAD', label: 'QA Lead' },
  { value: 'QA_TESTER', label: 'QA Tester' },
  { value: 'DEVOPS_LEAD', label: 'DevOps Lead' },
  { value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer' },
  { value: 'MEMBER', label: 'Member' }
];

export default function ProjectMembers({ projectId, project }) {
  const { user } = useAuth();
  const [members, setMembers] = useState(() => {
    if (Array.isArray(project?.members) && project.members.length > 0) {
      return project.members;
    }
    return [];
  });
  const [systemUsers, setSystemUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [loading, setLoading] = useState(() => (!project?.members || project.members.length === 0));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const projectOwner = project?.owner;
  const projectOwnerId = projectOwner?.id || project?.ownerId;
  const isOwner = Boolean(
    user && (
      (projectOwnerId && user.id === projectOwnerId) ||
      ['SUPER_ADMIN', 'USER_ADMIN'].includes(user.role) ||
      ['PROJECT_MANAGER', 'Owner'].includes(project?.userRole)
    )
  );

  useEffect(() => {
    if (projectId) {
      loadMembers();
      if (isOwner) {
        loadSystemUsers();
      }
    }
  }, [projectId, project?.updatedAt, isOwner]);

  const loadSystemUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setSystemUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      // Ignore if non-admin or failed
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getProjectMembers(projectId);
      let list = Array.isArray(data) ? [...data] : (data?.members || []);

      const hasOwner = list.some(m => 
        m.role === 'Owner' || 
        m.role === 'PROJECT_MANAGER' || 
        m.role === 'Project Manager'
      );

      if (!hasOwner && (projectOwner || projectOwnerId)) {
        list.unshift({
          id: `owner-${projectOwnerId || 'default'}`,
          memberId: `owner-${projectOwnerId || 'default'}`,
          userId: projectOwnerId,
          name: projectOwner?.name || 'Project Owner',
          email: projectOwner?.email || '',
          role: 'Owner'
        });
      }

      setMembers(list);
    } catch (err) {
      console.error('Error loading members:', err);
      const ownerIdToUse = projectOwnerId || project?.ownerId;
      setMembers([{
        id: `owner-${ownerIdToUse || 'default'}`,
        memberId: `owner-${ownerIdToUse || 'default'}`,
        userId: ownerIdToUse,
        name: projectOwner?.name || 'Project Owner',
        email: projectOwner?.email || '',
        role: 'Owner'
      }]);
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
      await addProjectMember(projectId, email.trim(), selectedRole);
      setMessage({ type: 'success', text: 'Member added successfully!' });
      setEmail('');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error adding member';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
      loadMembers();
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    if (!memberId || memberId.startsWith('owner-')) return;
    try {
      setActionLoadingId(memberId);
      await updateProjectMemberRole(memberId, newRole);
      setMembers(prev => prev.map(m => (m.id === memberId || m.memberId === memberId) ? { ...m, role: newRole } : m));
      setMessage({ type: 'success', text: 'Role updated successfully!' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error updating role';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleKickMember = async (memberId, memberName) => {
    if (!memberId || memberId.startsWith('owner-')) return;
    if (!window.confirm(`Are you sure you want to remove "${memberName || 'this member'}" from the project?`)) return;

    try {
      setActionLoadingId(memberId);
      await removeProjectMember(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId && m.memberId !== memberId));
      setMessage({ type: 'success', text: 'Member removed successfully!' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error removing member';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {isOwner && (
        <div className="md:col-span-1 bg-surface rounded-xl border border-border p-5 h-fit space-y-4">
          <div>
            <h3 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border">
              <Plus className="w-4 h-4 text-accent" />
              Invite New Member
            </h3>
            <p className="text-xs text-sub mt-2 font-normal leading-relaxed">
              Enter email and select role to invite a member to the project.
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="label-field">Member Email *</label>
              <div className="relative">
                <input
                  type="email"
                  list="system-user-emails"
                  placeholder="e.g.: user@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-9"
                />
                <Mail className="w-4 h-4 text-sub absolute left-3 top-2.5" />
                
                {systemUsers.length > 0 && (
                  <datalist id="system-user-emails">
                    {systemUsers
                      .filter(u => u.email && u.email !== user?.email)
                      .map(u => (
                        <option key={u.id} value={u.email}>
                          {u.name} ({u.email})
                        </option>
                      ))
                    }
                  </datalist>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-field">Initial Role *</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="input-field"
              >
                {AVAILABLE_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {message && (
              <div className={`p-3 rounded-lg border flex items-start gap-2 text-xs font-semibold leading-normal ${
                message.type === 'success'
                  ? 'bg-success-soft border-success/20 text-success'
                  : 'bg-danger-soft border-danger/20 text-danger'
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
              className="btn-primary w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Project'
              )}
            </button>
          </form>
        </div>
      )}

      <div className={`${isOwner ? 'md:col-span-2' : 'md:col-span-3'} bg-surface rounded-xl border border-border p-5 space-y-4`}>
        <div className="flex justify-between items-center pb-2.5 border-b border-border">
          <div>
            <h3 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" />
              Project Members (<span className="font-mono">{members.length}</span>)
            </h3>
            <p className="text-xs text-sub mt-1 font-normal leading-relaxed">
              List of all members currently participating in the project and their roles.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-accent" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-xs text-sub font-bold uppercase tracking-wider border border-dashed border-border rounded-xl bg-bg">
            No members in this project yet.
          </div>
        ) : (
          <div className="overflow-hidden border border-border rounded-xl bg-surface">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg border-b border-border text-[10px] text-sub uppercase tracking-wider font-extrabold">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  {isOwner && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member, idx) => {
                  const mId = member.id || member.memberId;
                  const memberRoleStr = typeof member.role === 'object' ? (member.role?.code || member.role?.name || 'MEMBER') : (member.role || 'MEMBER');
                  const isOwnerRole = memberRoleStr === 'Owner' || memberRoleStr === 'PROJECT_MANAGER' || mId?.startsWith?.('owner-');
                  const memberName = typeof member.name === 'string' ? member.name : (member.user?.name || member.email || 'Member');
                  const memberEmail = typeof member.email === 'string' ? member.email : (member.user?.email || 'Not updated');
                  const avatarUrl = member.avatar || member.user?.avatar;

                  return (
                    <tr key={mId || idx} className="hover:bg-accent-soft/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-ink flex items-center gap-2.5">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={memberName} className="w-7 h-7 rounded-full object-cover border border-border shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {(memberName || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{memberName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sub font-medium font-mono text-[11px]">
                        {memberEmail}
                      </td>
                      <td className="px-4 py-3">
                        {isOwner ? (
                          isOwnerRole ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-accent-soft text-accent border border-accent/30 uppercase tracking-wider">
                              <Shield className="w-3 h-3 text-accent" />
                              Project Owner / PM
                            </span>
                          ) : (
                            <select
                              value={memberRoleStr}
                              disabled={actionLoadingId === mId}
                              onChange={(e) => handleChangeRole(mId, e.target.value)}
                              className="input-field text-xs py-1 px-2 border-accent/20 bg-surface font-medium cursor-pointer"
                            >
                              {AVAILABLE_ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-bg text-sub border border-border uppercase tracking-wider">
                            {memberRoleStr}
                          </span>
                        )}
                      </td>
                      {isOwner && (
                        <td className="px-4 py-3 text-right">
                          {!isOwnerRole && (
                            <button
                              onClick={() => handleKickMember(mId, member.name)}
                              disabled={actionLoadingId === mId}
                              className="p-1.5 rounded-lg text-sub hover:text-danger hover:bg-danger-soft transition-colors disabled:opacity-50"
                              title="Remove from project"
                            >
                              {actionLoadingId === mId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

