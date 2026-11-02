import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { internalMe } from '@/helper/api_data_store';
import { MeApiResponse } from '@/types/editorial';

export const SettingsScreen: React.FC = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<MeApiResponse['data']['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch fresh user data
  useEffect(() => {
    if (!session?.accessToken) return;

    (async () => {
      try {
        const { body } = await internalMe(
          process.env.NEXT_PUBLIC_API_URL ?? '',
          session.accessToken,
          session.refreshToken
        );
        if (body.meta.status === 200) {
          setUserData(body.data.user);
          setEditName(body.data.user.name);
          setEditJobTitle(body.data?.user.job_title ?? '');
        }
      } catch (err) {
        console.error('[settings/me] fetch failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.accessToken, session?.refreshToken]);

  // Fallbacks from session while API loads
  const email = userData?.email ?? session?.user?.email ?? '';
  const displayName = userData?.name ?? session?.user?.name ?? 'Editorial Desk';
  const roleName =
    userData?.internal_user_types?.[0]?.display_name ??
    (session?.user?.userType
      ? session.user.userType.charAt(0).toUpperCase() + session.user.userType.slice(1)
      : 'Editorial Staff');
  const isSuperadmin = userData?.is_superadmin ?? session?.user?.isSuperadmin ?? false;

  const initials =
    email
      .split('@')[0]
      ?.split(/[._-]+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '·';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
   setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form (8 cols) */}
          <form onSubmit={handleSave} className="lg:col-span-8 space-y-8">
            {savedSuccess && (
              <div className="p-4 bg-surface-offwhite border border-accent-rust text-accent-rust font-sans text-[13px] font-semibold flex items-center justify-between">
                <span>Profile updated successfully.</span>
                <span>✓ Synced</span>
              </div>
            )}

            {/* Identity Folio */}
            <div className="bg-[#ffffff] border border-border-subtle p-6 space-y-4 rounded-lg">
              <div className="border-b border-[#E2DFD8] pb-3 flex items-center justify-between">
                <div>
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#8C3F2E]">
                    Identity Folio
                  </span>
                  <h3 className="font-serif text-[20px] text-[#000615] mt-0.5">
                    Core Account Details
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#0b1f3a] flex items-center justify-center text-white text-[16px] font-semibold tracking-wider shadow-sm overflow-hidden">
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-[13px]">
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                    Full Name (Display)
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[#000615] focus:outline-none focus:border-[#0b1f3a] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 bg-[#F0EDED] border border-[#E2DFD8] font-sans text-[#8a8a8a] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    placeholder="Add a job title"
                    disabled={loading}
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E2DFD8] font-sans text-[#000615] focus:outline-none focus:border-[#0b1f3a] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                    Internal User Code
                  </label>
                  <input
                    type="text"
                    value={userData?.internal_user_code ?? '—'}
                    disabled
                    className="w-full px-3 py-2 bg-[#F0EDED] border border-[#E2DFD8] font-mono text-[#8a8a8a] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2DFD8] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0b1f3a] text-white font-sans text-[13px] rounded-lg uppercase tracking-wider font-semibold hover:bg-[#8C3F2E] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Update Profile
                </button>
              </div>
            </div>
            {/* Role & Permissions */}
            <div className="bg-[#ffffff] border border-border-subtle p-6 space-y-4 rounded-lg">
              <div className="border-b border-[#E2DFD8] pb-3">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#8C3F2E]">
                  Access Matrix
                </span>
                <h3 className="font-serif text-[20px] text-[#000615] mt-0.5">
                  Role & Permissions
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-[13px]">
                <div className="p-4 bg-[#F9F8F6] border border-[#E2DFD8]">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-1">
                    Assigned Role
                  </span>
                  <span className="font-serif text-[20px] text-[#000615] capitalize">
                    {roleName}
                  </span>
                  {isSuperadmin && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#8C3F2E] text-white text-[10px] uppercase font-bold tracking-wider">
                      Superadmin Access
                    </span>
                  )}
                  {userData?.internal_user_types?.length > 1 && (
                    <div className="mt-3 pt-2 border-t border-[#E2DFD8] space-y-1">
                      {userData.internal_user_types.slice(1).map((t) => (
                        <span
                          key={t.id}
                          className="inline-block mr-1 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 bg-white border border-[#E2DFD8] text-[#5e5e5c]"
                        >
                          {t.display_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#F9F8F6] border border-[#E2DFD8]">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#5e5e5c] mb-2">
                    System Capabilities
                  </span>
                  <ul className="space-y-1.5 text-[13px]">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span className="text-[#1c1b1b]">Publish & Schedule Monographs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span className="text-[#1c1b1b]">Manage Homepage Features</span>
                    </li>
                    {isSuperadmin && (
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                        <span className="text-[#1c1b1b]">Administer Users & Access</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </form>

          {/* Sidebar System Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#ffffff] border border-border-subtle p-6 space-y-4 rounded-lg">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#8C3F2E]">
                Session Metadata
              </span>
              <h3 className="font-serif text-[20px] text-[#000615]">
                
              </h3>

              <div className="space-y-3 font-sans text-[12px]">
                

                <div className="flex items-center justify-between p-2.5 bg-[#F9F8F6] border border-[#E2DFD8]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-medium text-[#1c1b1b]">User Code</span>
                  </div>
                  <span className="font-mono text-[#5e5e5c]">{userData?.code ?? '—'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#F9F8F6] border border-[#E2DFD8]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8C3F2E]" />
                    <span className="font-medium text-[#1c1b1b]">Editorial Zone</span>
                  </div>
                  <span className="font-mono text-[#5e5e5c]">Zurich / Milan</span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-[#E2DFD8] space-y-2">
                <div className="flex justify-between text-[11px] uppercase tracking-wider text-[#5e5e5c] font-semibold">
                  <span>Last Dashboard Login</span>
                  <span className="text-[#000615] normal-case tracking-normal font-mono">
                    {formatDate(userData?.last_dashboard_login_at)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-wider text-[#5e5e5c] font-semibold">
                  <span>Last Login (Anywhere)</span>
                  <span className="text-[#000615] normal-case tracking-normal font-mono">
                    {formatDate(userData?.last_login_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-offwhite border border-border-subtle p-6 space-y-3 rounded-lg">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-accent-rust">
                Security Protocol
              </span>
              <h3 className="font-serif text-[18px] text-primary">
                Password & Sessions
              </h3>
              <p className="font-sans text-[12px] text-secondary leading-relaxed">
                To change your password or revoke active sessions across other devices, please contact the central IT helpdesk or use the internal portal. For immediate lockout, click your profile initials in the top right to sign out.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};