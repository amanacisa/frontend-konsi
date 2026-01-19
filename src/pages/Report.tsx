import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, AlertCircle, CheckCircle2, Upload, X, MapPin, User, Phone, Mail } from 'lucide-react';
import { reportsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ReportForm {
  reporter: {
    name: string;
    contact: string;
    email: string;
  };
  category: 'intolerance' | 'discrimination' | 'rights_violation' | 'corruption' | 'other';
  location: string;
  title: string;
  description: string;
  urgent: boolean;
  anonymous: boolean;
}

const categories = {
  intolerance: {
    label: 'Intoleransi',
    description: 'Tindakan tidak toleran terhadap perbedaan agama, suku, atau keyakinan',
    icon: '⚡',
    color: 'red'
  },
  discrimination: {
    label: 'Diskriminasi',
    description: 'Perlakuan tidak adil berdasarkan identitas tertentu',
    icon: '⚖️',
    color: 'orange'  
  },
  rights_violation: {
    label: 'Pelanggaran HAM',
    description: 'Pelanggaran hak asasi manusia yang dijamin konstitusi',
    icon: '🛡️',
    color: 'purple'
  },
  corruption: {
    label: 'Korupsi',
    description: 'Penyalahgunaan kekuasaan untuk kepentingan pribadi',
    icon: '💰',
    color: 'green'
  },
  other: {
    label: 'Lainnya',
    description: 'Isu konstitusional lainnya yang perlu perhatian',
    icon: '📋',
    color: 'blue'
  }
};

const colorClasses = {
  red: 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700',
  orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700',
  purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700',
  green: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700',
  blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'
};

export default function Report() {
  const [form, setForm] = useState<ReportForm>({
    reporter: {
      name: '',
      contact: '',
      email: ''
    },
    category: 'intolerance',
    location: '',
    title: '',
    description: '',
    urgent: false,
    anonymous: false
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (!form.anonymous && (!form.reporter.name.trim() || !form.reporter.contact.trim())) {
      toast.error('Mohon lengkapi data pelapor atau pilih lapor anonim');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('reporter', JSON.stringify(form.reporter));
      formData.append('category', form.category);
      formData.append('location', form.location);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('urgent', form.urgent.toString());
      formData.append('anonymous', form.anonymous.toString());
      
      // Add attachments
      attachments.forEach((file, _) => {
        formData.append('attachments', file);
      });
      
      const response = await reportsAPI.create(formData);
      
      setSubmitted(true);
      toast.success(`Laporan berhasil dikirim! ID: ${response.reportId}`);
      
      // Reset form
      setTimeout(() => {
        setForm({
          reporter: { name: '', contact: '', email: '' },
          category: 'intolerance',
          location: '',
          title: '',
          description: '',
          urgent: false,
          anonymous: false
        });
        setAttachments([]);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal mengirim laporan. Silakan coba lagi.');
    }
    
    setIsSubmitting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} tidak didukung. Gunakan JPG, PNG, atau PDF.`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} terlalu besar. Maksimal 5MB.`);
        return false;
      }
      
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Laporan Berhasil Dikirim!</h2>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            Terima kasih atas partisipasi Anda dalam menjaga konstitusi Indonesia. 
            Tim kami akan meninjau laporan dan menindaklanjuti sesuai prosedur yang berlaku.
          </p>
          
          <div className="bg-primary-50 rounded-xl p-4 mb-6">
            <p className="text-primary-800 font-medium">📱 Nomor Referensi: <span className="font-mono">LT-{Date.now().toString().slice(-6)}</span></p>
            <p className="text-primary-700 text-sm mt-1">Simpan nomor ini untuk tracking laporan</p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-neutral-500"
          >
            Halaman akan reset dalam beberapa detik...
          </motion.div>
        </motion.div>
      </div>
    );
  }
return (
  <div className="max-w-4xl mx-auto p-4 sm:p-6">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center mb-8 sm:mb-12"
    >
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-600" />
        <span>Lex Tracker</span>
      </h1>
      <p className="text-neutral-600 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base px-4">
        Laporkan kasus intoleransi, diskriminasi, atau pelanggaran hak konstitusional. 
        Laporan Anda akan ditindaklanjuti oleh tim ahli dan diteruskan ke instansi terkait.
      </p>
    </motion.div>

    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
      {/* Information Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="lg:col-span-1 space-y-4 sm:space-y-6"
      >
        <div className="bg-primary-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="font-semibold text-primary-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Informasi Penting
          </h3>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-primary-800">
            <li className="flex items-start gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span>Laporan bersifat rahasia dan akan ditangani profesional</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span>Tim akan merespons dalam 1x24 jam kerja</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span>Anda dapat memilih untuk melaporkan secara anonim</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span>Lampirkan bukti jika tersedia (foto, dokumen)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="font-semibold text-primary-900 mb-3 sm:mb-4 text-sm sm:text-base">Kontak Darurat</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" />
              <span>Hotline: 0800-1945-045</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" />
              <span className="break-all">Email: report@konsi-tech.id</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="lg:col-span-2"
      >
        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold">Form Laporan</h2>
            <p className="text-primary-100 text-xs sm:text-sm mt-1">Lengkapi informasi di bawah ini dengan sedetail mungkin</p>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">
                Kategori Laporan *
              </label>
              <div className="grid gap-3 sm:gap-4">
                {Object.entries(categories).map(([key, category]) => (
                  <motion.label
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`cursor-pointer border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all ${
                      form.category === key 
                        ? `${colorClasses[category.color as keyof typeof colorClasses]} border-opacity-100`
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={key}
                      checked={form.category === key}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-900 text-sm sm:text-base">{category.label}</div>
                        <div className="text-xs sm:text-sm text-neutral-600 mt-1">{category.description}</div>
                      </div>
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Anonymous Option */}
            <motion.div 
              className="bg-neutral-50 rounded-lg sm:rounded-xl p-3 sm:p-4"
              whileHover={{ backgroundColor: "rgb(249 250 251)" }}
              transition={{ duration: 0.2 }}
            >
              <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(e) => setForm(prev => ({ ...prev, anonymous: e.target.checked }))}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 border-2 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 text-sm sm:text-base">Lapor Anonim</div>
                  <div className="text-xs sm:text-sm text-neutral-600 mt-1">Identitas Anda tidak akan dicatat atau dibagikan</div>
                </div>
              </label>
            </motion.div>

            {/* Reporter Information */}
            <AnimatePresence>
              {!form.anonymous && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-3 sm:space-y-4"
                >
                  <h3 className="text-base sm:text-lg font-medium text-neutral-900 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    Data Pelapor
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        value={form.reporter.name}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          reporter: { ...prev.reporter, name: e.target.value } 
                        }))}
                        className="w-full p-3 sm:p-4 border border-neutral-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-300"
                        placeholder="Nama lengkap sesuai KTP"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nomor Telepon *
                      </label>
                      <input
                        type="tel"
                        value={form.reporter.contact}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          reporter: { ...prev.reporter, contact: e.target.value } 
                        }))}
                        className="w-full p-3 sm:p-4 border border-neutral-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-300"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={form.reporter.email}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        reporter: { ...prev.reporter, email: e.target.value } 
                      }))}
                      className="w-full p-3 sm:p-4 border border-neutral-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-300"
                      placeholder="email@domain.com"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                Lokasi Kejadian *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 sm:p-4 border border-neutral-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-300"
                placeholder="Kota/Kabupaten, Provinsi"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Judul Laporan *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 sm:p-4 border border-neutral-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base transition-all duration-300"
                placeholder="Ringkas dalam satu kalimat"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Deskripsi Detail *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full p-3 sm:p-4 border border-neutral-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm sm:text-base transition-all duration-300"
                placeholder="Ceritakan kejadian secara detail: kapan, dimana, siapa yang terlibat, apa yang terjadi, bagaimana dampaknya..."
                required
              />
              <div className="text-right text-xs sm:text-sm text-neutral-500 mt-1">
                {form.description.length}/1000 karakter
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                Lampiran (Opsional)
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-primary-400 transition-colors duration-300">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-400" />
                  <span className="text-neutral-600 text-sm sm:text-base">Klik untuk upload atau drag & drop</span>
                  <span className="text-xs sm:text-sm text-neutral-500 text-center px-2">JPG, PNG, PDF • Maks 5MB per file • Maks 3 file</span>
                </label>
              </div>

              {/* Attachment List */}
              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div 
                    className="mt-3 sm:mt-4 space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {attachments.map((file, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center gap-2 sm:gap-3 bg-neutral-50 rounded-lg p-2 sm:p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-neutral-900 text-sm truncate">{file.name}</div>
                          <div className="text-xs sm:text-sm text-neutral-500">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Urgent Flag */}
            <motion.div 
              className="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4"
              whileHover={{ backgroundColor: "rgb(255 247 237)" }}
              transition={{ duration: 0.2 }}
            >
              <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(e) => setForm(prev => ({ ...prev, urgent: e.target.checked }))}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 border-2 border-orange-300 rounded focus:ring-2 focus:ring-orange-500 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-orange-900 text-sm sm:text-base">Laporan Mendesak</div>
                  <div className="text-xs sm:text-sm text-orange-700 mt-1">Centang jika memerlukan tindakan segera</div>
                </div>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <motion.div 
                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Mengirim Laporan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Kirim Laporan
                </>
              )}
            </motion.button>

            <p className="text-xs text-neutral-500 text-center leading-relaxed px-2">
              Dengan mengirim laporan ini, Anda menyetujui bahwa informasi yang diberikan adalah benar 
              dan dapat dipertanggungjawabkan. Tim kami berkomitmen menjaga kerahasiaan data Anda.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  </div>
);
}