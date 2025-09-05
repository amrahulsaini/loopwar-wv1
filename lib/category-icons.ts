// Category icon mapping utility
export const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, string> = {
    'core-dsa': 'Workflow',
    'system-design': 'Server',
    'web-development': 'Globe',
    'mobile-development': 'Smartphone',
    'data-science': 'BarChart3',
    'machine-learning': 'Brain',
    'devops': 'Settings',
    'security': 'Shield',
    'databases': 'Database',
    'cloud-computing': 'Cloud',
    'programming-languages': 'Code',
    'algorithms': 'Zap',
    'competitive-programming': 'Trophy',
    'interview-preparation': 'Briefcase',
    'default': 'BookOpen'
  };

  // Convert URL format to lookup format
  const lookupKey = categoryName.toLowerCase().replace(/-/g, '-');
  return iconMap[lookupKey] || iconMap['default'];
};

export const getCategoryColor = (categoryName: string) => {
  const colorMap: Record<string, string> = {
    'core-dsa': '#3b82f6', // blue
    'system-design': '#ef4444', // red
    'web-development': '#10b981', // green
    'mobile-development': '#f59e0b', // yellow
    'data-science': '#8b5cf6', // purple
    'machine-learning': '#06b6d4', // cyan
    'devops': '#f97316', // orange
    'security': '#84cc16', // lime
    'databases': '#6366f1', // indigo
    'cloud-computing': '#ec4899', // pink
    'programming-languages': '#14b8a6', // teal
    'algorithms': '#f43f5e', // rose
    'competitive-programming': '#eab308', // amber
    'interview-preparation': '#64748b', // slate
    'default': '#6b7280' // gray
  };

  const lookupKey = categoryName.toLowerCase().replace(/-/g, '-');
  return colorMap[lookupKey] || colorMap['default'];
};
