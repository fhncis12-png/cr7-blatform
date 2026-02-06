// Mock data for CR7 Elite Platform

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  vipLevel: number;
  invitationCode: string;
  totalEarned: number;
  avatar?: string;
  dailyChallengesCompleted: number;
  dailyChallengesLimit: number;
}

export interface Challenge {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl: string;
  minVipLevel: number;
  dailyLimit: number;
  isActive: boolean;
  category: string;
}

export interface VIPLevel {
  level: number;
  name: string;
  nameAr: string;
  club: string;
  clubAr: string;
  year: string;
  price: number;
  referralPrice: number;
  dailyChallengeLimit: number;
  simpleInterest: number;
  dailyProfit: number;
  totalProfit: number;
  description: string;
  descriptionAr: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'challenge' | 'commission' | 'vip_upgrade';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Referral {
  id: string;
  username: string;
  level: number;
  totalCommission: number;
  joinedAt: string;
  isActive: boolean;
}

export const mockUser: User = {
  id: '1',
  username: 'CR7_Champion',
  email: 'champion@cr7elite.com',
  balance: 2547.50,
  vipLevel: 3,
  invitationCode: 'CR7ELITE2024',
  totalEarned: 12450.00,
  dailyChallengesCompleted: 3,
  dailyChallengesLimit: 10,
};

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Social Media Share',
    titleAr: 'مشاركة على السوشيال ميديا',
    description: 'Share our platform on your social media',
    descriptionAr: 'شارك منصتنا على وسائل التواصل الاجتماعي',
    reward: 15,
    difficulty: 'easy',
    imageUrl: '/placeholder.svg',
    minVipLevel: 0,
    dailyLimit: 3,
    isActive: true,
    category: 'social',
  },
  {
    id: '2',
    title: 'Video Review',
    titleAr: 'مراجعة بالفيديو',
    description: 'Create a short video review about CR7 Elite',
    descriptionAr: 'أنشئ فيديو قصير عن منصة CR7 Elite',
    reward: 45,
    difficulty: 'medium',
    imageUrl: '/placeholder.svg',
    minVipLevel: 1,
    dailyLimit: 2,
    isActive: true,
    category: 'content',
  },
  {
    id: '3',
    title: 'Premium Content',
    titleAr: 'محتوى متميز',
    description: 'Create high-quality promotional content',
    descriptionAr: 'أنشئ محتوى ترويجي عالي الجودة',
    reward: 100,
    difficulty: 'hard',
    imageUrl: '/placeholder.svg',
    minVipLevel: 3,
    dailyLimit: 1,
    isActive: true,
    category: 'premium',
  },
  {
    id: '4',
    title: 'Daily Login',
    titleAr: 'تسجيل الدخول اليومي',
    description: 'Login daily to earn bonus points',
    descriptionAr: 'سجل دخولك يومياً للحصول على نقاط إضافية',
    reward: 5,
    difficulty: 'easy',
    imageUrl: '/placeholder.svg',
    minVipLevel: 0,
    dailyLimit: 1,
    isActive: true,
    category: 'daily',
  },
  {
    id: '5',
    title: 'Invite Friends',
    titleAr: 'دعوة الأصدقاء',
    description: 'Invite new members to join CR7 Elite',
    descriptionAr: 'ادعُ أعضاء جدد للانضمام إلى CR7 Elite',
    reward: 25,
    difficulty: 'medium',
    imageUrl: '/placeholder.svg',
    minVipLevel: 0,
    dailyLimit: 5,
    isActive: true,
    category: 'referral',
  },
  {
    id: '6',
    title: 'Elite Challenge',
    titleAr: 'تحدي النخبة',
    description: 'Complete exclusive VIP-only challenges',
    descriptionAr: 'أكمل تحديات حصرية لأعضاء VIP فقط',
    reward: 200,
    difficulty: 'hard',
    imageUrl: '/placeholder.svg',
    minVipLevel: 5,
    dailyLimit: 1,
    isActive: true,
    category: 'elite',
  },
];

