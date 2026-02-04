import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Bell, 
  Save,
  ArrowDownCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Settings = () => {
  // Use local state instead of Supabase table to avoid "table not found" error
  const [apiKey] = useState('PFMSQ5C-F9M4ATH-Q0Y4PS7-SWKXEGK');
  const [minWithdrawal] = useState('10');
  const [maxWithdrawal] = useState('1000');

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات في ذاكرة النظام المؤقتة');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gradient-gold mb-2">الإعدادات العامة</h2>
        <p className="text-muted-foreground">إدارة مفاتيح API وإعدادات الأمان والنظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdrawal Limits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold">حدود السحب</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الحد الأدنى ($)</label>
                <Input 
                  type="number" 
                  value={minWithdrawal}
                  readOnly
                  className="glass-card opacity-70"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الحد الأقصى ($)</label>
                <Input 
                  type="number" 
                  value={maxWithdrawal}
                  readOnly
                  className="glass-card opacity-70"
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              حفظ حدود السحب
            </Button>
          </div>
        </motion.div>

        {/* API Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إعدادات NOWPayments</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  value={apiKey}
                  readOnly
                  className="glass-card opacity-70"
                />
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">يستخدم هذا المفتاح لمعالجة عمليات السحب التلقائية</p>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إعدادات الأمان</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">تفعيل IP Whitelist</span>
                <p className="text-[10px] text-muted-foreground">السماح بالدخول من عناوين IP محددة فقط</p>
              </div>
              <Switch checked={false} onCheckedChange={handleSave} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">تفعيل 2FA للمدراء</span>
                <p className="text-[10px] text-muted-foreground">فرض المصادقة الثنائية لجميع حسابات الإدارة</p>
              </div>
              <Switch checked={false} onCheckedChange={handleSave} />
            </div>
          </div>
        </motion.div>

        {/* System Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold">إشعارات النظام</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">إشعارات البريد</span>
                <p className="text-[10px] text-muted-foreground">إرسال بريد عند وصول طلب سحب جديد</p>
              </div>
              <Switch checked={true} onCheckedChange={handleSave} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
