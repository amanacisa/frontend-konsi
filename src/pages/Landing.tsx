
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Newspaper, Video, Brain, Users, Shield, ChevronRight, UsersRound } from 'lucide-react';

export default function Landing() {
  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-600 to-primary-500 text-white overflow-hidden">
    

    {/* Hero Section */}
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-10">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-accent-400/10 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-tight">
            KONSI-TECH
          </h1>
          <div className="w-16 sm:w-24 h-1 bg-accent-400 mx-auto mb-6 sm:mb-8"></div>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-3 sm:mb-4 max-w-3xl mx-auto leading-relaxed px-2">
            Platform Edukasi Konstitusi dengan Kecerdasan Buatan
          </p>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto px-2">
            Belajar UUD 1945 secara interaktif, personal, dan menyenangkan untuk generasi digital
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 sm:mb-16"
        >
          <Link
            to="/chat"
            className="inline-flex items-center bg-accent-400 hover:bg-accent-500 text-primary-900 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Mulai Belajar <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          <Link
            to="/chat"
            className="group bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="mb-4 sm:mb-6">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-accent-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-accent-400 transition-colors duration-300">
              LexTalk
            </h3>
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              Chatbot AI seperti guru personal yang menjelaskan UUD 1945 dengan bahasa sederhana dan contoh nyata
            </p>
          </Link>

          <Link
            to="/news"
            className="group bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="mb-4 sm:mb-6">
              <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 text-accent-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-accent-400 transition-colors duration-300">
              Constitution News
            </h3>
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              Berita terkini tentang putusan, amandemen, dan kasus konstitusional yang relevan dengan pembelajaran
            </p>
          </Link>

          <Link
            to="/forum"
            className="group bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 sm:mb-6">
              <UsersRound className="w-10 h-10 sm:w-12 sm:h-12 text-accent-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-accent-400 transition-colors duration-300">
              Lex Connect
            </h3>
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              Berinteraksi dan bersosial baik antar pelajar, maupun dari pelajar ke pengajar
            </p>
          </Link>

          <Link
            to="/short-form"
            className="group bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-2xl hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 sm:mb-6">
              <Video className="w-10 h-10 sm:w-12 sm:h-12 text-accent-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-accent-400 transition-colors duration-300">
              Video Edukasi
            </h3>
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              Konten video pendek edukatif tentang konstitusi dalam format menarik dan mudah dipahami
            </p>
          </Link>
        </motion.div>
      </div>
    </div>

    {/* Features Section */}
    <div className="relative py-16 sm:py-20 lg:py-24 bg-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Mengapa KONSI-TECH?</h2>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto px-2">
            Platform yang menggabungkan teknologi AI dengan pendekatan pedagogis untuk pembelajaran konstitusi yang efektif
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center"
          >
            <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-accent-400 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Pembelajaran Adaptif</h3>
            <p className="text-white/80 text-sm sm:text-base px-2">
              Sistem yang menyesuaikan dengan level pemahaman pengguna, dari pemula hingga lanjut
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center"
          >
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-accent-400 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Partisipasi Sosial</h3>
            <p className="text-white/80 text-sm sm:text-base px-2">
              Mendorong partisipasi aktif masyarakat dalam mengawasi implementasi konstitusi
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center sm:col-span-2 lg:col-span-1"
          >
            <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-accent-400 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Perlindungan Hak</h3>
            <p className="text-white/80 text-sm sm:text-base px-2">
              Membantu masyarakat memahami dan melindungi hak-hak konstitusional mereka
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);
}