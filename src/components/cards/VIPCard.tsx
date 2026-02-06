import { motion, useAnimation } from 'framer-motion';
import { Check, Crown, Target, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIPLevel } from '@/data/mockData';
import { GoldButton } from '../ui/GoldButton';
import React, { useEffect } from 'react';

// Import New VIP Images from processed folder
import vip0 from '@/assets/vip-processed/vip0.png';
import vip1 from '@/assets/vip-processed/vip1.png';
import vip2 from '@/assets/vip-processed/vip2.png';
import vip3 from '@/assets/vip-processed/vip3.png';
import vip4 from '@/assets/vip-processed/vip4.png';
import vip5 from '@/assets/vip-processed/vip5.png';

interface VIPCardProps {
  vipLevel: VIPLevel;
  currentLevel: number;
  index: number;
  referralDiscount?: number;
}

const ronaldoImages: Record<number, string> = {
  0: vip0,
  1: vip1,
  2: vip2,
  3: vip3,
  4: vip4,
  5: vip5,
};

const levelStyles: Record<number, { 
  glow: string, 
  border: string, 
  overlay: string, 
  bgGradient: string,
  particleColor: string,
  imageEffect: string,
  imageAnimation: any
}> = {
  0: { 
    glow: 'shadow-[0_0_20px_rgba(0,166,80,0.3)]', 
    border: 'border-[#00A650]/30', 
    overlay: 'bg-[#00A650]/10', 
    bgGradient: 'from-[#00A650]/20 via-black/40 to-black', 
    particleColor: 'bg-[#00A650]',
    imageEffect: 'brightness(1.05) drop-shadow(0 0 20px rgba(0, 166, 80, 0.3))',
    imageAnimation: {}
  },
  1: { 
    glow: 'shadow-[0_0_30px_rgba(218,41,28,0.4)]', 
    border: 'border-[#DA291C]/30', 
    overlay: 'bg-[#DA291C]/10', 
    bgGradient: 'from-[#DA291C]/20 via-black/40 to-black', 
    particleColor: 'bg-[#DA291C]',
    imageEffect: 'brightness(1.1) drop-shadow(0 0 30px rgba(218, 41, 28, 0.5))',
    imageAnimation: {
      filter: ['brightness(1.1) drop-shadow(0 0 30px rgba(218, 41, 28, 0.5))', 'brightness(1.2) drop-shadow(0 0 40px rgba(218, 41, 28, 0.8))'],
      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" }
    }
  },
  2: { 
    glow: 'shadow-[0_0_30px_rgba(255,255,255,0.3)]', 
    border: 'border-white/30', 
    overlay: 'bg-white/5', 
    bgGradient: 'from-white/10 via-black/40 to-black', 
    particleColor: 'bg-white',
    imageEffect: 'brightness(1.15) drop-shadow(0 0 40px rgba(255, 255, 255, 0.6))',
    imageAnimation: {
      y: [0, -15, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  },
  3: { 
    glow: 'shadow-[0_0_40px_rgba(255,215,0,0.4)]', 
    border: 'border-yellow-500/40', 
    overlay: 'bg-yellow-500/5', 
    bgGradient: 'from-yellow-500/10 via-black/40 to-black', 
    particleColor: 'bg-yellow-500',
    imageEffect: 'brightness(1.2) drop-shadow(0 0 50px rgba(255, 215, 0, 0.5))',
    imageAnimation: {
      rotateY: [0, 10, 0, -10, 0],
      transition: { duration: 6, repeat: Infinity, ease: "linear" }
    }
  },
  4: { 
    glow: 'shadow-[0_0_50px_rgba(255,215,0,0.5)]', 
    border: 'border-yellow-400/50', 
    overlay: 'bg-yellow-400/10', 
    bgGradient: 'from-yellow-400/20 via-black/40 to-black', 
    particleColor: 'bg-yellow-400',
    imageEffect: 'brightness(1.25) drop-shadow(0 0 60px rgba(255, 215, 0, 0.7))',
    imageAnimation: {
      scale: [1, 1.05, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  },
  5: { 
    glow: 'shadow-[0_0_100px_rgba(255,107,0,0.8)]', 
    border: 'border-[#FF6B00]/80', 
    overlay: 'bg-[#FF6B00]/10', 
    bgGradient: 'from-[#FF6B00]/30 via-black/40 to-black', 
    particleColor: 'bg-[#FFD700]',
    imageEffect: 'brightness(1.3) drop-shadow(0 0 80px rgba(255, 107, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))',
    imageAnimation: {
      y: [0, -20, 0],
      filter: [
        'brightness(1.3) drop-shadow(0 0 80px rgba(255, 107, 0, 0.8))',
        'brightness(1.5) drop-shadow(0 0 100px rgba(255, 215, 0, 0.9))'
      ],
      transition: { 
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        filter: { duration: 2, repeat: Infinity, repeatType: "reverse" }
      }
    }
  },
};

export const VIPCard = ({ vipLevel, currentLevel, index, referralDiscount = 0 }: VIPCardProps) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const isUnlocked = vipLevel.level <= currentLevel;
  const style = levelStyles[vipLevel.level] || levelStyles[0];

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Ripple Effect Logic
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'absolute bg-white/30 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '0px';
    ripple.style.height = '0px';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);

    await controls.start({
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4 }
    });
    
    navigate('/profile', { state: { openDeposit: true } });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)",
        transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] } 
      }}
      className={`relative h-[480px] w-full rounded-[20px] overflow-hidden cursor-pointer border ${style.border} ${style.glow} transition-all duration-500 group bg-[#0A192F]`}
    >
      {/* Background Stadium Gradient */}
      <div className={`absolute inset-0 z-[1] ${style.overlay} backdrop-blur-[1px]`} />
      <div className={`absolute inset-0 z-[1] bg-gradient-to-t ${style.bgGradient}`} />
      
      {/* Stadium Lights Effect (Radial Gradients) */}
      <div className="absolute top-0 left-0 w-full h-full z-[0] opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
      </div>

      {/* Ronaldo Image */}
      <div className="absolute left-0 bottom-0 z-[2] h-[85%] w-[70%] flex items-end justify-center pointer-events-none">
        <motion.img 
          loading="eager"
          animate={style.imageAnimation}
          src={ronaldoImages[vipLevel.level]} 
          alt={vipLevel.name}
          className="h-full w-auto object-contain object-bottom transition-transform duration-700 ease-out origin-bottom group-hover:scale-105"
          style={{
            filter: style.imageEffect,
          }}
        />
      </div>

      {/* Content Area */}
      <div className="relative z-[3] p-6 ml-auto w-[60%] h-full flex flex-col justify-between text-right">
        <div className="flex flex-col items-end">
          {/* Header Section */}
          <div className="flex justify-between items-start w-full mb-4">
             <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-1 border border-white/10">
                <span className="text-white font-black text-sm italic">VIP {vipLevel.level}</span>
             </div>
             <div className="bg-yellow-500 rounded-full p-2 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                <Crown className="w-5 h-5 text-black" />
             </div>
          </div>
          
          <h3 className="font-display text-xl font-black text-white mt-1 tracking-tight">
            {vipLevel.clubAr}
          </h3>
          <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-wider mb-4">
            {vipLevel.nameAr}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-2 w-full">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between group-hover:border-yellow-500/30 transition-colors">
              <Target className="w-4 h-4 text-yellow-500" />
              <div className="text-right">
                <p className="text-[9px] text-zinc-400 font-bold uppercase">المهام اليومية</p>
                <p className="text-sm font-display font-bold text-white">{vipLevel.dailyChallengeLimit} / 5</p>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between group-hover:border-orange-500/30 transition-colors">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <div className="text-right">
                <p className="text-[9px] text-zinc-400 font-bold uppercase">مصلحة بسيطة</p>
                <p className="text-sm font-display font-bold text-orange-400">{vipLevel.simpleInterest}%</p>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between group-hover:border-green-500/30 transition-colors">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <div className="text-right">
                <p className="text-[9px] text-zinc-400 font-bold uppercase">الربح اليومي</p>
                <p className="text-sm font-display font-bold text-green-400">+${formatNumber(vipLevel.dailyProfit)}</p>
              </div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between group-hover:border-blue-500/30 transition-colors">
              <Wallet className="w-4 h-4 text-blue-400" />
              <div className="text-right">
                <p className="text-[9px] text-zinc-400 font-bold uppercase">إجمالي الربح</p>
                <p className="text-sm font-display font-bold text-blue-400">${formatNumber(vipLevel.totalProfit)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="w-full mt-auto pt-4">
          {!isUnlocked ? (
            <div className="flex flex-col gap-3">
              <button
                className="w-full h-[56px] bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-[28px] relative overflow-hidden group/btn shadow-[0_8px_24px_rgba(255,215,0,0.4),0_0_40px_rgba(255,215,0,0.2)] active:scale-95 transition-all duration-300"
                onClick={handleAction}
              >
                {/* Glow Pulse Effect */}
                <motion.div 
                  animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_70%)] z-0"
                />
                
                <div className="flex items-center justify-center gap-2 w-full relative z-10">
                  <span className="text-lg font-bold text-black">افتح الآن</span>
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full text-black font-bold">
                    {vipLevel.price === 0 ? 'مجاني' : `$${vipLevel.price}`}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-500/50 rounded-[28px] h-[56px] flex items-center justify-center gap-3 backdrop-blur-md w-full">
              <span className="text-green-400 font-bold text-sm uppercase">تم التفعيل</span>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-black stroke-[3px]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden opacity-40">
        {[...Array(vipLevel.level === 5 ? 25 : 12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 480 }}
            animate={{ 
              opacity: [0, 1, 0], 
              y: -100,
              x: (Math.random() - 0.5) * 400 + 200,
              scale: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className={`absolute bottom-0 w-1 h-1 rounded-full ${style.particleColor}`}
          />
        ))}
      </div>
    </motion.div>
  );
};
