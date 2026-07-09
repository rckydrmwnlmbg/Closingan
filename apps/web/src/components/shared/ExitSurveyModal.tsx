'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '@/lib/api';

interface ExitSurveyModalProps {
  onClose?: () => void;
}

export function ExitSurveyModal({ onClose }: ExitSurveyModalProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<string>('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [npsScore, setNpsScore] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaveOffer, setShowSaveOffer] = useState(false);

  const handleSubmitSurvey = async () => {
    if (!reason || npsScore === null) return;
    setIsSubmitting(true);
    try {
      const res = await fetchApi('/tenant/exit-survey', {
        method: 'POST',
        body: JSON.stringify({ reason, reasonDetail, npsScore }),
      });
      
      if (res.data?.saveOfferAvailable) {
        setShowSaveOffer(true);
        setStep(2);
      } else {
        setStep(3); // Goodbye message
      }
    } catch (error) {
      console.error('Failed to submit exit survey', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async () => {
    setIsSubmitting(true);
    try {
      await fetchApi('/tenant/exit-survey/accept-offer', { method: 'POST' });
      setStep(4); // Success message
    } catch (error) {
      console.error('Failed to accept offer', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons = [
    { value: 'PRICE', label: 'Terlalu mahal' },
    { value: 'NO_TIME', label: 'Tidak sempat pakai' },
    { value: 'WRONG_FIT', label: 'Fitur tidak sesuai' },
    { value: 'SWITCHING', label: 'Pindah ke solusi lain' },
    { value: 'TEMPORARY', label: 'Sementara tidak butuh' },
    { value: 'OTHER', label: 'Lainnya' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Beritahu Kami Mengapa Anda Berhenti</h2>
                <p className="text-gray-400 text-sm">
                  Langganan Anda akan segera berakhir. Feedback Anda sangat berarti untuk membantu kami menjadi lebih baik.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alasan utama tidak melanjutkan?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {reasons.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setReason(r.value)}
                        className={`px-4 py-2 text-sm text-left rounded-lg border transition-all ${
                          reason === r.value 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Apa yang bisa kami perbaiki? (Opsional)</label>
                  <textarea
                    value={reasonDetail}
                    onChange={(e) => setReasonDetail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    placeholder="Ceritakan pengalaman Anda..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Seberapa besar kemungkinan Anda merekomendasikan kami? (0-10)</label>
                  <div className="flex justify-between items-center gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() => setNpsScore(score)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                          npsScore === score 
                            ? 'bg-blue-600 text-white font-bold' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="px-5 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Nanti Saja
                  </button>
                )}
                <button
                  onClick={handleSubmitSurvey}
                  disabled={!reason || npsScore === null || isSubmitting}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim & Lanjutkan'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && showSaveOffer && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                🎁
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Tunggu Dulu!</h2>
                <p className="text-gray-400">
                  Karena Anda merasa harganya terlalu mahal, kami ingin memberikan <strong className="text-white">Diskon 30%</strong> untuk perpanjangan bulan ini. Anda tidak perlu repot setup ulang!
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleAcceptOffer}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Ambil Diskon 30% Sekarang'}
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={isSubmitting}
                  className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Tidak, tetap berhenti
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                👋
              </div>
              <h2 className="text-xl font-bold text-white">Terima Kasih</h2>
              <p className="text-gray-400">
                Masukan Anda sangat berharga bagi kami. Kami harap bisa melayani Anda lagi di lain waktu!
              </p>
              <button
                onClick={() => {
                  if (onClose) onClose();
                  else window.location.reload();
                }}
                className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                Tutup
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              <h2 className="text-xl font-bold text-white">Penawaran Berhasil!</h2>
              <p className="text-gray-400">
                Langganan Anda telah diperpanjang 1 bulan lagi dengan diskon 30%. Selamat menggunakan Closingan!
              </p>
              <button
                onClick={() => {
                  if (onClose) onClose();
                  else window.location.reload();
                }}
                className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Lanjut ke Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
