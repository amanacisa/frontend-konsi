import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Heart,
  Eye,
  Share2,
  Send,
  X,
  Upload,
  Newspaper,
  Play,
  Pause,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ShortFormContent {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  author_name: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  liked?: boolean;
  created_at: string;
  status: string;
}

const categories = {
  education: { label: 'Edukasi', color: 'bg-blue-500' },
  news: { label: 'Berita', color: 'bg-red-500' },
  tips: { label: 'Tips', color: 'bg-green-500' },
  'case-study': { label: 'Studi Kasus', color: 'bg-purple-500' },
  other: { label: 'Lainnya', color: 'bg-gray-500' }
};

export default function ShortForm() {
  const { user } = useAuth();
  const [contents, setContents] = useState<ShortFormContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    video_url: '',
    category: 'education',
    tags: ''
  });
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContents();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_BACKEND_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/short-form?status=approved&limit=50`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) throw new Error('Failed to load content');

      const data = await response.json();
      setContents(data.contents || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Gagal memuat konten');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string) => {
    if (!user) {
      toast.error('Login dulu untuk like');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/short-form/${contentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to like');

      const data = await response.json();

      setContents(prev => prev.map(content =>
        content.id === contentId
          ? { ...content, liked: data.liked, likes: data.likes }
          : content
      ));
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Login dulu untuk upload');
      return;
    }

    if (!uploadForm.video_url.trim()) {
      toast.error('URL video harus diisi');
      return;
    }

    setUploading(true);

    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL;
      const token = localStorage.getItem('token');

      const tagsArray = uploadForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`${API_URL}/short-form`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...uploadForm,
          tags: tagsArray
        })
      });

      if (!response.ok) throw new Error('Failed to upload');

      toast.success('Konten berhasil diupload! Menunggu moderasi admin.');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        video_url: '',
        category: 'education',
        tags: ''
      });
      loadContents();
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Gagal upload konten');
    } finally {
      setUploading(false);
    }
  };

  const handleShare = (content: ShortFormContent) => {
    if (navigator.share) {
      navigator.share({
        title: content.title,
        text: content.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link disalin ke clipboard');
    }
  };

  const goToNext = () => {
    if (currentIndex < contents.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const currentContent = contents[currentIndex];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" ref={containerRef}>
      {/* News Button - Fixed Position */}
      <Link
        to="/news"
        className="fixed top-20 right-4 z-50 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all"
      >
        <Newspaper className="w-5 h-5" />
      </Link>

      {/* Upload Button */}
      {user && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowUploadModal(true)}
          className="fixed bottom-24 right-4 z-50 bg-accent-400 hover:bg-accent-500 text-primary-900 p-4 rounded-full shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Content Display */}
      {contents.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-white p-6">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold mb-2">Belum ada konten</h3>
          <p className="text-white/70 text-center mb-6">Jadilah yang pertama berbagi konten edukatif!</p>
          {user && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-accent-400 hover:bg-accent-500 text-primary-900 px-6 py-3 rounded-full font-semibold"
            >
              Upload Konten
            </button>
          )}
        </div>
      ) : currentContent && (
        <div className="relative h-full w-full max-w-md mx-auto">
          {/* Video Player */}
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={currentContent.video_url}
              className="w-full h-full object-contain"
              loop
              playsInline
              autoPlay
              onClick={handleVideoClick}
            />

            {/* Play/Pause Overlay */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-black/50 rounded-full p-6">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrev}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          )}

          {currentIndex < contents.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}

          {/* Content Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex gap-4">
              {/* Info Section */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categories[currentContent.category as keyof typeof categories]?.color} text-white`}>
                    {categories[currentContent.category as keyof typeof categories]?.label}
                  </span>
                  <span className="text-xs text-white/70">
                    {currentIndex + 1} / {contents.length}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-1 line-clamp-2">
                  {currentContent.title}
                </h3>

                <p className="text-sm text-white/90 mb-2 line-clamp-2">
                  {currentContent.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-white/70">
                  <span>@{currentContent.author_name}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {currentContent.views.toLocaleString()}
                  </span>
                </div>

                {currentContent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentContent.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-accent-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 items-center">
                <button
                  onClick={() => handleLike(currentContent.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    className={`p-3 rounded-full ${currentContent.liked ? 'bg-red-500' : 'bg-white/20'} backdrop-blur-sm`}
                  >
                    <Heart
                      className={`w-6 h-6 ${currentContent.liked ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </motion.div>
                  <span className="text-white text-xs font-medium">
                    {currentContent.likes}
                  </span>
                </button>

                <button
                  onClick={() => handleShare(currentContent)}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <Share2 className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="text-white text-xs font-medium">
                    Bagikan
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
                <h3 className="text-lg font-semibold text-neutral-900">Upload Konten</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Judul menarik untuk konten Anda"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Ceritakan tentang konten Anda"
                    rows={3}
                    maxLength={500}
                    required
                  />
                  <div className="text-right text-xs text-neutral-500 mt-1">
                    {uploadForm.description.length}/500
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    URL Video
                  </label>
                  <input
                    type="url"
                    value={uploadForm.video_url}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, video_url: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/video.mp4"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Link video dari hosting (MP4, WebM, dll)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tags (pisah dengan koma)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="konstitusi, ham, edukasi"
                  />
                </div>

                <div className="bg-accent-50 border border-accent-200 rounded-xl p-3">
                  <p className="text-xs text-accent-900">
                    Konten akan direview oleh admin sebelum ditampilkan ke publik
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Upload Konten
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
