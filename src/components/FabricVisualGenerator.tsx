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
      width: 1000,
      height: 700,
      backgroundColor: "#ffffff",
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
    
    const centerX = 500;
    const centerY = 350;
    
    // Create center node - larger and more detailed
    const centerCircle = new Circle({
      left: centerX - 80,
      top: centerY - 40,
      radius: 60,
      fill: colors.primary,
      stroke: '#ffffff',
      strokeWidth: 4,
    });
    
    // Center title - larger and clearer
    const centerText = new Text(title, {
      left: centerX - 75,
      top: centerY - 25,
      fontSize: 16,
      fill: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      width: 150,
    });

    canvas.add(centerCircle, centerText);

    // Create branch nodes with more detail
    const branchElements = visual.elements.filter(el => el.id !== 'center');
    branchElements.forEach((element, index) => {
      const angle = (index / branchElements.length) * 2 * Math.PI;
      const radius = 280;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Connection line - thicker and styled
      const line = new Line([centerX, centerY, x, y], {
        stroke: colors.muted,
        strokeWidth: 3,
        strokeDashArray: [8, 4],
      });
      
      // Branch circle - larger
      const branchCircle = new Circle({
        left: x - 45,
        top: y - 30,
        radius: 40,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 3,
      });
      
      // Branch text - larger and clearer
      const branchText = new Text(element.text, {
        left: x - 40,
        top: y - 15,
        fontSize: 14,
        fill: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        width: 80,
      });
      
      canvas.add(line, branchCircle, branchText);
    });
  };

  const createFlowChart = (visual: VisualData, canvas: FabricCanvas) => {
    canvas.clear();
    
    const startX = 120;
    const startY = 150;
    const stepWidth = 200;
    const stepHeight = 100;
    const gapX = 80;
    
    visual.elements.forEach((element, index) => {
      const x = startX + (index * (stepWidth + gapX));
      const y = startY + (index % 2) * 120;
      
      // Step rectangle - larger and more detailed
      const rect = new Rect({
        left: x,
        top: y,
        width: stepWidth,
        height: stepHeight,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 3,
        rx: 15,
        ry: 15,
      });
      
      // Step number badge
      const badge = new Circle({
        left: x + 10,
        top: y + 10,
        radius: 15,
        fill: '#ffffff',
        stroke: Object.values(colors)[index % Object.values(colors).length],
        strokeWidth: 2,
      });
      
      const badgeText = new Text((index + 1).toString(), {
        left: x + 20,
        top: y + 18,
        fontSize: 14,
        fill: Object.values(colors)[index % Object.values(colors).length],
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      });
      
      // Step text - larger and clearer with word wrapping
      const text = new Text(element.text, {
        left: x + 15,
        top: y + 45,
        fontSize: 13,
        fill: '#ffffff',
        fontWeight: 'bold',
        width: stepWidth - 30,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      });
      
      canvas.add(rect, badge, badgeText, text);
      
      // Arrow to next step - more prominent
      if (index < visual.elements.length - 1) {
        const nextX = startX + ((index + 1) * (stepWidth + gapX));
        const nextY = startY + ((index + 1) % 2) * 120;
        
        // Arrow line
        const arrow = new Line([x + stepWidth, y + stepHeight/2, nextX, nextY + stepHeight/2], {
          stroke: colors.primary,
          strokeWidth: 4,
        });
        
        // Arrow head
        const arrowHead = new Text('▶', {
          left: nextX - 15,
          top: nextY + stepHeight/2 - 10,
          fontSize: 16,
          fill: colors.primary,
          fontFamily: 'Arial, sans-serif',
        });
        
        canvas.add(arrow, arrowHead);
      }
    });
  };

  const createTimeline = (visual: VisualData, canvas: FabricCanvas) => {
    canvas.clear();
    
    const timelineY = 350;
    const startX = 120;
    const endX = 880;
    const stepWidth = (endX - startX) / Math.max(1, visual.elements.length - 1);
    
    // Timeline line - thicker and more prominent
    const timelineLine = new Line([startX, timelineY, endX, timelineY], {
      stroke: colors.primary,
      strokeWidth: 6,
    });
    canvas.add(timelineLine);
    
    visual.elements.forEach((element, index) => {
      const x = startX + (index * stepWidth);
      
      // Timeline dot - larger
      const dot = new Circle({
        left: x - 15,
        top: timelineY - 15,
        radius: 18,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 4,
      });
      
      // Event box - larger and more detailed
      const eventRect = new Rect({
        left: x - 90,
        top: timelineY - 120,
        width: 180,
        height: 80,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 3,
        rx: 12,
        ry: 12,
      });
      
      // Event number
      const eventNumber = new Text((index + 1).toString(), {
        left: x - 8,
        top: timelineY - 8,
        fontSize: 14,
        fill: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      });
      
      // Event text - larger and clearer
      const eventText = new Text(element.text, {
        left: x - 80,
        top: timelineY - 105,
        fontSize: 12,
        fill: '#ffffff',
        fontWeight: 'bold',
        width: 160,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      });
      
      // Connection line - more prominent
      const connectionLine = new Line([x, timelineY - 40, x, timelineY - 18], {
        stroke: colors.muted,
        strokeWidth: 3,
      });
      
      canvas.add(dot, eventRect, eventNumber, eventText, connectionLine);
    });
  };

  const createConceptMap = (visual: VisualData, canvas: FabricCanvas) => {
    canvas.clear();
    
    const concepts = visual.elements.slice(0, 9); // Limit to 9 concepts for better layout
    const cols = 3;
    const rows = Math.ceil(concepts.length / cols);
    const startX = 150;
    const startY = 120;
    const cellWidth = 250;
    const cellHeight = 150;
    
    concepts.forEach((element, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + (col * cellWidth);
      const y = startY + (row * cellHeight);
      
      // Concept box - larger and more detailed
      const conceptRect = new Rect({
        left: x,
        top: y,
        width: 220,
        height: 100,
        fill: Object.values(colors)[index % Object.values(colors).length],
        stroke: '#ffffff',
        strokeWidth: 3,
        rx: 15,
        ry: 15,
      });
      
      // Concept header with index
      const headerRect = new Rect({
        left: x,
        top: y,
        width: 220,
        height: 30,
        fill: 'rgba(255,255,255,0.2)',
        rx: 15,
        ry: 15,
      });
      
      const conceptIndex = new Text(`Concept ${index + 1}`, {
        left: x + 10,
        top: y + 8,
        fontSize: 12,
        fill: '#ffffff',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
      });
      
      // Concept text - larger and clearer with better wrapping
      const conceptText = new Text(element.text, {
        left: x + 15,
        top: y + 45,
        fontSize: 13,
        fill: '#ffffff',
        fontWeight: 'bold',
        width: 190,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      });
      
      canvas.add(conceptRect, headerRect, conceptIndex, conceptText);
      
      // Add connections to nearby concepts - more visible
      if (index > 0 && index % cols !== 0) {
        const prevCol = (index - 1) % cols;
        const prevRow = Math.floor((index - 1) / cols);
        const prevX = startX + (prevCol * cellWidth) + 220;
        const prevY = startY + (prevRow * cellHeight) + 50;
        
        const connectionLine = new Line([prevX, prevY, x, y + 50], {
          stroke: colors.primary,
          strokeWidth: 3,
          strokeDashArray: [6, 4],
        });
        
        // Connection arrow
        const connectionArrow = new Text('→', {
          left: (prevX + x) / 2 - 5,
          top: (prevY + y + 50) / 2 - 8,
          fontSize: 16,
          fill: colors.primary,
          fontFamily: 'Arial, sans-serif',
        });
        
        canvas.add(connectionLine, connectionArrow);
      }
      
      // Add vertical connections
      if (index >= cols) {
        const aboveRow = Math.floor((index - cols) / cols);
        const aboveX = startX + ((index - cols) % cols * cellWidth) + 110;
        const aboveY = startY + (aboveRow * cellHeight) + 100;
        
        const verticalLine = new Line([aboveX, aboveY, x + 110, y], {
          stroke: colors.secondary,
          strokeWidth: 3,
          strokeDashArray: [6, 4],
        });
        
        const verticalArrow = new Text('↓', {
          left: aboveX - 5,
          top: (aboveY + y) / 2 - 8,
          fontSize: 16,
          fill: colors.secondary,
          fontFamily: 'Arial, sans-serif',
        });
        
        canvas.add(verticalLine, verticalArrow);
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