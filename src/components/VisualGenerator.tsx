import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download } from "lucide-react";
import { generateVisualFromContent, VisualData } from "@/lib/visualGenerator";
import { toast } from "sonner";

interface VisualGeneratorProps {
  content: string;
  title?: string;
  onGenerated?: (visual: VisualData) => void;
}

export const VisualGenerator: React.FC<VisualGeneratorProps> = ({ 
  content, 
  title = "Visual Summary",
  onGenerated 
}) => {
  const [selectedType, setSelectedType] = React.useState<VisualData['type']>('concept-map');
  const [generatedVisual, setGeneratedVisual] = React.useState<VisualData | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const visualTypes = [
    { value: 'concept-map', label: 'Concept Map', icon: '🗂️' },
    { value: 'mindmap', label: 'Mind Map', icon: '🧠' },
    { value: 'flowchart', label: 'Flow Chart', icon: '📊' },
    { value: 'timeline', label: 'Timeline', icon: '⏱️' }
  ];

  const handleGenerate = async () => {
    if (!content?.trim()) {
      toast.error("No content available to visualize");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate brief processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const visual = generateVisualFromContent(content, title);
      visual.type = selectedType; // Override with selected type
      
      setGeneratedVisual(visual);
      onGenerated?.(visual);
      toast.success("Visual generated successfully!");
    } catch (error) {
      console.error('Error generating visual:', error);
      toast.error("Failed to generate visual");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVisual = () => {
    if (!generatedVisual) return;
    
    // Create a simple text representation for download
    const textData = `${generatedVisual.title}\n\nType: ${generatedVisual.type}\n\nElements:\n${
      generatedVisual.elements.map(el => `- ${el.text}`).join('\n')
    }`;
    
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-${generatedVisual.type}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Visual data downloaded!");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Generate Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Visual Type</label>
            <Select value={selectedType} onValueChange={setSelectedType as (value: string) => void}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visualTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={!content?.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Visual"}
          </Button>
        </CardContent>
      </Card>

      {generatedVisual && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">{generatedVisual.title}</CardTitle>
            <Button variant="outline" size="sm" onClick={downloadVisual}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-muted/20 rounded-lg overflow-hidden border">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100"
                className="absolute inset-0"
              >
                {/* Render connections first */}
                {generatedVisual.elements.map((element) => 
                  element.connections?.map((connectionId) => {
                    const target = generatedVisual.elements.find(el => el.id === connectionId);
                    if (!target) return null;
                    
                    return (
                      <line
                        key={`${element.id}-${connectionId}`}
                        x1={`${element.x}%`}
                        y1={`${element.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke="hsl(var(--border))"
                        strokeWidth="0.2"
                        strokeDasharray="0.5,0.3"
                      />
                    );
                  })
                )}
                
                {/* Render elements */}
                {generatedVisual.elements.map((element) => {
                  const size = element.size === 'large' ? 6 : element.size === 'medium' ? 4 : 3;
                  
                  return (
                    <g key={element.id}>
                      <circle
                        cx={`${element.x}%`}
                        cy={`${element.y}%`}
                        r={size}
                        fill={element.color || 'hsl(var(--primary))'}
                        opacity="0.8"
                        stroke="hsl(var(--background))"
                        strokeWidth="0.5"
                      />
                      <text
                        x={`${element.x}%`}
                        y={`${element.y + size + 3}%`}
                        textAnchor="middle"
                        fontSize="2.5"
                        fill="hsl(var(--foreground))"
                        className="font-medium"
                      >
                        {element.text}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Type:</strong> {generatedVisual.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • 
              <strong> Elements:</strong> {generatedVisual.elements.length}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};