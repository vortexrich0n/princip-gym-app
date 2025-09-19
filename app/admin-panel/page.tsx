'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, UserCheck, TrendingUp, Activity, LogOut, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  membershipStatus: 'active' | 'inactive' | 'expired';
  membershipExpiry: string | null;
}

interface CheckIn {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  checkInTime: string;
  method: 'QR' | 'MANUAL';
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'checkins'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Statistics
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    todayCheckIns: 0,
    monthlyCheckIns: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'admin') {
      promptLogin();
    } else {
      setIsAuthenticated(true);
      fetchData();
    }
  };

  const promptLogin = () => {
    const email = prompt('Admin Email:');
    const password = prompt('Admin Password:');

    if (email && password) {
      loginAdmin(email, password);
    } else {
      router.push('/');
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        setIsAuthenticated(true);
        fetchData();
      } else {
        alert('Invalid admin credentials or not an admin account');
        router.push('/');
      }
    } catch (err) {
      alert('Login failed');
      router.push('/');
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setLoading(true);
    try {
      // Fetch users
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);

        // Calculate stats
        const active = usersData.users?.filter((u: User) => u.membershipStatus === 'active').length || 0;
        setStats(prev => ({
          ...prev,
          totalMembers: usersData.users?.length || 0,
          activeMembers: active
        }));
      }

      // Fetch check-ins
      const checkInsResponse = await fetch(`/api/admin/checkins?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (checkInsResponse.ok) {
        const checkInsData = await checkInsResponse.json();
        setCheckIns(checkInsData.checkIns || []);

        // Calculate check-in stats
        const today = new Date().toISOString().split('T')[0];
        const todayCount = checkInsData.checkIns?.filter((c: CheckIn) =>
          c.checkInTime.split('T')[0] === today
        ).length || 0;

        setStats(prev => ({
          ...prev,
          todayCheckIns: todayCount,
          monthlyCheckIns: checkInsData.monthlyTotal || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMembership = async (userId: string, days: number) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/membership`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extendDays: days }),
      });

      if (response.ok) {
        alert(`Membership ${days > 0 ? 'extended' : 'deactivated'} successfully`);
        fetchData();
      }
    } catch (error) {
      alert('Failed to update membership');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'checkins') {
      fetchData();
    }
  }, [selectedDate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <p className="text-xl">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 mt-1">KBK Princip Management System</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'members'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Members
          </button>
          <button
            onClick={() => setActiveTab('checkins')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'checkins'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Check-ins
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-red-500" />
                    <span className="text-3xl font-bold">{stats.totalMembers}</span>
                  </div>
                  <p className="text-gray-400">Total Members</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-green-500" />
                    <span className="text-3xl font-bold">{stats.activeMembers}</span>
                  </div>
                  <p className="text-gray-400">Active Members</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <UserCheck className="w-8 h-8 text-blue-500" />
                    <span className="text-3xl font-bold">{stats.todayCheckIns}</span>
                  </div>
                  <p className="text-gray-400">Today\'s Check-ins</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-purple-500" />
                    <span className="text-3xl font-bold">{stats.monthlyCheckIns}</span>
                  </div>
                  <p className="text-gray-400">Monthly Check-ins</p>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="bg-gray-800/50 backdrop-blur rounded-xl overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{user.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.membershipStatus === 'active'
                                ? 'bg-green-900/50 text-green-400 border border-green-700'
                                : 'bg-red-900/50 text-red-400 border border-red-700'
                            }`}>
                              {user.membershipStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {user.membershipExpiry
                              ? new Date(user.membershipExpiry).toLocaleDateString('sr-RS')
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateMembership(user.id, 30)}
                                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors"
                              >
                                +30 days
                              </button>
                              <button
                                onClick={() => updateMembership(user.id, 0)}
                                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs transition-colors"
                              >
                                Deactivate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Check-ins Tab */}
            {activeTab === 'checkins' && (
              <div>
                <div className="mb-6 bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
                  <label className="block text-sm font-medium mb-2">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-xl overflow-hidden border border-gray-700">
                  <div className="p-4 bg-gray-900/50 border-b border-gray-700">
                    <h3 className="text-lg font-semibold">
                      Check-ins for {new Date(selectedDate).toLocaleDateString('sr-RS', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>

                  {checkIns.filter(c => c.checkInTime.split('T')[0] === selectedDate).length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No check-ins recorded for this date
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {checkIns
                            .filter(c => c.checkInTime.split('T')[0] === selectedDate)
                            .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
                            .map((checkIn) => (
                              <tr key={checkIn.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {new Date(checkIn.checkInTime).toLocaleTimeString('sr-RS', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {checkIn.userName || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {checkIn.userEmail}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    checkIn.method === 'QR'
                                      ? 'bg-blue-900/50 text-blue-400'
                                      : 'bg-gray-700 text-gray-400'
                                  }`}>
                                    {checkIn.method}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Total check-ins: <span className="font-semibold text-white">
                        {checkIns.filter(c => c.checkInTime.split('T')[0] === selectedDate).length}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}