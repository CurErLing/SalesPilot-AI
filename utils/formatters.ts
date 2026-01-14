
export const getScoreColor = (score?: number) => {
  if (!score) return 'text-slate-400';
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

export const getHealthColor = (health: string) => {
  switch(health) {
      case 'Healthy': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'At Risk': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'Critical': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
  }
};

export const getHealthLabel = (health: string) => {
  switch(health) {
      case 'Healthy': return '优质客户 (Healthy)';
      case 'At Risk': return '存在风险 (At Risk)';
      case 'Critical': return '低价值/危险 (Critical)';
      default: return health;
  }
};

export const getStanceColor = (stance: string) => {
    switch(stance) {
        case 'Champion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Positive': return 'bg-green-50 text-green-600 border-green-200';
        case 'Negative': return 'bg-red-50 text-red-600 border-red-200';
        case 'Blocker': return 'bg-red-100 text-red-700 border-red-300';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

export const getStanceLabel = (stance: string) => {
    switch(stance) {
        case 'Champion': return '🔥 核心支持者';
        case 'Positive': return '😊 态度积极';
        case 'Neutral': return '😐 中立';
        case 'Negative': return '😟 态度消极';
        case 'Blocker': return '⛔ 反对者';
        default: return stance;
    }
};

export const getRoleColor = (role: string) => {
    switch (role) {
        case 'Economic Buyer': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Technical Buyer': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Coach': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'User Buyer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
};

export const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
        'Economic Buyer': '经济决策人 (EB)',
        'Technical Buyer': '技术把关人 (TB)',
        'User Buyer': '最终用户 (UB)',
        'Coach': '内线教练 (Coach)',
        'Gatekeeper': '把关人 (Gatekeeper)',
        'Influencer': '影响者 (Influencer)',
        'Unknown': '角色未知'
    };
    return map[role] || role;
};

export const getStatusColor = (status: string) => {
    if (status === '合格') return 'bg-purple-100 text-purple-700';
    if (status === '线索') return 'bg-blue-100 text-blue-700';
    if (status === '谈判') return 'bg-amber-100 text-amber-700';
    if (status === '赢单') return 'bg-emerald-100 text-emerald-700';
    if (status === '输单') return 'bg-slate-100 text-slate-500';
    return 'bg-slate-100 text-slate-700';
};

export const getSentimentColor = (sentiment?: string) => {
    switch(sentiment) {
        case 'Positive': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        case 'Negative': return 'text-red-500 bg-red-50 border-red-200';
        case 'Risk': return 'text-amber-600 bg-amber-50 border-amber-200';
        default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
};

export const getSentimentLabel = (sentiment?: string) => {
    switch(sentiment) {
        case 'Positive': return '推进顺利';
        case 'Negative': return '客户消极';
        case 'Risk': return '存在风险';
        default: return '一般互动';
    }
};