export const vipLevels: VIPLevel[] = [
  {
    level: 0,
    name: 'Sporting Lisbon',
    nameAr: 'النصر — البداية',
    club: 'Sporting Lisbon',
    clubAr: 'سبورتينغ لشبونة',
    year: '2002',
    price: 0,
    referralPrice: 0,
    dailyChallengeLimit: 0,
    simpleInterest: 0,
    dailyProfit: 0,
    totalProfit: 0,
    description: 'Start your journey',
    descriptionAr: 'ابدأ رحلتك مع الدون',
  },
  {
    level: 1,
    name: 'Manchester United',
    nameAr: 'مانشستر — تدريب',
    club: 'Manchester United',
    clubAr: 'مانشستر يونايتد',
    year: '2004',
    price: 24.10,
    referralPrice: 4.10,
    dailyChallengeLimit: 1,
    simpleInterest: 0.82,
    dailyProfit: 1.64,
    totalProfit: 295.20,
    description: 'Begin your ascent',
    descriptionAr: 'بداية القوة والتركيز',
  },
  {
    level: 2,
    name: 'Real Madrid',
    nameAr: 'المحترف',
    club: 'Real Madrid',
    clubAr: 'ريال مدريد',
    year: '2014',
    price: 30.80,
    referralPrice: 10.80,
    dailyChallengeLimit: 1,
    simpleInterest: 2.16,
    dailyProfit: 4.32,
    totalProfit: 777.60,
    description: 'Rise above the rest',
    descriptionAr: 'ارتقِ بمستوى تدريبك',
  },
  {
    level: 3,
    name: 'Real Madrid',
    nameAr: 'ريال مدريد — القمة',
    club: 'Real Madrid',
    clubAr: 'ريال مدريد',
    year: '2019',
    price: 58.80,
    referralPrice: 38.80,
    dailyChallengeLimit: 1,
    simpleInterest: 7.76,
    dailyProfit: 15.52,
    totalProfit: 2793.60,
    description: 'Shine like a champion',
    descriptionAr: 'تألق في قمة العطاء',
  },
  {
    level: 4,
    name: 'Al Nassr',
    nameAr: 'برايم رونالدو',
    club: 'Al Nassr',
    clubAr: 'النصر',
    year: '2023',
    price: 908.00,
    referralPrice: 888.00,
    dailyChallengeLimit: 1,
    simpleInterest: 199.80,
    dailyProfit: 399.60,
    totalProfit: 71928.00,
    description: 'Elite performance',
    descriptionAr: 'أداء النخبة العالمي',
  },
  {
    level: 5,
    name: 'Legendary Career',
    nameAr: 'الكرة الذهبية 2008',
    club: 'Legendary Career',
    clubAr: 'المسيرة الأسطورية',
    year: 'PRIME',
    price: 1820.00,
    referralPrice: 1800.00,
    dailyChallengeLimit: 1,
    simpleInterest: 450.00,
    dailyProfit: 900.00,
    totalProfit: 162000.00,
    description: 'Unbreakable excellence',
    descriptionAr: 'الأسطورة الخالدة',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'challenge',
    amount: 45,
    description: 'Video Review Challenge',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'commission',
    amount: 25,
    description: 'Referral Commission - Level 1',
    status: 'completed',
    createdAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: -200,
    description: 'Withdrawal to USDT Wallet',
    status: 'pending',
    createdAt: '2024-01-13T09:00:00Z',
  },
  {
    id: '4',
    type: 'vip_upgrade',
    amount: -350,
    description: 'VIP Level 3 Upgrade',
    status: 'completed',
    createdAt: '2024-01-10T12:00:00Z',
  },
  {
    id: '5',
    type: 'deposit',
    amount: 500,
    description: 'USDT Deposit',
    status: 'completed',
    createdAt: '2024-01-08T18:30:00Z',
  },
];

export const mockReferrals: Referral[] = [
  {
    id: '1',
    username: 'Alex_CR7Fan',
    level: 1,
    totalCommission: 125.50,
    joinedAt: '2024-01-10T10:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    username: 'Maria_Elite',
    level: 1,
    totalCommission: 89.25,
    joinedAt: '2024-01-08T14:30:00Z',
    isActive: true,
  },
  {
    id: '3',
    username: 'John_Winner',
    level: 2,
    totalCommission: 45.00,
    joinedAt: '2024-01-05T09:15:00Z',
    isActive: false,
  },
  {
    id: '4',
    username: 'Sara_Champion',
    level: 1,
    totalCommission: 210.75,
    joinedAt: '2024-01-03T16:45:00Z',
    isActive: true,
  },
];

export const stats = {
  totalUsers: 15420,
  totalPaid: 2547890,
  activeChallenges: 24,
  topEarner: 45670,
};
