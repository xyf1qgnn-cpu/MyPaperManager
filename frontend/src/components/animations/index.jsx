import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 通用动画配置
export const transitions = {
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  smooth: { type: 'tween', duration: 0.3, ease: 'easeInOut' },
  bounce: { type: 'spring', stiffness: 400, damping: 25 },
};

// 淡入动画
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transitions.smooth,
};

// 向上滑入
export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: transitions.spring,
};

// 缩放弹入
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: transitions.bounce,
};

// 从左滑入
export const slideFromLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: transitions.spring,
};

// 从右滑入
export const slideFromRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: transitions.spring,
};

// 悬浮效果
export const hoverScale = {
  whileHover: { scale: 1.02, y: -4 },
  whileTap: { scale: 0.98 },
  transition: transitions.spring,
};

// 卡片悬浮效果（带发光）
export const cardHover = {
  whileHover: { 
    scale: 1.02, 
    y: -8,
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
  },
  whileTap: { scale: 0.98 },
  transition: transitions.spring,
};

// 按钮悬浮效果
export const buttonHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: transitions.bounce,
};

// 图标悬浮效果
export const iconHover = {
  whileHover: { 
    scale: 1.2,
    rotate: 5,
    filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))',
  },
  transition: transitions.spring,
};

// 列表项交错动画
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: transitions.spring,
};

/**
 * 动画卡片组件
 */
export const MotionCard = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ ...transitions.spring, delay }}
    whileHover={{ 
      y: -8,
      boxShadow: '0 0 30px rgba(0, 212, 255, 0.25)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * 页面过渡容器
 */
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={transitions.spring}
  >
    {children}
  </motion.div>
);

/**
 * 淡入容器
 */
export const FadeIn = ({ children, delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ ...transitions.smooth, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * 交错列表容器
 */
export const StaggerList = ({ children, ...props }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={staggerContainer}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * 交错列表项
 */
export const StaggerItem = ({ children, ...props }) => (
  <motion.div variants={staggerItem} {...props}>
    {children}
  </motion.div>
);

/**
 * 发光脉冲效果
 */
export const GlowPulse = ({ children, color = 'rgba(0, 212, 255, 0.5)', ...props }) => (
  <motion.div
    animate={{
      boxShadow: [
        `0 0 5px ${color}`,
        `0 0 20px ${color}`,
        `0 0 5px ${color}`,
      ],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * 浮动效果
 */
export const Float = ({ children, ...props }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * 粒子背景效果
 */
export const ParticleBackground = ({ count = 50, ...props }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, [count]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      {...props}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0, 212, 255, ${particle.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(0, 212, 255, ${particle.opacity})`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* 添加几个更大的光晕效果 */}
      <motion.div
        style={{
          position: 'absolute',
          left: '10%',
          top: '20%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.03) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          right: '15%',
          bottom: '30%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.02) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          delay: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export { motion, AnimatePresence };

