export interface VisualData {
  type: 'mindmap' | 'flowchart' | 'timeline' | 'concept-map';
  title: string;
  elements: VisualElement[];
}

export interface VisualElement {
  id: string;
  text: string;
  x: number;
  y: number;
  connections?: string[];
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export const generateVisualFromContent = (content: string, title: string = "Visual Summary"): VisualData => {
  if (!content || content.trim().length === 0) {
    return {
      type: 'concept-map',
      title,
      elements: []
    };
  }

  // Extract key concepts and sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = content.toLowerCase().split(/\s+/);
  
  // Find important keywords (longer words, not common words)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those', 'can', 'may', 'might', 'must', 'shall', 'should', 'would'];
  
  const keywords = [...new Set(words)]
    .filter(word => word.length > 4 && !commonWords.includes(word))
    .slice(0, 8);

  // Determine visual type based on content characteristics
  let visualType: VisualData['type'] = 'concept-map';
  
  if (content.includes('step') || content.includes('first') || content.includes('then') || content.includes('next')) {
    visualType = 'flowchart';
  } else if (content.includes('timeline') || content.includes('history') || content.includes('year') || content.includes('date')) {
    visualType = 'timeline';
  } else if (keywords.length > 5) {
    visualType = 'mindmap';
  }

  const elements: VisualElement[] = [];
  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  switch (visualType) {
    case 'mindmap':
      // Central concept
      elements.push({
        id: 'center',
        text: title || 'Main Topic',
        x: 50,
        y: 50,
        size: 'large',
        color: colors[0]
      });

      // Branch concepts
      keywords.forEach((keyword, index) => {
        const angle = (index / keywords.length) * 2 * Math.PI;
        const radius = 30;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        
        elements.push({
          id: `branch-${index}`,
          text: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(15, Math.min(85, y)),
          connections: ['center'],
          color: colors[(index + 1) % colors.length],
          size: 'medium'
        });
      });
      break;

    case 'flowchart':
      const steps = sentences.slice(0, 5);
      steps.forEach((step, index) => {
        const shortStep = step.trim().substring(0, 40) + (step.length > 40 ? '...' : '');
        elements.push({
          id: `step-${index}`,
          text: shortStep,
          x: 20 + (index * 15),
          y: 30 + (index % 2) * 40,
          connections: index > 0 ? [`step-${index - 1}`] : undefined,
          color: colors[index % colors.length],
          size: 'medium'
        });
      });
      break;

    case 'timeline':
      keywords.slice(0, 6).forEach((item, index) => {
        elements.push({
          id: `timeline-${index}`,
          text: item.charAt(0).toUpperCase() + item.slice(1),
          x: 15 + (index * 12),
          y: 50,
          connections: index > 0 ? [`timeline-${index - 1}`] : undefined,
          color: colors[index % colors.length],
          size: 'small'
        });
      });
      break;

    case 'concept-map':
    default:
      // Main concepts from sentences
      const concepts = sentences.slice(0, 6).map((sentence, index) => {
        const shortText = sentence.trim().substring(0, 30) + (sentence.length > 30 ? '...' : '');
        return {
          id: `concept-${index}`,
          text: shortText,
          x: 20 + (index % 3) * 30,
          y: 25 + Math.floor(index / 3) * 40,
          color: colors[index % colors.length],
          size: 'medium' as const
        };
      });
      elements.push(...concepts);
      break;
  }

  return {
    type: visualType,
    title,
    elements
  };
};