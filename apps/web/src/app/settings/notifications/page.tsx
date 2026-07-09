'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { fetchApi } from '@/lib/api';
import { Bell, Clock, Activity, Loader2, Save, Trophy } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [prefs, setPrefs] = useState({
    dailyDigest: true,
    dailyDigestTime: '07:30',
    weeklySummary: true,
    idleAlert: true,
    achievementAlert: true,
  });

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const res = await fetchApi('/v1/settings/notifications');
        if (res.data) {
          setPrefs({
            dailyDigest: res.data.dailyDigest,
            dailyDigestTime: res.data.dailyDigestTime || '07:30',
            weeklySummary: res.data.weeklySummary,
            idleAlert: res.data.idleAlert,
            achievementAlert: res.data.achievementAlert ?? true,
          });
        }
      } catch {
        alert('Gagal memuat preferensi notifikasi.');
      } finally {
        setLoading(false);
      }
    }
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchApi('/v1/settings/notifications', {
        method: 'PATCH',
        body: JSON.stringify(prefs),
      });
      alert('Preferensi notifikasi berhasil diperbarui.');
    } catch {
      alert('Gagal menyimpan preferensi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifikasi</h1>
        <p className="text-muted-foreground">
          Atur notifikasi apa saja yang ingin kamu terima melalui WhatsApp pribadi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Laporan Harian (Daily Digest)
          </CardTitle>
          <CardDescription>
            Ringkasan pagi mengenai hot lead, follow-up terjadwal, dan chat yang belum direspons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">Aktifkan Laporan Harian</label>
              <p className="text-sm text-muted-foreground">Dikirim setiap hari.</p>
            </div>
            <Switch 
              checked={prefs.dailyDigest} 
              onCheckedChange={(v) => setPrefs({ ...prefs, dailyDigest: v })} 
            />
          </div>
          {prefs.dailyDigest && (
            <div className="flex items-center gap-4 mt-4 border-t pt-4">
              <div className="space-y-1 flex-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Jam Pengiriman
                </label>
              </div>
              <input 
                type="time" 
                value={prefs.dailyDigestTime}
                onChange={(e) => setPrefs({ ...prefs, dailyDigestTime: e.target.value })}
                className="flex h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Laporan Mingguan (Weekly Summary)
          </CardTitle>
          <CardDescription>
            Ringkasan performa setiap Senin jam 08:00 (misalnya perbandingan performa minggu lalu vs minggu ini).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">Aktifkan Laporan Mingguan</label>
            </div>
            <Switch 
              checked={prefs.weeklySummary} 
              onCheckedChange={(v) => setPrefs({ ...prefs, weeklySummary: v })} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Peringatan Pasif (Idle Alert)
          </CardTitle>
          <CardDescription>
            Peringatan jika kamu tidak membuka dashboard lebih dari 3 hari tapi masih ada lead menumpuk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">Aktifkan Idle Alert</label>
            </div>
            <Switch 
              checked={prefs.idleAlert} 
              onCheckedChange={(v) => setPrefs({ ...prefs, idleAlert: v })} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Notifikasi Pencapaian (Achievement Alert)
          </CardTitle>
          <CardDescription>
            Pemberitahuan ketika kamu mencapai target tertentu, misalnya merespons 50 lead dalam bulan ini 🎉.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">Aktifkan Notifikasi Pencapaian</label>
            </div>
            <Switch 
              checked={prefs.achievementAlert} 
              onCheckedChange={(v) => setPrefs({ ...prefs, achievementAlert: v })} 
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
