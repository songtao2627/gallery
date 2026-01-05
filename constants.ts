import { Project } from './types';

// Palette mapping:
// Work -> Cyan
// Life -> Lime
// Learning -> Teal
// IT -> Lemon/Amber

export const PROJECTS: Project[] = [
  // --- WORK (Efficiency Tools) ---
  {
    id: 'w1',
    title: 'DataFlow Pro',
    description: '面向企业数据流的可视化分析仪表盘。',
    category: 'Work',
    projectPath: '/dataflow-pro/',
    imagePath: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    tags: ['商业', '分析'],
    color: 'text-cyan-600',
    icon: 'analytics'
  },
  {
    id: 'w2',
    title: 'CollabSpace',
    description: '专为远程创意团队设计的实时协作白板。',
    category: 'Work',
    projectPath: '/collabspace/',
    imagePath: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop',
    tags: ['协作', '团队'],
    color: 'text-cyan-500',
    icon: 'groups'
  },
  {
    id: 'w3',
    title: 'TimeMaster',
    description: 'AI 驱动的智能日程安排与效率助手。',
    category: 'Work',
    projectPath: '/timemaster/',
    imagePath: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop',
    tags: ['效率', '时间管理'],
    color: 'text-sky-500',
    icon: 'calendar_month'
  },
  {
    id: 'w4',
    title: 'FinTrack',
    description: '极简主义风格的发票与企业支出追踪工具。',
    category: 'Work',
    projectPath: '/fintrack/',
    imagePath: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    tags: ['金融', '财务'],
    color: 'text-blue-500',
    icon: 'finance'
  },

  // --- LIFE (Lifestyle & Balance) ---
  {
    id: 'l1',
    title: 'ZenMind',
    description: '结合空间音频技术的冥想与助眠应用。',
    category: 'Life',
    projectPath: '/zenmind/',
    imagePath: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=800&auto=format&fit=crop',
    tags: ['健康', '冥想'],
    color: 'text-emerald-500',
    icon: 'self_improvement'
  },
  {
    id: 'l2',
    title: 'RhythmStream',
    description: '高保真无损音乐流媒体播放界面。',
    category: 'Life',
    projectPath: '/rhythmstream/',
    imagePath: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
    tags: ['音乐', '娱乐'],
    color: 'text-teal-500',
    icon: 'music_note'
  },
  {
    id: 'l3',
    title: 'Chef\'s Table',
    description: '全球精选食谱探索与个性化膳食计划。',
    category: 'Life',
    projectPath: '/chefstable/',
    imagePath: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    tags: ['美食', '生活方式'],
    color: 'text-lime-600',
    icon: 'restaurant'
  },

  // --- LEARNING (Knowledge) ---
  {
    id: 'le1',
    title: 'LingoMax',
    description: '沉浸式游戏化语言学习平台。',
    category: 'Learning',
    projectPath: '/lingomax/',
    imagePath: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop',
    tags: ['语言', '教育'],
    color: 'text-teal-600',
    icon: 'language'
  },
  {
    id: 'le2',
    title: 'AtomLab',
    description: '交互式元素周期表与化学实验模拟。',
    category: 'Learning',
    projectPath: '/atomlab/',
    imagePath: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    tags: ['科学', 'STEM'],
    color: 'text-cyan-600',
    icon: 'science'
  },
  {
    id: 'le3',
    title: 'Chronos',
    description: '3D 交互式世界历史时间轴。',
    category: 'Learning',
    projectPath: '/chronos/',
    imagePath: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop',
    tags: ['历史', '3D'],
    color: 'text-emerald-600',
    icon: 'history_edu'
  },

  // --- IT & GROWTH (Coding & Skills) ---
  {
    id: 'it1',
    title: 'AlgoMaster',
    description: '实时算法可视化演示与学习工具。',
    category: 'IT',
    projectPath: '/algomaster/',
    imagePath: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    tags: ['代码', '计算机科学'],
    color: 'text-amber-500',
    icon: 'code'
  },
  {
    id: 'it2',
    title: 'SysDesign Pro',
    description: '系统设计面试专用的架构绘图工具。',
    category: 'IT',
    projectPath: '/sysdesign/',
    imagePath: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    tags: ['架构', '系统设计'],
    color: 'text-yellow-600',
    icon: 'architecture'
  },
  {
    id: 'it3',
    title: 'InterviewBot',
    description: '提供实时反馈的 AI 模拟面试官。',
    category: 'IT',
    projectPath: '/interviewbot/',
    imagePath: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    tags: ['AI', '职业发展'],
    color: 'text-orange-400',
    icon: 'video_chat'
  },
];