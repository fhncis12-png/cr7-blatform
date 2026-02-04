import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  Trophy,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AdminVIP = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data: vipTiers, isLoading } = useQuery({
    queryKey: ['admin-vip-tiers'],
    queryFn: async () => {
      // Try to fetch from vip_tiers table
      const { data, error } = await supabase
        .from('vip_tiers' as any)
        .select('*')
        .order('level', { ascending: true });
      
      if (error) {
        console.error('Error fetching VIP tiers:', error);
        // Return mock data if table doesn't exist yet
        return [
          { id: '1', level: 0, name: 'Free', price: 0, daily_tasks: 2, task_reward: 0.1 },
          { id: '2', level: 1, name: 'Manchester Utd', price: 50, daily_tasks: 5, task_reward: 1.5 },
        ];
      }
      return data;
    }
  });

  const updateVIPMutation = useMutation({
    mutationFn: async (tier: any) => {
      const { error } = await supabase
        .from('vip_tiers' as any)
        .update(tier)
        .eq('id', tier.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('تم تحديث باقة VIP بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-vip-tiers'] });
      setEditingId(null);
    }
  });

  const handleEdit = (tier: any) => {
    setEditingId(tier.id);
    setEditForm(tier);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gradient-gold mb-2">إدارة باقات VIP</h2>
        <p className="text-muted-foreground">تعديل أسعار الباقات، المكافآت، وعدد المهام اليومية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 glass-card animate-pulse rounded-2xl" />)
        ) : (
          vipTiers?.map((tier: any) => (
            <motion.div key={tier.id} layout>
              <Card className="glass-card border-border/50 overflow-hidden relative group">
                {editingId === tier.id ? (
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-primary">تعديل VIP {tier.level}</h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => updateVIPMutation.mutate(editForm)}><Save className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground">اسم الباقة</label>
                        <Input 
                          value={editForm.name} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                          className="h-8 bg-white/5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground">السعر ($)</label>
                          <Input 
                            type="number"
                            value={editForm.price} 
                            onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                            className="h-8 bg-white/5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground">المهام اليومية</label>
                          <Input 
                            type="number"
                            value={editForm.daily_tasks} 
                            onChange={e => setEditForm({...editForm, daily_tasks: Number(e.target.value)})}
                            className="h-8 bg-white/5"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground">ربح المهمة الواحدة ($)</label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={editForm.task_reward} 
                          onChange={e => setEditForm({...editForm, task_reward: Number(e.target.value)})}
                          className="h-8 bg-white/5"
                        />
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold opacity-50" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Star className="w-6 h-6 text-primary" />
                        </div>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEdit(tier)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardTitle className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-display text-gradient-gold">VIP {tier.level}</span>
                        <span className="text-sm text-muted-foreground">{tier.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">سعر التفعيل</span>
                        <span className="font-bold text-lg">${tier.price}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-muted-foreground">المهام اليومية</p>
                          <div className="flex items-center gap-1 font-semibold">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {tier.daily_tasks}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-muted-foreground">الربح اليومي</p>
                          <div className="flex items-center gap-1 font-semibold text-emerald-500">
                            <Trophy className="w-3 h-3" />
                            ${(tier.daily_tasks * tier.task_reward).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVIP;
