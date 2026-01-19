import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Eye, 
  Pin,
  Lock,
  Image as ImageIcon,
  Send,
  Search,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    learningLevel: string;
  };
  category: string;
  tags: string[];
  image?: {
    url: string;
  };
  voteScore: number;
  userVote?: 'up' | 'down' | null;
  replyCount: number;
  views: number;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
}

interface Reply {
  _id: string;
  author: {
    _id: string;
    name: string;
    learningLevel: string;
  };
  content: string;
  voteScore: number;
  userVote?: 'up' | 'down' | null;
  createdAt: string;
}

const levelBadges = {
  beginner: { label: 'Pemula', color: 'bg-green-100 text-green-800', icon: '🌱' },
  intermediate: { label: 'Menengah', color: 'bg-blue-100 text-blue-800', icon: '📈' },
  advanced: { label: 'Lanjut', color: 'bg-purple-100 text-purple-800', icon: '🎯' },
  teacher: { label: 'Teacher', color: 'bg-yellow-100 text-yellow-800', icon: '👨‍🏫' }
};

const categories = {
  discussion: { label: 'Diskusi', color: 'bg-blue-100 text-blue-800' },
  question: { label: 'Pertanyaan', color: 'bg-green-100 text-green-800' },
  news: { label: 'Berita', color: 'bg-red-100 text-red-800' },
  'case-study': { label: 'Studi Kasus', color: 'bg-purple-100 text-purple-800' },
  general: { label: 'Umum', color: 'bg-gray-100 text-gray-800' }
};

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [replyText, setReplyText] = useState('');
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 'discussion',
    tags: '',
    image: null as File | null
  });

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, sortBy, searchTerm]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory,
        sort: sortBy,
        search: searchTerm || undefined
      };
      const response = await forumAPI.getPosts(params);
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Gagal memuat posts');
    } finally {
      setLoading(false);
    }
  };

  const loadPostDetails = async (postId: string) => {
    try {
      const response = await forumAPI.getPost(postId);
      setSelectedPost(response.post);
      setReplies(response.post.replies || []);
    } catch (error) {
      console.error('Error loading post details:', error);
      toast.error('Gagal memuat detail post');
    }
  };
 const handleCreatePost = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) {
    toast.error('Silakan login terlebih dahulu');
    return;
  }

  try {
    // Validate required fields
    if (!postForm.title.trim()) {
      toast.error('Judul tidak boleh kosong');
      return;
    }
    if (!postForm.content.trim()) {
      toast.error('Konten tidak boleh kosong');
      return;
    }

    // Process tags
    const tagsArray = postForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 30)
      .slice(0, 5); // Limit to 5 tags

    // Create post data object (NOT FormData)
    const postData = {
      title: postForm.title.trim(),
      content: postForm.content.trim(),
      category: postForm.category,
      tags: tagsArray,
      image: postForm.image || undefined // Convert null to undefined
    };

    console.log('Sending post data:', postData);

    // Use the API function that handles FormData creation
    await forumAPI.createPost(postData);
    
    toast.success('Post berhasil dibuat!');
    setShowCreatePost(false);
    setPostForm({
      title: '',
      content: '',
      category: 'discussion',
      tags: '',
      image: null
    });
    loadPosts();
  } catch (error: any) {
    console.error('Create post error:', error);
    toast.error(error.response?.data?.error || 'Gagal membuat post');
  }
};

  const handleVote = async (postId: string, voteType: 'up' | 'down' | 'remove') => {
    if (!user) {
      toast.error('Silakan login untuk voting');
      return;
    }

    try {
      const response = await forumAPI.votePost(postId, voteType);
      
      // Update posts list
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              voteScore: response.voteScore,
              userVote: voteType === 'remove' ? null : voteType
            }
          : post
      ));

      // Update selected post if viewing details
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => prev ? {
          ...prev,
          voteScore: response.voteScore,
          userVote: voteType === 'remove' ? null : voteType
        } : null);
      }
    } catch (error) {
      toast.error('Gagal melakukan voting');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost) return;

    try {
      const response = await forumAPI.addReply(selectedPost._id, replyText);
      setReplies(prev => [...prev, response.reply]);
      setReplyText('');
      toast.success('Reply berhasil ditambahkan!');
    } catch (error) {
      toast.error('Gagal menambahkan reply');
    }
  };

  const handleVoteReply = async (replyId: string, voteType: 'up' | 'down' | 'remove') => {
    if (!user || !selectedPost) return;

    try {
      const response = await forumAPI.voteReply(selectedPost._id, replyId, voteType);
      
      setReplies(prev => prev.map(reply => 
        reply._id === replyId 
          ? { 
              ...reply, 
              voteScore: response.voteScore,
              userVote: voteType === 'remove' ? null : voteType
            }
          : reply
      ));
    } catch (error) {
      toast.error('Gagal melakukan voting');
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

  const PostCard = ({ post }: { post: Post }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
      onClick={() => loadPostDetails(post._id)}
    >
      <div className="flex items-start gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1 min-w-[50px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote(post._id, post.userVote === 'up' ? 'remove' : 'up');
            }}
            className={`p-2 rounded-lg transition-colors ${
              post.userVote === 'up' 
                ? 'bg-green-100 text-green-600' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          
          <span className={`font-bold text-sm ${
            post.voteScore > 0 ? 'text-green-600' : 
            post.voteScore < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {post.voteScore}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote(post._id, post.userVote === 'down' ? 'remove' : 'down');
            }}
            className={`p-2 rounded-lg transition-colors ${
              post.userVote === 'down' 
                ? 'bg-red-100 text-red-600' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {post.pinned && <Pin className="w-4 h-4 text-yellow-500" />}
            {post.locked && <Lock className="w-4 h-4 text-gray-500" />}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categories[post.category as keyof typeof categories]?.color}`}>
              {categories[post.category as keyof typeof categories]?.label}
            </span>
            <LevelBadge level={post.author.learningLevel} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 mb-3 line-clamp-3">
            {post.content}
          </p>

          {post.image && (
            <div className="mb-3">
              <img 
                src={post.image.url} 
                alt="Post image" 
                className="rounded-lg max-h-48 object-cover"
              />
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>oleh {post.author.name}</span>
              <span>{new Date(post.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.replyCount}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
        >
          ← Kembali ke Forum
        </button>

        {/* Post Detail */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1 min-w-[50px]">
              <button
                onClick={() => handleVote(selectedPost._id, selectedPost.userVote === 'up' ? 'remove' : 'up')}
                className={`p-2 rounded-lg transition-colors ${
                  selectedPost.userVote === 'up' 
                    ? 'bg-green-100 text-green-600' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              
              <span className={`font-bold text-lg ${
                selectedPost.voteScore > 0 ? 'text-green-600' : 
                selectedPost.voteScore < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {selectedPost.voteScore}
              </span>
              
              <button
                onClick={() => handleVote(selectedPost._id, selectedPost.userVote === 'down' ? 'remove' : 'down')}
                className={`p-2 rounded-lg transition-colors ${
                  selectedPost.userVote === 'down' 
                    ? 'bg-red-100 text-red-600' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <ArrowDown className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categories[selectedPost.category as keyof typeof categories]?.color}`}>
                  {categories[selectedPost.category as keyof typeof categories]?.label}
                </span>
                <LevelBadge level={selectedPost.author.learningLevel} />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedPost.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>oleh {selectedPost.author.name}</span>
                <span>{new Date(selectedPost.createdAt).toLocaleDateString('id-ID')}</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedPost.views} views
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>

              {selectedPost.image && (
                <div className="mb-6">
                  <img 
                    src={selectedPost.image.url} 
                    alt="Post image" 
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}

              {selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {user && !selectedPost.locked && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Tambah Balasan</h3>
            <form onSubmit={handleReply}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tulis balasan Anda..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                maxLength={500}
                required
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {replyText.length}/500 karakter
                </span>
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Kirim Balasan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Balasan ({replies.length})
          </h3>
          
          {replies.map((reply) => (
            <div key={reply._id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                  <button
                    onClick={() => handleVoteReply(reply._id, reply.userVote === 'up' ? 'remove' : 'up')}
                    className={`p-1 rounded transition-colors ${
                      reply.userVote === 'up' 
                        ? 'bg-green-100 text-green-600' 
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  
                  <span className={`font-bold text-sm ${
                    reply.voteScore > 0 ? 'text-green-600' : 
                    reply.voteScore < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {reply.voteScore}
                  </span>
                  
                  <button
                    onClick={() => handleVoteReply(reply._id, reply.userVote === 'down' ? 'remove' : 'down')}
                    className={`p-1 rounded transition-colors ${
                      reply.userVote === 'down' 
                        ? 'bg-red-100 text-red-600' 
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{reply.author.name}</span>
                    <LevelBadge level={reply.author.learningLevel} />
                    <span className="text-sm text-gray-500">
                      {new Date(reply.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
          Forum Konstitusi
        </h1>
        <p className="text-neutral-600 max-w-3xl mx-auto">
          Diskusikan topik konstitusi, ajukan pertanyaan, dan berbagi pengetahuan dengan komunitas
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">Semua Kategori</option>
          {Object.entries(categories).map(([key, cat]) => (
            <option key={key} value={key}>{cat.label}</option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="recent">Terbaru</option>
          <option value="popular">Populer</option>
          <option value="votes">Vote Tertinggi</option>
        </select>
        
        {user && (
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Post
          </button>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4">Buat Post Baru</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={200}
                    required
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {postForm.title.length}/200
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
                    maxLength={2000}
                    required
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {postForm.content.length}/2000
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      value={postForm.category}
                      onChange={(e) => setPostForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Object.entries(categories).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (pisah dengan koma)</label>
                    <input
                      type="text"
                      value={postForm.tags}
                      onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="ham, mk, amandemen"
                    />
                  </div>
                </div>
                
                {user?.learningLevel === 'teacher' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gambar (opsional - hanya untuk Teacher)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPostForm(prev => ({ 
                          ...prev, 
                          image: e.target.files?.[0] || null 
                        }))}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Pilih Gambar
                      </label>
                      {postForm.image && (
                        <span className="text-sm text-gray-600">
                          {postForm.image.name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Buat Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada post</h3>
              <p className="text-gray-500">Jadilah yang pertama membuat post di forum!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}