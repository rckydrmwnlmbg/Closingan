'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { WhatsAppConnectionStatus } from '@/components/whatsapp/WhatsAppConnectionStatus';

const STEPS = [
  {
    id: 'connect_wa',
    title: 'Hubungkan WhatsApp Business',
    description: 'Pindai kode QR untuk menyambungkan nomor staf penjualan Anda. Wajib dilakukan untuk melanjutkan.',
    estimatedTime: '2 Menit',
    canSkip: false,
  },
  {
    id: 'setup_ai',
    title: 'Atur Mode AI',
    description: 'Pilih apakah Anda ingin AI membalas otomatis (Auto-Reply), atau sekadar memberikan saran jawaban (AI-Assist).',
    estimatedTime: '1 Menit',
    canSkip: true,
  },
  {
    id: 'import_contact',
    title: 'Tambahkan Kontak Pertama',
    description: 'Masukkan nomor pelanggan perdana Anda untuk memulai percakapan.',
    estimatedTime: '2 Menit',
    canSkip: true,
  },
  {
    id: 'test_message',
    title: 'Kirim Pesan Uji Coba',
    description: 'Rasakan kecanggihan AI dengan membalas pesan pertama pelanggan.',
    estimatedTime: '3 Menit',
    canSkip: true,
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadState() {
      try {
        const res = await fetchApi('/v1/tenant/onboarding');
        if (res?.data) {
          if (res.data.isOnboarded) {
            window.location.href = '/dashboard';
            return;
          }
          if (res.data.onboardingState) {
            setCompletedSteps(res.data.onboardingState.completedSteps || []);
            setCurrentStep(res.data.onboardingState.currentStep || 0);
          }
        }
      } catch (e) {
        console.error('Failed to load onboarding state', e);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, []);

  const saveState = async (newCompleted: string[], nextStep: number, isOnboarded: boolean = false) => {
    try {
      await fetchApi('/v1/tenant/onboarding', {
        method: 'PATCH',
        body: JSON.stringify({
          isOnboarded,
          onboardingState: { completedSteps: newCompleted, currentStep: nextStep }
        })
      });
    } catch (e) {
      console.error('Failed to save state', e);
    }
  };

  const trackStep = async (stepId: string, action: 'completed' | 'skipped') => {
    try {
      await fetchApi('/v1/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
          eventName: `onboarding_step_${action}`,
          properties: { step: stepId }
        })
      });
    } catch (e) {
      console.error('Tracking failed', e);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    const stepId = STEPS[currentStep].id;
    
    await trackStep(stepId, 'completed');
    
    const newCompleted = completedSteps.includes(stepId) ? completedSteps : [...completedSteps, stepId];
    setCompletedSteps(newCompleted);

    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      await saveState(newCompleted, nextStep);
      setCurrentStep(nextStep);
    } else {
      await saveState(newCompleted, currentStep, true);
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  const handleSkip = async () => {
    setLoading(true);
    const stepId = STEPS[currentStep].id;
    await trackStep(stepId, 'skipped');
    
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      await saveState(completedSteps, nextStep);
      setCurrentStep(nextStep);
    } else {
      await saveState(completedSteps, currentStep, true);
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  const activeStepData = STEPS[currentStep];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6">
        
        {/* Progress Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Selamat Datang!</h2>
            <p className="text-muted-foreground mt-2">Mari persiapkan akun CLOSINGAN Anda agar siap menerima pelanggan.</p>
          </div>
          
          <div className="space-y-4">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === idx;
              
              return (
                <div key={step.id} className={`flex items-center space-x-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className={`h-5 w-5 ${isActive ? 'fill-primary/20 text-primary' : ''}`} />
                  )}
                  <span className={`font-medium ${isCompleted ? 'text-green-600 line-through opacity-70' : ''}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2">
          <Card className="h-full border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{activeStepData.title}</CardTitle>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                  ⏱ {activeStepData.estimatedTime}
                </span>
              </div>
              <CardDescription className="text-base mt-2">
                {activeStepData.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex items-center justify-center border-y bg-slate-50/50 m-6 rounded-md p-6">
                {activeStepData.id === 'connect_wa' && (
                  <div className="w-full">
                    <WhatsAppConnectionStatus />
                  </div>
                )}
                {activeStepData.id === 'setup_ai' && (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Pilih mode AI untuk asisten Anda:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto flex-col p-4 gap-2">
                        <span className="font-semibold">Auto-Reply</span>
                        <span className="text-xs font-normal text-muted-foreground whitespace-normal">AI membalas otomatis 24/7 tanpa perlu persetujuan.</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col p-4 gap-2 border-primary bg-primary/5">
                        <span className="font-semibold text-primary">AI-Assist</span>
                        <span className="text-xs font-normal text-muted-foreground whitespace-normal">AI menyarankan balasan, Anda yang klik kirim.</span>
                      </Button>
                    </div>
                  </div>
                )}
                {activeStepData.id === 'import_contact' && (
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nomor WhatsApp Pelanggan</label>
                      <input type="text" placeholder="Contoh: 081234567890" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nama Pelanggan (Opsional)</label>
                      <input type="text" placeholder="Budi Santoso" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
                    </div>
                  </div>
                )}
                {activeStepData.id === 'test_message' && (
                  <div className="w-full space-y-4">
                    <div className="p-4 bg-muted rounded-md text-sm italic">
                      &quot;Halo kak, mau tanya harga OTR Avanza G Matic warna putih ada stok?&quot;
                    </div>
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
                      <p className="text-xs text-primary font-semibold mb-2">Saran Balasan AI:</p>
                      <p className="text-sm text-foreground">Halo kak! Untuk Avanza G Matic warna putih OTR Rp 274.500.000. Kebetulan stoknya ready kak, mau test drive kapan?</p>
                    </div>
                  </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {activeStepData.canSkip ? (
                <Button variant="ghost" onClick={handleSkip} disabled={loading}>Lewati Langkah Ini</Button>
              ) : (
                <div></div>
              )}
              <Button onClick={handleNext} disabled={loading}>
                {currentStep === STEPS.length - 1 ? 'Selesai & Mulai' : 'Lanjutkan'} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}
