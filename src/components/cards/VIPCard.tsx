import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React from 'react';

// Import Player Images
import player1 from '@/assets/vip-v2/players/ronaldo_manutd.png';
import player2 from '@/assets/vip-v2/players/ronaldo_realmadrid.png';
import player3 from '@/assets/vip-v2/players/ronaldo_realmadrid.png';
import player4 from '@/assets/vip-v2/players/ronaldo_alnassr.png';
import player5 from '@/assets/vip-v2/players/ronaldo_ballondor.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
  referralDiscount?: number;
}

const players: Record<number, string> = {
  0: player1,
  1: player1,
  2: player2,
  3: player3,
  4: player4,
  5: player5,
};

const levelColors: Record<number, { 
  border: string, 
  bg: string,
  badge: string,
  icon: string
}> = {
  0: { border: 'border-blue-900/50', bg: 'bg-gradient-to-br from-blue-950 to-black', badge: 'bg-blue-900/40', icon: 'text-blue-400' },
  1: { border: 'border-blue-500/50', bg: 'bg-gradient-to-br from-blue-900 to-black', badge: 'bg-blue-900/50', icon: 'text-blue-400' },
  2: { border: 'border-slate-400/50', bg: 'bg-gradient-to-br from-slate-800 to-black', badge: 'bg-slate-700/50', icon: 'text-slate-300' },
  3: { border: 'border-purple-500/50', bg: 'bg-gradient-to-br from-purple-950 to-black', badge: 'bg-purple-900/50', icon: 'text-purple-400' },
  4: { border: 'border-red-500/50', bg: 'bg-gradient-to-br from-red-950 to-black', badge: 'bg-red-900/50', icon: 'text-red-400' },
  5: { border: 'border-yellow-500/50', bg: 'bg-gradient-to-br from-yellow-950 to-black', badge: 'bg-yellow-900/50', icon: 'text-yellow-400' },
};

export const VIPCard = ({ vipLevel, currentLevel }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const colors = levelColors[vipLevel.level] || levelColors[0];

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.3 }
    });
    navigate('/profile', { state: { openDeposit: true } });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      onClick={handleAction}
      className={`relative w-full max-w-md rounded-3xl overflow-hidden cursor-pointer border-2 ${colors.border} ${colors.bg} shadow-2xl transition-all duration-500 group mb-6 p-6`}
    >
      {/* Background overlay for depth */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Content Container */}
      <div className="relative z-10 flex gap-6">
        {/* Left Side - Player Image */}
        <div className="flex-shrink-0 w-32 h-48 flex items-end justify-center">
          <motion.img 
            loading="eager"
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className="h-full w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] transition-transform duration-500 origin-bottom group-hover:scale-105"
          />
        </div>

        {/* Right Side - Information Grid */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Header with Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col items-end">
              <h3 className="text-2xl font-black text-white italic">
                {vipLevel.name}
              </h3>
              <p className="text-sm font-bold text-yellow-400">
                {vipLevel.nameAr}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {vipLevel.clubAr} — {vipLevel.year}
              </p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${colors.badge} border border-white/10 flex-shrink-0`}>
              <Crown className={`w-6 h-6 ${colors.icon}`} />
            </div>
          </div>

          {/* Stats Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Daily Tasks */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400 font-bold">مهمات يومية</span>
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V3z" />
                </svg>
              </div>
              <p className="text-xl font-black text-white">{vipLevel.dailyChallengeLimit}</p>
            </div>

            {/* Simple Interest */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400 font-bold">مصلحة بسيطة</span>
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="text-xl font-black text-blue-400">{vipLevel.simpleInterest}%</p>
            </div>

            {/* Daily Profit */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400 font-bold">الربح اليومي</span>
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="text-lg font-black text-green-400">+{formatNumber(vipLevel.dailyProfit)}</p>
            </div>

            {/* Total Profit */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400 font-bold">إجمالي الربح</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.16 2.75a.75.75 0 00-1.32 0l-1.464 4.52H.75a.75.75 0 00-.728.744c.004.018.013.036.025.053l3.65 3.476L1.977 15.25a.75.75 0 00.925.928l3.868-2.88 3.868 2.88a.75.75 0 00.925-.928l-1.52-4.126L19.203 8.02a.75.75 0 00-.728-.744h-4.694l-1.464-4.52z" />
                </svg>
              </div>
              <p className="text-lg font-black text-yellow-400">{formatNumber(vipLevel.totalProfit)}</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full">
            {!isUnlocked ? (
              <motion.button
                animate={{ 
                  boxShadow: ["0 0 0px rgba(234,179,8,0)", "0 0 15px rgba(234,179,8,0.5)", "0 0 0px rgba(234,179,8,0)"],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all relative overflow-hidden font-black text-black text-sm uppercase"
                onClick={handleAction}
              >
                <span>فتح الآن — {formatNumber(vipLevel.referralPrice)} USDT</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <div className="w-full h-10 bg-green-500/20 border border-green-500/50 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-md">
                <span className="text-green-400 font-black text-xs uppercase">تم التفعيل</span>
                <Check className="w-4 h-4 text-green-500 stroke-[3px]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
