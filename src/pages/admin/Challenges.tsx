import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Settings2,
  Play,
  Pause,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AdminChallenges = () => {
  const queryClient = useQueryClient();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching challenges:', error);
        return [
          { id: '1', title: 'تحدي النصر الأول', status: 'active', reward: 5, difficulty: 'easy' },
          { id: '2', title: 'تحدي الهاتريك', status: 'inactive', reward: 20, difficulty: 'hard' },
        ];
      }
      return data;
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('challenges' as any)
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة التحدي');
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gradient-gold mb-2">إدارة التحديات</h2>
          <p className="text-muted-foreground">تفعيل أو تعطيل التحديات والمكافآت الخاصة</p>
        </div>
        <Button className="bg-gradient-gold text-primary-foreground font-bold">
          <Plus className="w-4 h-4 mr-2" />
          تحدي جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-24 glass-card animate-pulse rounded-xl" />)
        ) : (
          challenges?.map((challenge: any) => (
            <motion.div key={challenge.id} layout>
              <Card className="glass-card border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${challenge.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted/10 text-muted-foreground'}`}>
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{challenge.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs flex items-center gap-1 text-primary">
                            <Clock className="w-3 h-3" />
                            {challenge.difficulty || 'متوسط'}
                          </span>
                          <span className="text-xs font-bold text-emerald-500">
                            المكافأة: ${challenge.reward}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${challenge.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {challenge.status === 'active' ? 'نشط' : 'متوقف'}
                        </span>
                        <Switch 
                          checked={challenge.status === 'active'} 
                          onCheckedChange={(checked) => 
                            toggleStatusMutation.mutate({ 
                              id: challenge.id, 
                              status: checked ? 'active' : 'inactive' 
                            })
                          }
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                          <Settings2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminChallenges;
