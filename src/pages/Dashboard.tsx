import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  FileText, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { newsAPI, reportsAPI, statsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalChats: number;
  totalReports: number;
  totalNews: number;
  pendingReports: number;
  urgentReports: number;
}

interface NewsItem {
  _id: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  views: number;
  likes: number;
  status: string;
}

interface ReportItem {
  _id: string;
  reportId: string;
  title: string;
  category: string;
  status: string;
  urgent: boolean;
  createdAt: string;
  reporter: {
    name?: string;
  };
  anonymous: boolean;
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalChats: 0,
    totalReports: 0,
    totalNews: 0,
    pendingReports: 0,
    urgentReports: 0
  });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    summary: '',
    content: '',
    author: user?.name || '',
    category: 'education' as 'amendment' | 'court-decision' | 'analysis' | 'education',
    tags: ''
  });

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load news
      const newsResponse = await newsAPI.getAll({ limit: 10 });
      setNews(newsResponse.news || []);
      
      // Load reports
      const reportsResponse = await reportsAPI.getAll({ limit: 10 });
      setReports(reportsResponse.reports || []);
      
      // Mock stats (in real app, create dedicated endpoint)
       
      const statsResponse = await statsAPI.getAdminStats();
      // access the data property
      setStats(statsResponse.data || {
        totalUsers: 0,
        totalChats: 0,
        totalReports: 0,
        totalNews: 0,
        pendingReports: 0,
        urgentReports: 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
       setStats({
      totalUsers: 0,
      totalChats: 0,
      totalReports: 0,
      totalNews: 0,
      pendingReports: 0,
      urgentReports: 0
    });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = newsForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await newsAPI.create({
        ...newsForm,
        tags: tagsArray
      });
      
      toast.success('Berita berhasil dibuat!');
      setShowNewsForm(false);
      setNewsForm({
        title: '',
        summary: '',
        content: '',
        author: user?.name || '',
        category: 'education',
        tags: ''
      });
      loadDashboardData();
    } catch (error) {
      toast.error('Gagal membuat berita');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus berita ini?')) {
      try {
        await newsAPI.delete(id);
        toast.success('Berita berhasil dihapus');
        loadDashboardData();
      } catch (error) {
        toast.error('Gagal menghapus berita');
      }
    }
  };

  const handleUpdateReportStatus = async (id: string, status: string) => {
    try {
      await reportsAPI.updateStatus(id, status);
      toast.success('Status laporan berhasil diupdate');
      loadDashboardData();
    } catch (error) {
      toast.error('Gagal mengupdate status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Akses Ditolak</h2>
          <p className="text-neutral-600">Halaman ini hanya dapat diakses oleh admin.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Dashboard Admin</h1>
        <p className="text-neutral-600">Kelola konten dan monitor aktivitas platform</p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'news', label: 'Berita', icon: FileText },
              { id: 'reports', label: 'Laporan', icon: MessageCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Stats Cards */}

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
              { label: 'Total Chats', value: stats?.totalChats || 0, icon: MessageCircle, color: 'green' },
              { label: 'Total Berita', value: stats?.totalNews || 0, icon: FileText, color: 'purple' },
              { label: 'Laporan Pending', value: stats?.pendingReports || 0, icon: Clock, color: 'orange' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-600 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {(stat.value || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Berita Terbaru</h3>
              <div className="space-y-4">
                {news.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900 text-sm">{item.title}</h4>
                      <p className="text-neutral-600 text-xs">{new Date(item.publishedAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Eye className="w-3 h-3" />
                      {item.views}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Laporan Terbaru</h3>
              <div className="space-y-4">
                {reports.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900 text-sm">{item.title}</h4>
                      <p className="text-neutral-600 text-xs">
                        {item.anonymous ? 'Anonim' : item.reporter.name} • {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.urgent && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        item.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-neutral-900">Kelola Berita</h2>
            <button
              onClick={() => setShowNewsForm(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Berita
            </button>
          </div>

          {/* News Form Modal */}
          {showNewsForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Tambah Berita Baru</h3>
                <form onSubmit={handleCreateNews} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Judul</label>
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Ringkasan</label>
                    <textarea
                      value={newsForm.summary}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, summary: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Konten (Markdown)</label>
                    <textarea
                      value={newsForm.content}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-40"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Kategori</label>
                      <select
                        value={newsForm.category}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="education">Edukasi</option>
                        <option value="amendment">Amandemen</option>
                        <option value="court-decision">Putusan Pengadilan</option>
                        <option value="analysis">Analisis</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Tags (pisah dengan koma)</label>
                      <input
                        type="text"
                        value={newsForm.tags}
                        onChange={(e) => setNewsForm(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="ham, mk, amandemen"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg transition-colors"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewsForm(false)}
                      className="flex-1 bg-neutral-300 hover:bg-neutral-400 text-neutral-700 py-3 rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* News List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Penulis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {news.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{item.title}</div>
                        <div className="text-sm text-neutral-500">{item.summary.substring(0, 60)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{item.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(item.publishedAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{item.views}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteNews(item._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-neutral-900">Kelola Laporan</h2>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Pelapor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {reports.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-neutral-900">{item.reportId}</span>
                          {item.urgent && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{item.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {item.anonymous ? 'Anonim' : item.reporter.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          item.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'investigating' ? 'bg-purple-100 text-purple-800' :
                          item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateReportStatus(item._id, 'in_review')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Review"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {item.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateReportStatus(item._id, 'resolved')}
                              className="text-green-600 hover:text-green-900"
                              title="Resolve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}