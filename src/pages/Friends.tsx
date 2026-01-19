import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search,
  Send,
  Check,
  X,
  Award,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { friendsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Friend {
  _id: string;
  name: string;
  learningLevel: string;
}

interface FriendRequest {
  _id: string;
  requester?: Friend;
  recipient?: Friend;
  status: string;
  requestedAt: string;
}

interface SearchUser extends Friend {
  friendshipStatus: string;
}

const levelBadges = {
  beginner: { label: 'Pemula', color: 'bg-green-100 text-green-800', icon: '🌱' },
  intermediate: { label: 'Menengah', color: 'bg-blue-100 text-blue-800', icon: '📈' },
  advanced: { label: 'Lanjut', color: 'bg-purple-100 text-purple-800', icon: '🎯' },
  teacher: { label: 'Teacher', color: 'bg-yellow-100 text-yellow-800', icon: '👨‍🏫' }
};

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<{
    sent: FriendRequest[];
    received: FriendRequest[];
  }>({ sent: [], received: [] });
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const loadFriends = async () => {
    try {
      const response = await friendsAPI.getFriends();
      setFriends(response.friends || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await friendsAPI.getFriendRequests();
      setFriendRequests(response);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await friendsAPI.searchUsers(searchTerm);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      await friendsAPI.sendFriendRequest(userId);
      toast.success('Friend request berhasil dikirim!');
      
      // Update search results
      setSearchResults(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, friendshipStatus: 'sent' }
          : user
      ));
      
      loadFriendRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengirim friend request');
    }
  };

  const respondToFriendRequest = async (friendshipId: string, action: 'accept' | 'decline') => {
    try {
      await friendsAPI.respondToFriendRequest(friendshipId, action);
      toast.success(`Friend request ${action === 'accept' ? 'diterima' : 'ditolak'}!`);
      
      loadFriends();
      loadFriendRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal merespons friend request');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (window.confirm('Yakin ingin menghapus teman ini?')) {
      try {
        await friendsAPI.removeFriend(friendshipId);
        toast.success('Teman berhasil dihapus');
        loadFriends();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Gagal menghapus teman');
      }
    }
  };

  const LevelBadge = ({ level }: { level: string }) => {
    const badge = levelBadges[level as keyof typeof levelBadges] || levelBadges.beginner;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <span>{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Diperlukan</h2>
          <p className="text-gray-600">Silakan login untuk mengakses fitur teman.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-4 flex items-center justify-center gap-3">
          <Users className="w-10 h-10 text-primary-600" />
          Teman & Komunitas
        </h1>
        <p className="text-neutral-600 max-w-3xl mx-auto">
          Terhubung dengan sesama pelajar konstitusi, berbagi pengetahuan, dan bangun komunitas belajar
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{friends.length}</div>
          <div className="text-gray-600">Teman</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{friendRequests.received.length}</div>
          <div className="text-gray-600">Request Masuk</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Send className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{friendRequests.sent.length}</div>
          <div className="text-gray-600">Request Terkirim</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'friends', label: 'Teman Saya', icon: Users },
              { id: 'requests', label: 'Friend Requests', icon: UserPlus },
              { id: 'search', label: 'Cari Teman', icon: Search }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada teman</h3>
              <p className="text-gray-500 mb-4">Mulai cari dan tambahkan teman untuk membangun komunitas belajar</p>
              <button
                onClick={() => setActiveTab('search')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cari Teman
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{friend.name}</h3>
                  <LevelBadge level={friend.learningLevel} />
                  
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                    <button
                      onClick={() => removeFriend(friend._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Received Requests */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Request Masuk ({friendRequests.received.length})
            </h3>
            
            {friendRequests.received.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada friend request masuk</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {friendRequests.received.map((request) => (
                  <div key={request._id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {request.requester?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{request.requester?.name}</h4>
                        <LevelBadge level={request.requester?.learningLevel || 'beginner'} />
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(request.requestedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToFriendRequest(request._id, 'accept')}
                          className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => respondToFriendRequest(request._id, 'decline')}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Request Terkirim ({friendRequests.sent.length})
            </h3>
            
            {friendRequests.sent.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada friend request terkirim</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {friendRequests.sent.map((request) => (
                  <div key={request._id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {request.recipient?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{request.recipient?.name}</h4>
                        <LevelBadge level={request.recipient?.learningLevel || 'beginner'} />
                        <p className="text-sm text-gray-500 mt-1">
                          Dikirim {new Date(request.requestedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
                        Pending
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
            />
          </div>

          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Masukkan minimal 2 karakter untuk mencari</p>
            </div>
          )}

          {searchResults.length === 0 && searchTerm.length >= 2 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada pengguna ditemukan</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{user.name}</h3>
                  <LevelBadge level={user.learningLevel} />
                  
                  <div className="mt-4">
                    {user.friendshipStatus === 'none' && (
                      <button
                        onClick={() => sendFriendRequest(user._id)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Tambah Teman
                      </button>
                    )}
                    
                    {user.friendshipStatus === 'sent' && (
                      <div className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Request Terkirim
                      </div>
                    )}
                    
                    {user.friendshipStatus === 'friends' && (
                      <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Sudah Berteman
                      </div>
                    )}
                    
                    {user.friendshipStatus === 'received' && (
                      <div className="w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Menunggu Respons
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}