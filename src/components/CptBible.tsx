import React from 'react';
import { motion } from 'motion/react';
import { Shield, Book, Zap, Eye, AlertTriangle, Building2, Scale, Info } from 'lucide-react';
import { InterfaceProfile } from '../types';

interface CptBibleProps {
  profile: InterfaceProfile;
}

export default function CptBible({ profile }: CptBibleProps) {
  const sections = [
    {
      title: "I. Platform Identity",
      icon: Building2,
      content: "Clear Path Understanding is a financial market data and intelligence interface platform. We are not a broker, exchange, execution venue, ATS, clearing firm, custodian, portfolio manager, or registered investment advisor."
    },
    {
      title: "II. Zero-Broker Doctrine",
      icon: Shield,
      content: [
        "No trade execution",
        "No order routing",
        "No margin services",
        "No leverage",
        "No brokerage accounts",
        "No trade confirmations"
      ]
    },
    {
      title: "III. Zero-Execution Language",
      icon: Zap,
      highlight: true,
      content: "The following language is permanently prohibited: • Buy Now / Sell Now • Strong Buy / Strong Sell • Execute Trade • Market Order / Limit Order • Stop Loss / Take Profit • Guaranteed Profit • Risk-Free Trade. We use neutral language only: Observe. Analyze. Compare. Research."
    },
    {
      title: "IV. Zero-Custody Policy",
      icon: Eye,
      content: [
        "No holding of funds",
        "No deposits",
        "No withdrawals",
        "No wallets",
        "No clearing services"
      ]
    },
    {
      title: "VI. Deep-Link Broker Boundaries",
      icon: LinkIcon,
      content: "We may provide external links to brokers. We do not embed trade tickets or pass execution instructions. All broker links open externally and clearly state we do not execute trades."
    },
    {
      title: "VII. AI Safety Framework",
      icon: Zap,
      content: "All AI-generated content is for educational and data extraction purposes only. No AI output constitutes financial advice."
    },
    {
      title: "VIII. Community Safety & Monitoring",
      icon: Scale,
      content: "ClearPath maintains a strictly professional environment. Any harassment, solicitation, or malicious behavior results in immediate account termination."
    },
    {
      title: "IX. TradingView Prohibition",
      icon: AlertTriangle,
      content: "We use independent institutional data feeds. Direct TradingView embeds with trade capabilities are strictly forbidden within the environment."
    },
    {
      title: "X. UI Immutability & Safety",
      icon: Info,
      content: "The interface logic is immutable to ensure consistent data perception. No deceptive elements are permitted."
    },
    {
      title: "XI. Revenue Transparency",
      icon: Book,
      content: "Clear Path Understanding generates revenue through interface licensing and research subscriptions. We do not accept kickbacks or payment-for-order-flow."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic" style={{ color: profile.ui.accent }}>
          THE CPT BIBLE
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
          <span>Full Transparency</span>
          <span className="text-indigo-500">|</span>
          <span>Zero Brokerage</span>
          <span className="text-indigo-500">|</span>
          <span>Zero Advertising</span>
          <span className="text-indigo-500">|</span>
          <span>Zero Execution</span>
        </div>
        <p className="text-sm font-mono text-gray-500 italic">
          "This document defines our structural limits. They are not optional."
        </p>
        
        <div className="mt-8 p-6 glass border border-indigo-500/20 rounded-3xl">
          <p className="text-lg font-black uppercase tracking-widest text-[#ff4500]">
            Rick Floyd's Clear Path Understanding is not a broker — it is a straight data provider.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-[32px] border glass transition-all hover:scale-[1.02] ${
              section.highlight 
                ? 'border-[#ff00ff] bg-[#ff00ff]/5 shadow-[0_0_30px_rgba(255,0,255,0.1)]' 
                : 'border-white/5'
            }`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                <section.icon size={24} style={{ color: section.highlight ? '#ff00ff' : profile.ui.accent }} />
              </div>
              <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${section.highlight ? 'text-[#ff00ff]' : 'text-white'}`}>
                {section.title}
              </h3>
            </div>
            
            {Array.isArray(section.content) ? (
              <ul className="space-y-3 font-mono text-[11px] uppercase tracking-widest text-gray-400">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-xs leading-relaxed ${section.highlight ? 'text-white font-bold italic' : 'text-gray-400 font-mono text-[10px] uppercase tracking-widest'}`}>
                {section.content}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-8 glass border border-white/5 rounded-[40px] text-center space-y-6">
        <p className="text-sm font-mono text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
          Clear Path Understanding is a financial data and intelligence interface platform. 
          We do not execute trades, provide brokerage services, custody assets, or offer investment advice.
        </p>
        <div className="flex justify-center space-x-12 opacity-30">
          <Shield size={32} />
          <Book size={32} />
          <Zap size={32} />
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ size, style, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    style={style} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
