export const transformContentLocally = (content: string, learningStyle: string): string => {
  if (!content || !learningStyle) return content;

  const cleanContent = content.trim();
  
  switch (learningStyle) {
    case 'visual':
      return `🎯 **Visual Learning Format**

📋 **Key Points:**
${extractKeyPoints(cleanContent)}

📊 **Structure Overview:**
${createVisualStructure(cleanContent)}

🎨 **Visual Summary:**
${cleanContent}

💡 **Remember:** Use diagrams, charts, and visual aids when studying this material.`;

    case 'auditory':
      return `🎵 **Auditory Learning Format**

🗣️ **Read Aloud Section:**
"${cleanContent}"

🎤 **Discussion Points:**
${createDiscussionPoints(cleanContent)}

🎧 **Study Tips:**
• Read this content aloud
• Discuss with others
• Create verbal summaries
• Use rhythmic patterns to remember key points

📢 **Main Content:**
${cleanContent}`;

    case 'kinesthetic':
      return `🤲 **Hands-On Learning Format**

⚡ **Action Steps:**
${createActionSteps(cleanContent)}

🔧 **Practice Activities:**
${createPracticeActivities(cleanContent)}

📝 **Interactive Notes:**
${cleanContent}

🎯 **Apply This:**
• Take notes while reading
• Create physical examples
• Use gestures while learning
• Break into small, actionable chunks`;

    case 'reading':
      return `📖 **Reading/Writing Learning Format**

📚 **Detailed Text Analysis:**

**Summary:**
${createSummary(cleanContent)}

**Key Terms & Definitions:**
${extractKeyTerms(cleanContent)}

**Detailed Content:**
${cleanContent}

**Written Exercises:**
• Rewrite main points in your own words
• Create an outline of this material
• Write questions about each section
• Make detailed notes with bullet points

📝 **Note-Taking Template:**
- Main Idea: ___________
- Supporting Details: ___________
- Questions: ___________`;

    default:
      return cleanContent;
  }
};

const extractKeyPoints = (content: string): string => {
  const sentences = content.split('.').filter(s => s.trim().length > 10);
  return sentences.slice(0, 5).map((point, index) => 
    `${index + 1}. ${point.trim()}.`
  ).join('\n');
};

const createVisualStructure = (content: string): string => {
  const words = content.split(' ');
  const sections = Math.ceil(words.length / 20);
  let structure = '';
  
  for (let i = 0; i < sections; i++) {
    const sectionWords = words.slice(i * 20, (i + 1) * 20);
    structure += `│ Section ${i + 1}: ${sectionWords.slice(0, 5).join(' ')}...\n`;
  }
  
  return structure;
};

const createDiscussionPoints = (content: string): string => {
  const sentences = content.split('.').filter(s => s.trim().length > 10);
  return sentences.slice(0, 3).map((point, index) => 
    `${index + 1}. What do you think about: "${point.trim()}"?`
  ).join('\n');
};

const createActionSteps = (content: string): string => {
  const sentences = content.split('.').filter(s => s.trim().length > 10);
  return sentences.slice(0, 4).map((step, index) => 
    `Step ${index + 1}: Practice - ${step.trim()}`
  ).join('\n');
};

const createPracticeActivities = (content: string): string => {
  return `• Write key points on sticky notes
• Create a mind map of the content
• Act out or demonstrate the concepts
• Build models or examples with your hands`;
};

const createSummary = (content: string): string => {
  const words = content.split(' ');
  const summaryLength = Math.min(50, Math.ceil(words.length * 0.3));
  return words.slice(0, summaryLength).join(' ') + (words.length > summaryLength ? '...' : '');
};

const extractKeyTerms = (content: string): string => {
  const words = content.toLowerCase().split(/\s+/);
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  const uniqueWords = [...new Set(words)]
    .filter(word => word.length > 4 && !commonWords.includes(word))
    .slice(0, 8);
    
  return uniqueWords.map((term, index) => 
    `${index + 1}. **${term.charAt(0).toUpperCase() + term.slice(1)}**: [Definition needed]`
  ).join('\n');
};