export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic';

export interface Question {
  id: number;
  question: string;
  options: { text: string; style: LearningStyle }[];
}

export const quizQuestions: Question[] = [
  {
    id: 1,
    question: 'When learning something new, I prefer to:',
    options: [
      { text: 'See diagrams, charts, or visual demonstrations', style: 'visual' },
      { text: 'Listen to explanations or discussions', style: 'auditory' },
      { text: 'Read detailed instructions or texts', style: 'reading' },
      { text: 'Practice hands-on or try it myself', style: 'kinesthetic' },
    ],
  },
  {
    id: 2,
    question: "When remembering information, I find it easier to recall:",
    options: [
      { text: 'Pictures, graphs, or visual layouts', style: 'visual' },
      { text: "Conversations or things I've heard", style: 'auditory' },
      { text: "Written notes or text I've read", style: 'reading' },
      { text: "Things I've practiced or physically done", style: 'kinesthetic' },
    ],
  },
  {
    id: 3,
    question: 'When giving directions to someone, I would:',
    options: [
      { text: 'Draw a map or show them visually', style: 'visual' },
      { text: 'Tell them step by step verbally', style: 'auditory' },
      { text: 'Write down the directions', style: 'reading' },
      { text: 'Walk with them to show the way', style: 'kinesthetic' },
    ],
  },
  {
    id: 4,
    question: 'When studying for an exam, I prefer to:',
    options: [
      { text: 'Use flashcards, diagrams, or mind maps', style: 'visual' },
      { text: 'Discuss topics with others or record myself', style: 'auditory' },
      { text: 'Read and rewrite notes multiple times', style: 'reading' },
      { text: 'Use practice problems or real examples', style: 'kinesthetic' },
    ],
  },
  {
    id: 5,
    question: 'In a classroom, I learn best when:',
    options: [
      { text: 'The teacher uses slides, videos, or visual aids', style: 'visual' },
      { text: 'There are discussions and verbal explanations', style: 'auditory' },
      { text: 'I can take detailed written notes', style: 'reading' },
      { text: 'There are activities, labs, or hands-on work', style: 'kinesthetic' },
    ],
  },
  {
    id: 6,
    question: 'When I need to concentrate, I:',
    options: [
      { text: 'Need a clean, organized visual environment', style: 'visual' },
      { text: 'Can work with background music or sounds', style: 'auditory' },
      { text: 'Prefer quiet with written materials nearby', style: 'reading' },
      { text: 'Need to move around or use fidget tools', style: 'kinesthetic' },
    ],
  },
  {
    id: 7,
    question: 'When learning a new skill, I:',
    options: [
      { text: 'Watch demonstrations or video tutorials', style: 'visual' },
      { text: 'Listen to instructions and explanations', style: 'auditory' },
      { text: 'Read manuals or step-by-step guides', style: 'reading' },
      { text: 'Jump in and learn by doing', style: 'kinesthetic' },
    ],
  },
  {
    id: 8,
    question: 'When problem-solving, I tend to:',
    options: [
      { text: 'Visualize the problem and draw it out', style: 'visual' },
      { text: 'Talk through it with others', style: 'auditory' },
      { text: 'Write down pros and cons', style: 'reading' },
      { text: 'Try different approaches until something works', style: 'kinesthetic' },
    ],
  },
  {
    id: 9,
    question: 'When taking notes from a lecture, I:',
    options: [
      { text: 'Draw diagrams or highlight key visual elements', style: 'visual' },
      { text: 'Record the lecture or focus on the speaker’s tone', style: 'auditory' },
      { text: 'Write detailed summaries of the content', style: 'reading' },
      { text: 'Note actions to practice later or examples to try', style: 'kinesthetic' },
    ],
  },
  {
    id: 10,
    question: 'When choosing study materials, I prefer:',
    options: [
      { text: 'Charts, infographics, or color-coded notes', style: 'visual' },
      { text: 'Podcasts, recordings, or group discussions', style: 'auditory' },
      { text: 'Textbooks, articles, and handouts', style: 'reading' },
      { text: 'Interactive tools, simulations, or labs', style: 'kinesthetic' },
    ],
  },
  {
    id: 11,
    question: 'When recalling a conversation, I remember:',
    options: [
      { text: 'How people looked and what I saw', style: 'visual' },
      { text: 'The exact words or tone of voice', style: 'auditory' },
      { text: 'Key points I wrote down or read later', style: 'reading' },
      { text: 'Where I was and what I was doing', style: 'kinesthetic' },
    ],
  },
  {
    id: 12,
    question: 'If a device stops working, I first:',
    options: [
      { text: 'Look for a diagram or image guide', style: 'visual' },
      { text: 'Ask someone to explain how to fix it', style: 'auditory' },
      { text: 'Read the manual or troubleshooting steps', style: 'reading' },
      { text: 'Experiment by pressing buttons and trying things', style: 'kinesthetic' },
    ],
  },
  {
    id: 13,
    question: 'When planning a trip, I prefer to:',
    options: [
      { text: 'Look at maps and photos of destinations', style: 'visual' },
      { text: 'Listen to reviews or ask for recommendations', style: 'auditory' },
      { text: 'Read detailed itineraries and blog posts', style: 'reading' },
      { text: 'Go explore and figure it out as I go', style: 'kinesthetic' },
    ],
  },
  {
    id: 14,
    question: 'In group projects, I usually:',
    options: [
      { text: 'Sketch ideas and organize visuals for the team', style: 'visual' },
      { text: 'Lead discussions and share ideas verbally', style: 'auditory' },
      { text: 'Write out plans, tasks, and documentation', style: 'reading' },
      { text: 'Coordinate hands-on tasks and demos', style: 'kinesthetic' },
    ],
  },
  {
    id: 15,
    question: 'When learning vocabulary or definitions, I:',
    options: [
      { text: 'Use flashcards with images or color cues', style: 'visual' },
      { text: 'Say words aloud or use rhymes', style: 'auditory' },
      { text: 'Write definitions repeatedly', style: 'reading' },
      { text: 'Use the words in sentences or activities', style: 'kinesthetic' },
    ],
  },
  {
    id: 16,
    question: 'When following a recipe, I prefer to:',
    options: [
      { text: 'See step-by-step photos or videos', style: 'visual' },
      { text: 'Have someone talk me through it', style: 'auditory' },
      { text: 'Read the written instructions closely', style: 'reading' },
      { text: 'Start cooking and adjust as I go', style: 'kinesthetic' },
    ],
  },
  {
    id: 17,
    question: 'When learning software, I like to:',
    options: [
      { text: 'Watch interface walkthroughs or GIFs', style: 'visual' },
      { text: 'Listen to a tutorial explanation', style: 'auditory' },
      { text: 'Read the documentation or guides', style: 'reading' },
      { text: 'Click around and try features myself', style: 'kinesthetic' },
    ],
  },
  {
    id: 18,
    question: 'In a museum, I spend most time:',
    options: [
      { text: 'Looking at exhibits and reading visuals', style: 'visual' },
      { text: 'Listening to audio guides or talks', style: 'auditory' },
      { text: 'Reading descriptions and placards', style: 'reading' },
      { text: 'Trying interactive displays and activities', style: 'kinesthetic' },
    ],
  },
  {
    id: 19,
    question: 'When organizing information, I like to:',
    options: [
      { text: 'Create mind maps or flowcharts', style: 'visual' },
      { text: 'Discuss the structure with someone', style: 'auditory' },
      { text: 'Outline it in bullet points or lists', style: 'reading' },
      { text: 'Arrange sticky notes and move pieces around', style: 'kinesthetic' },
    ],
  },
  {
    id: 20,
    question: 'When exercising, I follow best when:',
    options: [
      { text: 'I see a trainer demonstrate the moves', style: 'visual' },
      { text: 'I listen to verbal cues and timing', style: 'auditory' },
      { text: 'I read a clear plan or routine', style: 'reading' },
      { text: 'I try the movements and adjust from feel', style: 'kinesthetic' },
    ],
  },
  {
    id: 21,
    question: 'When fixing furniture, I prefer:',
    options: [
      { text: 'Diagrams and exploded views', style: 'visual' },
      { text: 'Someone talking me through the steps', style: 'auditory' },
      { text: 'Written instructions with numbered steps', style: 'reading' },
      { text: 'Assembling it and learning by doing', style: 'kinesthetic' },
    ],
  },
  {
    id: 22,
    question: 'To stay focused while studying, I:',
    options: [
      { text: 'Use visual timers and color-coding', style: 'visual' },
      { text: 'Play ambient sounds or soft music', style: 'auditory' },
      { text: 'Create checklists and written plans', style: 'reading' },
      { text: 'Take movement breaks or change locations', style: 'kinesthetic' },
    ],
  },
  {
    id: 23,
    question: 'When understanding a complex process, I:',
    options: [
      { text: 'Draw it out step by step', style: 'visual' },
      { text: 'Explain it out loud to myself or others', style: 'auditory' },
      { text: 'Read a detailed explanation or article', style: 'reading' },
      { text: 'Recreate the process hands-on', style: 'kinesthetic' },
    ],
  },
  {
    id: 24,
    question: 'When revising for a test, I get the most from:',
    options: [
      { text: 'Visual summaries and highlighted notes', style: 'visual' },
      { text: 'Study groups and spoken explanations', style: 'auditory' },
      { text: 'Reading chapters and rewriting notes', style: 'reading' },
      { text: 'Practice tests and applied questions', style: 'kinesthetic' },
    ],
  },
  {
    id: 25,
    question: 'If I join a new sport or hobby class, I learn best by:',
    options: [
      { text: 'Watching the instructor demonstrate first', style: 'visual' },
      { text: 'Listening to instructions and tips', style: 'auditory' },
      { text: 'Reading rules or a quick guide', style: 'reading' },
      { text: 'Jumping in and practicing the basics', style: 'kinesthetic' },
    ],
  },
  {
    id: 26,
    question: 'When understanding data, I prefer:',
    options: [
      { text: 'Charts, graphs, and dashboards', style: 'visual' },
      { text: 'Talking through insights with someone', style: 'auditory' },
      { text: 'Reading detailed reports', style: 'reading' },
      { text: 'Manipulating the data hands-on', style: 'kinesthetic' },
    ],
  },
  {
    id: 27,
    question: 'When learning history, I remember best:',
    options: [
      { text: 'Timelines and pictures of events', style: 'visual' },
      { text: 'Storytelling and narrated accounts', style: 'auditory' },
      { text: 'Reading primary sources and summaries', style: 'reading' },
      { text: 'Reenactments or building models', style: 'kinesthetic' },
    ],
  },
  {
    id: 28,
    question: 'When troubleshooting code or logic, I:',
    options: [
      { text: 'Sketch the flow or visualize the logic', style: 'visual' },
      { text: 'Rubber-duck and talk through the problem', style: 'auditory' },
      { text: 'Read error logs and documentation', style: 'reading' },
      { text: 'Change code and test iteratively', style: 'kinesthetic' },
    ],
  },
  {
    id: 29,
    question: 'When trying to memorize a process, I:',
    options: [
      { text: 'Draw a diagram of the steps', style: 'visual' },
      { text: 'Repeat the steps out loud', style: 'auditory' },
      { text: 'Write the steps down as a list', style: 'reading' },
      { text: 'Perform the process physically', style: 'kinesthetic' },
    ],
  },
  {
    id: 30,
    question: 'When learning geometry or shapes, I prefer to:',
    options: [
      { text: 'See models and illustrations', style: 'visual' },
      { text: 'Listen to explanations of properties', style: 'auditory' },
      { text: 'Read definitions and theorems', style: 'reading' },
      { text: 'Build or manipulate objects', style: 'kinesthetic' },
    ],
  },
];
