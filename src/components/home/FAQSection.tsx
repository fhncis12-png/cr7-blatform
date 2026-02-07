import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface FAQItem {
  id: number;
  icon: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    icon: '💎',
    question: 'ما هي هذه المنصة؟',
    answer: 'هذه المنصة تجربة رقمية مستوحاة من مسيرة كريستيانو رونالدو الأسطورية. تقدم نظام عضويات VIP حيث يمثل كل مستوى مرحلة من مراحل النمو ويوفر فرص ربح يومية عبر استراتيجيات الأصول الرقمية وتقنيات البلوكشين.'
  },
  {
    id: 2,
    icon: '⚡',
    question: 'كيف تعمل المنصة؟',
    answer: 'عند تفعيل أي عضوية VIP، يتم دمج مساهمتك ضمن محفظة أصول رقمية مُدارة. تقوم المنصة بتشغيل استراتيجيات توليد العائد عبر البلوكشين ويتم إضافة الأرباح اليومية مباشرة إلى لوحة التحكم الخاصة بالمستخدم.'
  },
  {
    id: 3,
    icon: '🔒',
    question: 'كيف تتم عمليات الإيداع والسحب؟',
    answer: 'جميع عمليات الإيداع تتم عبر العملات الرقمية بسرعة وأمان، ويمكنك متابعة رصيدك والأرباح اليومية مباشرة من لوحة التحكم. أما السحب، فيتم مرة واحدة يوميًا خلال فترة محددة بالتوقيت العالمي (UTC 12:00 – 13:30) لضمان إدارة سلسة وآمنة للأموال لجميع المستخدمين حول العالم. إذا لم يتم السحب في هذه الفترة، يمكن للمستخدم سحب المبلغ كامل في نفس الفترة من اليوم التالي. بهذه الطريقة، يضمن النظام تنظيم عمليات السحب بشكل واضح وآمن، مع تجربة سهلة وشفافة لجميع المشتركين.'
  },
  {
    id: 4,
    icon: '📊',
    question: 'هل يمكن متابعة الأرباح؟',
    answer: 'نعم. توفر المنصة لوحة تحكم مباشرة لمتابعة الرصيد الإجمالي، الأرباح اليومية، سجل العمليات، وحالة السحب بشكل شفاف وسهل.'
  },
  {
    id: 5,
    icon: '🏆',
    question: 'ما هي مستويات VIP والأرباح اليومية؟',
    answer: 'VIP 1 — تفعيل بـ30$ → ربح يومي 2.5$\nVIP 2 — تفعيل بـ58$ → ربح يومي 9.5$\nVIP 3 — تفعيل بـ120$ → ربح يومي 18.75$\nVIP 4 — تفعيل بـ358$ → ربح يومي 93.75$\nVIP 5 — تفعيل بـ535$ → ربح يومي 168.75$\nجميع العضويات تشمل خصم 20$ عند التفعيل.'
  }
];

export const FAQSection = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="px-4 mb-8 sm:mb-10">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white text-right mb-2">
          الأسئلة الشائعة
        </h3>
        <p className="text-xs sm:text-sm text-white/40 text-right">
          كل ما تحتاج معرفته عن منصة CR7 ELITE
        </p>
      </div>

      <div className="space-y-3">
        {faqData.map((item, index) => {
          const isOpen = openId === item.id;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? 'border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleFAQ(item.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right group"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex-shrink-0"
                >
                  <ChevronDown 
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isOpen ? 'text-gold' : 'text-white/40 group-hover:text-white/60'
                    }`} 
                  />
                </motion.div>

                <div className="flex-1 flex items-center justify-end gap-3">
                  <span className={`text-sm sm:text-base font-bold transition-colors duration-300 ${
                    isOpen ? 'text-white' : 'text-white/90 group-hover:text-white'
                  }`}>
                    {item.question}
                  </span>
                  
                  <span className="text-2xl flex-shrink-0">
                    {item.icon}
                  </span>
                </div>
              </button>

              {/* Answer Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                      <div className="bg-black/20 rounded-xl p-3 sm:p-4 border border-white/5">
                        <p className="text-xs sm:text-sm text-white/70 leading-relaxed text-right whitespace-pre-line">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
