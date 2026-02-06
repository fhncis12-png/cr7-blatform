import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, Calendar, TrendingUp, DollarSign, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import React from 'react';

// Import New Player Images
import player0 from '@/assets/vip-v3/players/vip0.png';
import player1 from '@/assets/vip-v3/players/vip1.png';
import player2 from '@/assets/vip-v3/players/vip2.png';
import player3 from '@/assets/vip-v3/players/vip3.png';
import player4 from '@/assets/vip-v3/players/vip4.png';
import player5 from '@/assets/vip-v3/players/vip5.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
}

const players: Record<number, string> = {
  0: player0,
  1: player1,
  2: player2,
  3: player3,
  4: player4,
  5: player5,
};

// FIFA Stadium backgrounds with night atmosphere
const stadiumBackgrounds: Record<number, string> = {
  0: 'url("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat',
  1: 'url("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop") center/cover no-repeat',
  2: 'url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop") center/cover no-repeat',
  3: 'url("https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop") center/cover no-repeat',
  4: 'url("https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat',
  5: 'url("https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat',
};

// Spotlight lighting effects for each level
const spotlightStyles: Record<number, { color: string, intensity: string }> = {
  0: { color: 'rgba(255, 255, 255, 0.3)', intensity: 'opacity-30' },
  1: { color: 'rgba(255, 100, 100, 0.4)', intensity: 'opacity-40' },
  2: { color: 'rgba(255, 215, 0, 0.35)', intensity: 'opacity-35' },
  3: { color: 'rgba(255, 200, 0, 0.4)', intensity: 'opacity-40' },
  4: { color: 'rgba(200, 100, 255, 0.4)', intensity: 'opacity-40' },
  5: { color: 'rgba(100, 200, 255, 0.5)', intensity: 'opacity-50' },
};

export const VIPCard = ({ vipLevel, currentLevel, index }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const isCurrent = vipLevel.level === currentLevel;
  const spotlight = spotlightStyles[vipLevel.level] || spotlightStyles[0];

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) return;
    await controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.3 }
    });
    navigate('/profile', { state: { openDeposit: true } });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleAction}
      className="relative w-full max-w-md mx-auto aspect-[1.2/1] rounded-[2.5rem] overflow-hidden border-2 border-[#D4AF37]/40 p-5 flex flex-col mb-6 cursor-pointer shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
    >
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          background: stadiumBackgrounds[vipLevel.level],
          filter: 'brightness(0.3) contrast(1.2)'
        }} 
      />
      
      {/* FIFA Stadium Night Atmosphere - Spotlight Effect */}
      <div className={`absolute inset-0 z-1 ${spotlight.intensity} pointer-events-none`} style={{ background: `radial-gradient(ellipse 50% 70% at 50% 40%, ${spotlight.color}, transparent)` }} />
      
      {/* Additional depth layer */}
      <div className="absolute inset-0 z-2 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

      {/* Header Row */}
      <div className="flex justify-between items-start z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center border border-[#D4AF37]/30 backdrop-blur-md">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-2xl font-black italic tracking-tighter">VIP {vipLevel.level}</h3>
            <span className="text-[#D4AF37] text-xs font-black uppercase tracking-widest">{vipLevel.nameAr}</span>
          </div>
        </div>

        {isCurrent ? (
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#FBF5B7] text-black px-5 py-2.5 rounded-full flex items-center gap-2 font-black text-xs uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#D4AF37] transform transition-transform hover:scale-105">
            <Check className="w-4 h-4" />
            <span className="whitespace-nowrap">مستواك الحالي</span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-black/60 to-black/40 text-white px-5 py-2.5 rounded-full border border-[#D4AF37]/60 font-black text-xs uppercase backdrop-blur-xl hover:border-[#D4AF37] transition-all shadow-lg flex items-center gap-2 group/btn">
            <span className="whitespace-nowrap">
              {!isUnlocked ? (
                <span className="flex items-center gap-1.5">
                  <span>فتح الآن</span>
                  <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                  <span className="text-[#D4AF37]">{vipLevel.referralPrice}</span>
                  <span className="text-[10px] opacity-80">USDT</span>
                </span>
              ) : 'تم الفتح'}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex mt-4 z-10 items-end justify-between">
        {/* Left Side: Player Image - SCALED UP & FOCUSED */}
        <div className="w-[55%] relative flex items-end h-[115%] -ml-10 overflow-visible">
          <img 
            src={players[vipLevel.level]} 
            alt={vipLevel.name}
            className="h-[150%] w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 origin-bottom z-30"
          />
        </div>

        {/* Right Side: Stats Grid - IMPROVED SPACING & RTL */}
        <div className="w-[45%] grid grid-cols-2 gap-2.5 pb-2 z-40" dir="rtl">
          {/* Stat 1: Daily Tasks */}
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
            <Calendar className="w-4 h-4 text-orange-400 mb-1.5" />
            <div className="flex items-center gap-1">
              <span className="text-lg font-black text-white leading-none">{vipLevel.dailyChallengeLimit}</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">مهمات</span>
          </div>

          {/* Stat 2: Simple Interest */}
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-1.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-lg font-black text-white leading-none">{vipLevel.simpleInterest}</span>
              <span className="text-xs font-bold text-emerald-400">%</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">عائد</span>
          </div>

          {/* Stat 3: Daily Profit */}
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
            <DollarSign className="w-4 h-4 text-yellow-500 mb-1.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-bold text-yellow-500">$</span>
              <span className="text-sm font-black text-white leading-none">{formatNumber(vipLevel.dailyProfit).split('.')[0]}</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">يومي</span>
          </div>

          {/* Stat 4: Total Profit */}
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
            <Coins className="w-4 h-4 text-yellow-600 mb-1.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-bold text-yellow-600">$</span>
              <span className="text-sm font-black text-white leading-none">{formatNumber(vipLevel.totalProfit).split('.')[0]}</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">إجمالي</span>
          </div>
        </div>
      </div>

      {/* Vignette effect for depth */}
      <div className="absolute inset-0 rounded-[2.5rem] shadow-inset pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }} />
    </motion.div>
  );
};
