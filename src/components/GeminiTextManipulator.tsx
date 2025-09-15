import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GeminiTextManipulatorProps {
  content: string;
  onTransformed: (transformedContent: string) => void;
}

const manipulationOptions = [
  { value: 'summarize', label: 'Summarize', description: 'Create a concise summary' },
  { value: 'expand', label: 'Expand', description: 'Add more detail and examples' },
  { value: 'simplify', label: 'Simplify', description: 'Make it easier to understand' },
  { value: 'professional', label: 'Make Professional', description: 'Formal business tone' },
  { value: 'casual', label: 'Make Casual', description: 'Friendly conversational tone' },
  { value: 'bullets', label: 'Convert to Bullets', description: 'Organize into bullet points' },
  { value: 'questions', label: 'Generate Questions', description: 'Create study questions' },
  { value: 'outline', label: 'Create Outline', description: 'Structured topic outline' },
];

const GeminiTextManipulator = ({ content, onTransformed }: GeminiTextManipulatorProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const { toast } = useToast();

  const handleTransform = async () => {
    if (!content || (!selectedOption && !customPrompt)) return;

    setIsProcessing(true);
    setResult('');
    
    try {
      let prompt = '';
      
      if (customPrompt) {
        prompt = `${customPrompt}\n\nContent to transform:\n${content}`;
      } else {
        const option = manipulationOptions.find(opt => opt.value === selectedOption);
        switch (selectedOption) {
          case 'summarize':
            prompt = `Create a concise summary of the following content, highlighting the key points and main ideas:\n\n${content}`;
            break;
          case 'expand':
            prompt = `Expand on the following content by adding more detail, examples, and explanations to make it more comprehensive:\n\n${content}`;
            break;
          case 'simplify':
            prompt = `Rewrite the following content in simpler language that's easier to understand, breaking down complex concepts:\n\n${content}`;
            break;
          case 'professional':
            prompt = `Rewrite the following content in a professional, formal business tone suitable for corporate communication:\n\n${content}`;
            break;
          case 'casual':
            prompt = `Rewrite the following content in a casual, friendly conversational tone:\n\n${content}`;
            break;
          case 'bullets':
            prompt = `Convert the following content into a well-organized bullet point format, maintaining all important information:\n\n${content}`;
            break;
          case 'questions':
            prompt = `Generate thoughtful study questions based on the following content that would help someone learn and understand the material:\n\n${content}`;
            break;
          case 'outline':
            prompt = `Create a detailed structured outline of the following content, organizing it into main topics and subtopics:\n\n${content}`;
            break;
        }
      }

      const { data, error } = await supabase.functions.invoke('gemini-text-manipulator', {
        body: { prompt }
      });

      if (error) throw error;

      setResult(data.transformedText);
      onTransformed(data.transformedText);
      
      toast({
        title: "Content transformed!",
        description: customPrompt ? "Custom transformation completed" : `Content ${selectedOption}d successfully`,
      });
    } catch (error: any) {
      console.error('Transform error:', error);
      toast({
        title: "Transform failed",
        description: error.message || "Failed to transform content",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gradient-subtle border border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Gemini Text Manipulation</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Actions</label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a transformation..." />
              </SelectTrigger>
              <SelectContent>
                {manipulationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Custom Instruction</label>
            <Textarea
              placeholder="Enter your custom instruction for how to transform the text..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <Button
          onClick={handleTransform}
          disabled={(!selectedOption && !customPrompt) || isProcessing || !content}
          className="w-full mt-4"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Transform Text
            </>
          )}
        </Button>
        
        {!content && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Upload a note with content to start transforming
          </p>
        )}
      </Card>

      {result && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Transformed Content</h3>
          </div>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">{result}</div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GeminiTextManipulator;