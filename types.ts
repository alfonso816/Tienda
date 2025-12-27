
export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface MarketInsight {
  title: string;
  description: string;
  source: string;
  url: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export enum DashboardTab {
  OVERVIEW = 'overview',
  ANALYTICS = 'analytics',
  MARKET_INTEL = 'market_intel',
  AI_CHAT = 'ai_chat',
}
