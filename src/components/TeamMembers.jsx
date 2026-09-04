import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchTeamMembers } from '../data/storage';

function TeamMembers({ currentUser }) {
  const location = useLocation();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    try {
      setLoading(true);
      setError('');

      const data = await fetchTeamMembers(currentUser.id);
      if (isMounted) {
        setMembers(data || []);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    loadMembers();
  }, [location.pathname, loadMembers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              👥
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Team Members
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                View people in your team workspace.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <span className="mt-0.5 shrink-0">⚠</span>
            <p>{error}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {loading && (
            <div className="flex min-h-65 items-center justify-center px-5 py-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
                <p className="text-sm font-medium text-gray-600">
                  Loading team members...
                </p>
              </div>
            </div>
          )}

          {!loading && members.length === 0 && (
            <div className="flex min-h-80 flex-col items-center justify-center px-5 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                👥
              </div>
              <h3 className="mt-5 text-base font-semibold text-gray-900">
                No team members found
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                There are currently no other members in your team workspace.
              </p>
            </div>
          )}

          {!loading && members.length > 0 && (
            <div className="divide-y divide-gray-100">
              {members.map((member) => (
                <div
                  key={member.id || member.user_id}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {(member.name || 'Member')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {member.name || 'Team Member'}
                      </p>
                    </div>
                  </div>
                  {member.role && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 capitalize">
                      {member.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default TeamMembers;