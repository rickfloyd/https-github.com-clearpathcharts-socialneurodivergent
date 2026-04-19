import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text } from 'react-konva';
import { 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  ArrowUpRight, 
  Type, 
  Eraser, 
  Undo, 
  Redo, 
  Download, 
  X,
  Check,
  Palette
} from 'lucide-react';

interface ChartMarkupToolProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const ChartMarkupTool: React.FC<ChartMarkupToolProps> = ({ mediaUrl, mediaType, onSave, onCancel }) => {
  const [tool, setTool] = useState<string>('pen');
  const [lines, setLines] = useState<any[]>([]);
  const [color, setColor] = useState<string>('#4D00FF'); // Neon Indigo default
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('markup-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color, strokeWidth }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    if (tool === 'pen' || tool === 'eraser') {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
    } else {
      // For shapes, we just update the end point
      lastLine.points = [lastLine.points[0], lastLine.points[1], point.x, point.y];
    }

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleUndo = () => {
    setLines(lines.slice(0, -1));
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    onSave(uri);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
      {/* Toolbar */}
      <div className="h-16 bg-black border-b border-indigo-500/20 flex items-center justify-between px-6 glass">
        <div className="flex items-center space-x-4">
          <div className="flex bg-[#1a1a2e] rounded-lg p-1 glass">
            {[
              { id: 'pen', icon: Pencil },
              { id: 'rect', icon: Square },
              { id: 'circle', icon: CircleIcon },
              { id: 'arrow', icon: ArrowUpRight },
              { id: 'text', icon: Type },
              { id: 'eraser', icon: Eraser },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`p-2 rounded-md transition-all ${tool === t.id ? 'bg-indigo-500 text-white' : 'text-[#5c5e6e] hover:text-[#ccc8db]'}`}
              >
                <t.icon size={18} />
              </button>
            ))}
          </div>

          <div className="h-8 w-[1px] bg-[#272a3a]" />

          <div className="flex items-center space-x-2">
            {['#4D00FF', '#ff0055', '#00ff00', '#ffff00', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="h-8 w-[1px] bg-[#272a3a]" />

          <div className="flex items-center space-x-2">
            <button onClick={handleUndo} className="p-2 text-[#5c5e6e] hover:text-[#ccc8db]">
              <Undo size={18} />
            </button>
            <button className="p-2 text-[#5c5e6e] hover:text-[#ccc8db]">
              <Redo size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={onCancel}
            className="flex items-center space-x-2 px-4 py-2 text-[#5c5e6e] hover:text-red-500 transition-colors font-bold uppercase text-xs"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-500 text-white rounded font-black uppercase text-xs shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:brightness-110 transition-all"
          >
            <Check size={18} />
            <span>Apply Markup</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div id="markup-container" className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#050505]">
        <div className="relative" style={{ width: stageSize.width, height: stageSize.height }}>
          {/* Background Media */}
          {mediaType === 'image' ? (
            <img 
              src={mediaUrl} 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              alt="Background"
              referrerPolicy="no-referrer"
            />
          ) : (
            <video 
              ref={videoRef}
              src={mediaUrl} 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              autoPlay
              loop
              muted
              onError={() => console.error('Markup tool video load failed')}
            />
          )}

          {/* Drawing Layer */}
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            ref={stageRef}
            className="absolute inset-0"
          >
            <Layer>
              {lines.map((line, i) => {
                if (line.tool === 'pen' || line.tool === 'eraser') {
                  return (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation={
                        line.tool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                    />
                  );
                } else if (line.tool === 'rect') {
                  return (
                    <Rect
                      key={i}
                      x={line.points[0]}
                      y={line.points[1]}
                      width={line.points[2] - line.points[0]}
                      height={line.points[3] - line.points[1]}
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                    />
                  );
                } else if (line.tool === 'circle') {
                  const radius = Math.sqrt(
                    Math.pow(line.points[2] - line.points[0], 2) +
                    Math.pow(line.points[3] - line.points[1], 2)
                  );
                  return (
                    <Circle
                      key={i}
                      x={line.points[0]}
                      y={line.points[1]}
                      radius={radius}
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                    />
                  );
                } else if (line.tool === 'arrow') {
                  return (
                    <Arrow
                      key={i}
                      points={line.points}
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                      fill={line.color}
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default ChartMarkupTool;
