import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ExternalLink, TrendingUp, Eye } from 'lucide-react';
import { newsAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: Date;
  tags: string[];
  readTime: number;
  views: number;
  category: 'amendment' | 'court-decision' | 'analysis' | 'education';
}

const categoryColors = {
  'amendment': 'bg-blue-100 text-blue-800',
  'court-decision': 'bg-green-100 text-green-800', 
  'analysis': 'bg-purple-100 text-purple-800',
  'education': 'bg-orange-100 text-orange-800'
};

const categoryLabels = {
  'amendment': 'Amandemen',
  'court-decision': 'Putusan Pengadilan',
  'analysis': 'Analisis',
  'education': 'Edukasi'
};

export default function News() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getAll();
      setNews(response.news || []);
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Gagal memuat berita');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });


  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSelectedArticle(null)}
          className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
        >
          ← Kembali ke Daftar Berita
        </motion.button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedArticle.category]}`}>
                {categoryLabels[selectedArticle.category]}
              </span>
              {selectedArticle.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-primary-900 mb-4">{selectedArticle.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600 mb-8 pb-6 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {selectedArticle.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {selectedArticle.publishedAt.toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedArticle.readTime} min baca
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {selectedArticle.views.toLocaleString()} views
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-primary-900 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold text-primary-800 mb-3 mt-6">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold text-primary-700 mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="text-neutral-700 leading-relaxed mb-4">{children}</p>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-accent-400 pl-4 py-2 bg-accent-50 italic text-primary-800 my-6">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 text-neutral-700 mb-4">{children}</ol>,
                  strong: ({ children }) => <strong className="font-semibold text-primary-900">{children}</strong>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse border border-neutral-300">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="border border-neutral-300 px-4 py-2 bg-neutral-100 font-semibold text-left">{children}</th>,
                  td: ({ children }) => <td className="border border-neutral-300 px-4 py-2">{children}</td>,
                }}
              >
                {selectedArticle.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.article>
      </div>
    );
  }
return (
  <div className="max-w-6xl mx-auto p-4 sm:p-6">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center mb-8 sm:mb-12"
    >
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-600" />
        <span>Constitution News</span>
      </h1>
      <p className="text-neutral-600 max-w-3xl mx-auto text-sm sm:text-base px-4">
        Berita terkini tentang perkembangan konstitusi, putusan pengadilan, dan analisis mendalam tentang ketatanegaraan Indonesia
      </p>
    </motion.div>

    {/* Search and Filter */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      className="mb-6 sm:mb-8"
    >
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Cari berita..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 sm:p-4 border border-neutral-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-300"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto sm:min-w-48 p-3 sm:p-4 border border-neutral-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-300"
        >
          <option value="all">Semua Kategori</option>
          <option value="amendment">Amandemen</option>
          <option value="court-decision">Putusan Pengadilan</option>
          <option value="analysis">Analisis</option>
          <option value="education">Edukasi</option>
        </select>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        {['ham', 'mahkamah-konstitusi', 'demokrasi', 'presidensial', 'amandemen'].map(tag => (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setSearchTerm(tag)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-full text-xs sm:text-sm transition-colors duration-300"
          >
            #{tag}
          </motion.button>
        ))}
      </div>
    </motion.div>

    {/* News Grid */}
    {loading ? (
      <div className="flex items-center justify-center py-12">
        <motion.div 
          className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    ) : (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredNews.map((article, index) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.6, 
              ease: "easeOut" 
            }}
            whileHover={{ 
              scale: 1.02, 
              y: -5,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${categoryColors[article.category]}`}>
                  {categoryLabels[article.category]}
                </span>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-neutral-500">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  {article.views}
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-primary-900 mb-2 sm:mb-3 line-clamp-2 leading-tight">
                {article.title}
              </h2>
              
              <p className="text-neutral-600 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base leading-relaxed">
                {article.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {article.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 sm:px-2 sm:py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs">
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="px-2 py-0.5 sm:px-2 sm:py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs">
                    +{article.tags.length - 3} lagi
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500 pt-3 sm:pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">
                    {new Date(article.publishedAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {article.readTime}m
                  </div>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    )}

    {filteredNews.length === 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <div className="text-4xl sm:text-6xl mb-4">📰</div>
        <h3 className="text-lg sm:text-xl font-semibold text-neutral-600 mb-2">Tidak ada berita ditemukan</h3>
        <p className="text-sm sm:text-base text-neutral-500 px-4">Coba ubah kata kunci pencarian atau filter kategori</p>
      </motion.div>
    )}
  </div>
);
}