import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, Line, Text, Group } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download, RotateCcw } from "lucide-react";
import { generateVisualFromContent, VisualData } from "@/lib/visualGenerator";
import { toast } from "sonner";

interface FabricVisualGeneratorProps {
  content: string;
  title?: string;
  onGenerated?: (visual: VisualData) => void;
}

export const FabricVisualGenerator: React.FC<FabricVisualGeneratorProps> = ({ 
  content, 
  title = "Visual Summary",
  onGenerated 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedType, setSelectedType] = useState<VisualData['type']>('concept-map');
  const [generatedVisual, setGeneratedVisual] = useState<VisualData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const visualTypes = [
    { value: 'concept-map', label: 'Concept Map', icon: '🗂️' },
    { value: 'mindmap', label: 'Mind Map', icon: '🧠' },
    { value: 'flowchart', label: 'Flow Chart', icon: '📊' },
    { value: 'timeline', label: 'Timeline', icon: '⏱️' }
  ];

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "hsl(var(--background))",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981', 
    accent: '#f59e0b',
    muted: '#6b7280',
    chart1: '#8b5cf6',
    chart2: '#ef4444'
  };

  const createMindMap = (visual: VisualData, canvas: FabricCanvas) => {
    canvas.clear();
    
    const centerX = 400;
    const centerY = 250;
    
    // Create center node
    const centerCircle = new Circle({
      left: centerX - 60,
      top: centerY - 30,
      radius: 40,
      fill: colors.primary,
      stroke: '#ffffff',
      strokeWidth: 3,
    });
    
    const centerText = new Text(title.length > 15 ? title.substring(0, 15) + '...' : title, {
      left: centerX - 50,
      top: centerY - 15,
      fontSize: 14,
      fill: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    });

    canvas.add(centerCircle, centerText);

    // Create branch nodes
    visual.elements.forEach((element, index) => {
      if (element.id === 'center') return;
      
      const angle = (index / (visual.elements.length - 1)) * 2 * Math.PI;
      const radius = 200;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Connection line
      const line = new Line([centerX, centerY, x, y], {
        stroke: colors.muted,
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      });
      
      // Branch circle
      const branchCircle = new Circle({
        left: x - 30,
        top: y - 20,
        radius: 25,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 2,
      });
      
      // Branch text
      const branchText = new Text(element.text.length > 10 ? element.text.substring(0, 10) + '...' : element.text, {
        left: x - 25,
        top: y - 8,
        fontSize: 10,
        fill: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
      });
      
      canvas.add(line, branchCircle, branchText);
    });
  };

  const createFlowChart = (visual: VisualData, canvas: FabricCanvas) => {
    canvas.clear();
    
    const startX = 100;
    const startY = 100;
    const stepWidth = 150;
    const stepHeight = 80;
    
    visual.elements.forEach((element, index) => {
      const x = startX + (index * (stepWidth + 50));
      const y = startY + (index % 2) * 100;
      
      // Step rectangle
      const rect = new Rect({
        left: x,
        top: y,
        width: stepWidth,
        height: stepHeight,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 2,
        rx: 10,
        ry: 10,
      });
      
      // Step text
      const text = new Text(element.text.length > 20 ? element.text.substring(0, 20) + '...' : element.text, {
        left: x + 10,
        top: y + 25,
        fontSize: 11,
        fill: '#ffffff',
        fontWeight: 'bold',
        width: stepWidth - 20,
        textAlign: 'center',
      });
      
      canvas.add(rect, text);
      
      // Arrow to next step
      if (index < visual.elements.length - 1) {
        const nextX = startX + ((index + 1) * (stepWidth + 50));
        const nextY = startY + ((index + 1) % 2) * 100;
        
        const arrow = new Line([x + stepWidth, y + stepHeight/2, nextX, nextY + stepHeight/2], {
          stroke: colors.muted,
          strokeWidth: 3,
        });
        
        canvas.add(arrow);
      }
    });
  };

  const createTimeline = (visual: VisualData, canvas: FabricCanvas) => {
    canvas.clear();
    
    const timelineY = 250;
    const startX = 80;
    const endX = 720;
    const stepWidth = (endX - startX) / Math.max(1, visual.elements.length - 1);
    
    // Timeline line
    const timelineLine = new Line([startX, timelineY, endX, timelineY], {
      stroke: colors.primary,
      strokeWidth: 4,
    });
    canvas.add(timelineLine);
    
    visual.elements.forEach((element, index) => {
      const x = startX + (index * stepWidth);
      
      // Timeline dot
      const dot = new Circle({
        left: x - 8,
        top: timelineY - 8,
        radius: 12,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 3,
      });
      
      // Event box
      const eventRect = new Rect({
        left: x - 60,
        top: timelineY - 80,
        width: 120,
        height: 50,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 2,
        rx: 8,
        ry: 8,
      });
      
      // Event text
      const eventText = new Text(element.text.length > 15 ? element.text.substring(0, 15) + '...' : element.text, {
        left: x - 50,
        top: timelineY - 65,
        fontSize: 10,
        fill: '#ffffff',
        fontWeight: 'bold',
        width: 100,
        textAlign: 'center',
      });
      
      // Connection line
      const connectionLine = new Line([x, timelineY - 30, x, timelineY - 12], {
        stroke: colors.muted,
        strokeWidth: 2,
      });
      
      canvas.add(dot, eventRect, eventText, connectionLine);
    });
  };

  const createConceptMap = (visual: VisualData, canvas: FabricCanvas) => {
    canvas.clear();
    
    const concepts = visual.elements.slice(0, 8); // Limit to 8 concepts for better layout
    const cols = 3;
    const rows = Math.ceil(concepts.length / cols);
    const startX = 100;
    const startY = 80;
    const cellWidth = 200;
    const cellHeight = 120;
    
    concepts.forEach((element, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + (col * cellWidth);
      const y = startY + (row * cellHeight);
      
      // Concept box
      const conceptRect = new Rect({
        left: x,
        top: y,
        width: 160,
        height: 80,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 2,
        rx: 12,
        ry: 12,
      });
      
      // Concept text
      const conceptText = new Text(element.text.length > 25 ? element.text.substring(0, 25) + '...' : element.text, {
        left: x + 10,
        top: y + 25,
        fontSize: 11,
        fill: '#ffffff',
        fontWeight: 'bold',
        width: 140,
        textAlign: 'center',
      });
      
      canvas.add(conceptRect, conceptText);
      
      // Add connections to nearby concepts
      if (index > 0 && index % cols !== 0) {
        const prevX = startX + ((index - 1) % cols * cellWidth) + 160;
        const prevY = startY + (Math.floor((index - 1) / cols) * cellHeight) + 40;
        
        const connectionLine = new Line([prevX, prevY, x, y + 40], {
          stroke: colors.muted,
          strokeWidth: 2,
          strokeDashArray: [3, 3],
        });
        
        canvas.add(connectionLine);
      }
    });
  };

  const handleGenerate = async () => {
    if (!content?.trim() || !fabricCanvas) {
      toast.error("No content available to visualize");
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const visual = generateVisualFromContent(content, title);
      visual.type = selectedType;
      
      // Generate the appropriate visual type
      switch (selectedType) {
        case 'mindmap':
          createMindMap(visual, fabricCanvas);
          break;
        case 'flowchart':
          createFlowChart(visual, fabricCanvas);
          break;
        case 'timeline':
          createTimeline(visual, fabricCanvas);
          break;
        case 'concept-map':
        default:
          createConceptMap(visual, fabricCanvas);
          break;
      }
      
      fabricCanvas.renderAll();
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
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.download = `visual-${selectedType}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    toast.success("Visual downloaded!");
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "hsl(var(--background))";
    fabricCanvas.renderAll();
    setGeneratedVisual(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Generate Interactive Visual
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
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate}
              disabled={!content?.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? "Generating..." : "Generate Visual"}
            </Button>
            
            {generatedVisual && (
              <>
                <Button variant="outline" onClick={downloadVisual}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={clearCanvas}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <canvas 
              ref={canvasRef}
              className="w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          {generatedVisual && (
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Type:</strong> {generatedVisual.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • 
              <strong> Elements:</strong> {generatedVisual.elements.length}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};