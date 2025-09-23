import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeadingLevel } from "docx";

interface FlashcardData {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
}

interface SmartDownloadButtonProps {
  flashcards?: FlashcardData[];
  quiz?: QuizQuestion[];
  enhancedNotes?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const SmartDownloadButton = ({ 
  flashcards, 
  quiz, 
  enhancedNotes,
  variant = "outline",
  size = "sm",
  className = ""
}: SmartDownloadButtonProps) => {
  const { toast } = useToast();

  const downloadContent = async () => {
    try {
      if (enhancedNotes) {
        // Download enhanced notes as HTML for Word
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Enhanced Notes</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            font-size: 28px;
            margin: 30px 0 20px 0;
        }
        h2 {
            color: #1e40af;
            font-size: 22px;
            margin: 25px 0 15px 0;
        }
        h3 {
            color: #1e3a8a;
            font-size: 18px;
            margin: 20px 0 10px 0;
        }
        p {
            margin: 12px 0;
            text-align: justify;
        }
        strong {
            color: #2563eb;
            font-weight: 600;
        }
        em {
            color: #64748b;
            font-style: italic;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        li {
            margin: 5px 0;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 10px;
        }
        .title {
            font-size: 32px;
            color: #0f172a;
            margin: 0;
            font-weight: 700;
        }
        .subtitle {
            color: #64748b;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Enhanced Notes</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
    </div>
    <div class="content">
        ${enhancedNotes
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^• (.*$)/gm, '<li>$1</li>')
          .replace(/^- (.*$)/gm, '<li>$1</li>')
          .replace(/(\n<li.*?>.*?<\/li>)+/gs, '<ul>$&</ul>')
          .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
          .replace(/(\n<li.*?>.*?<\/li>)+/gs, '<ol>$&</ol>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/^(?!<[h|u|o|l])(.+)$/gm, '<p>$1</p>')
          .replace(/<p><\/p>/g, '')
        }
    </div>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced-notes-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Enhanced notes downloaded!",
          description: "HTML file created - opens in Word with formatting",
        });
        
      } else if (flashcards && flashcards.length > 0) {
        // Download flashcards as a DOCX with a two-column table (Front / Back)
        const rows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "Front", heading: HeadingLevel.HEADING_3 })] }),
              new TableCell({ children: [new Paragraph({ text: "Back", heading: HeadingLevel.HEADING_3 })] }),
            ],
          }),
          ...flashcards.map((card) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(card.question.replace(/[\r\n\t]+/g, ' ').trim())] }),
                new TableCell({ children: [new Paragraph(card.answer.replace(/[\r\n\t]+/g, ' ').trim())] }),
              ],
            })
          ),
        ];

        const table = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        });

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({ text: "Flashcards", heading: HeadingLevel.HEADING_1 }),
                table,
              ],
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcards-${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "✅ Flashcards downloaded!",
          description: `Saved as .docx with a two-column table (Front/Back)`,
        });
        
      } else if (quiz && quiz.length > 0) {
        // Create a properly formatted Word document for the quiz
        const children = [
          new Paragraph({
            text: "Study Quiz",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}`,
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: `Total Questions: ${quiz.length}`,
            spacing: { after: 600 }
          }),
          new Paragraph({
            text: "Instructions: Choose the best answer for each question.",
            spacing: { after: 800 }
          }),
        ];

        // Add each question with options
        quiz.forEach((q, index) => {
          children.push(
            new Paragraph({
              text: `${index + 1}. ${q.question}`,
              spacing: { before: 400, after: 200 },
              numbering: undefined
            })
          );
          
          // Add options A, B, C, D
          Object.entries(q.options).forEach(([letter, option]) => {
            children.push(
              new Paragraph({
                text: `   ${letter}) ${option}`,
                spacing: { after: 100 }
              })
            );
          });
        });

        // Add answer key section
        children.push(
          new Paragraph({
            text: "Answer Key",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 800, after: 400 }
          })
        );

        quiz.forEach((q, index) => {
          children.push(
            new Paragraph({
              text: `${index + 1}. ${q.correctAnswer}) ${q.options[q.correctAnswer as keyof typeof q.options]}`,
              spacing: { after: 100 }
            })
          );
        });

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: children,
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "✅ Quiz downloaded!",
          description: `Downloaded ${quiz.length} questions as formatted Word document`,
        });
        
      } else {
        toast({
          title: "Nothing to download",
          description: "No content available for download",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the content",
        variant: "destructive",
      });
    }
  };

  // Don't show button if no content is available
  if (!enhancedNotes && !flashcards?.length && !quiz?.length) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={downloadContent}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );
};

export default SmartDownloadButton;