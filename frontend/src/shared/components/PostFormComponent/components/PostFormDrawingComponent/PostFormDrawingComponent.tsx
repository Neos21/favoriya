import { FC, useEffect, useRef, useState } from 'react';

import { Box, Button } from '@mui/material';

type Props = {
  setFormData  : (previousFormData: any) => void,  // eslint-disable-line @typescript-eslint/no-explicit-any
  reloadTrigger: boolean  // boolean の変化自体でリロードがかかる
};

/** Post Form Drawing Component */
export const PostFormDrawingComponent: FC<Props> = ({ setFormData, reloadTrigger }) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);   // Canvas 要素の参照
  const containerRef = useRef<HTMLDivElement>(null);      // 親要素の参照
  const [isDrawing, setIsDrawing] = useState(false);      // 描画中か否か
  const [lineColor, setLineColor] = useState('#000000');  // 線の色
  const [lineWidth, setLineWidth] = useState(5);          // 線の太さ

  // Canvas のサイズを親要素に基づいてリサイズする
  const resizeCanvas = () => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    const context = canvas.getContext('2d');
    // リサイズ前のキャンバス内容を保存する
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width  = canvas.width;
    tempCanvas.height = canvas.height;
    const tempContext = tempCanvas.getContext('2d');
    tempContext.drawImage(canvas, 0, 0);
    // 親要素の最小辺を基に正方形サイズを設定する
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width  = size;
    canvas.height = size;
    context.fillStyle = '#ffffff';  // 白背景
    context.fillRect(0, 0, canvas.width, canvas.height);
    // 保存した内容を再描画する
    context.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
  };
  // 初期設定とウィンドウサイズ変更時のリサイズに対応する
  useEffect(() => {
    resizeCanvas();
    setTimeout(resizeCanvas, 1);  // 座標ズレ回避でもう一度発動させる
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);
  
  // 描画開始
  const startDrawing = (x: number, y: number, event?: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    // Prevent Touch Scrolling
    event?.preventDefault();
  };
  
  // 描画中
  const draw = (x: number, y: number, event?: React.MouseEvent | React.TouchEvent) => {
    if(!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineTo(x, y);
    context.strokeStyle = lineColor;
    context.lineWidth   = lineWidth;
    context.lineCap     = 'round';
    context.stroke();
    // Prevent Touch Scrolling
    event?.preventDefault();
  };
  
  // 描画終了
  const stopDrawing = async () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    // キャンバスデータを File に変換する
    const file = await new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob != null ? new File([blob], 'drawing.png', { type: 'image/png' }) : null), 'image/png', 1);
    });
    setFormData(previousFormData => ({ ...previousFormData, file }));
  };
  
  // 位置を計算する
  const getPosition = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if('touches' in event) {
      const touch = event.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    else {
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
  };
  
  // リセットボタン
  const whiteCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';  // 白背景
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  const transparentCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  // Submit 後にリセットする
  useEffect(() => {
    whiteCanvas();
  }, [reloadTrigger]);
  
  return <>
    <Box component="div">
      <label style={{ marginRight: '.5rem' }}>色 : <input type="color" value={lineColor} onChange={event => setLineColor(event.target.value)} /></label>
      <label style={{ marginRight: '.5rem' }}>太さ : <input type="range" min="1" max="20" value={lineWidth} onChange={event => setLineWidth(Number(event.target.value))} /></label>
      <Button variant="contained" size="small" color="error" onClick={whiteCanvas}       sx={{ verticalAlign: 'bottom', mr: 1 }}>白地リセット</Button>
      <Button variant="outlined"  size="small" color="info"  onClick={transparentCanvas} sx={{ verticalAlign: 'bottom' }}>透明リセット</Button>
    </Box>
    <Box component="div" ref={containerRef} sx={{ mt: 1, minWidth: '250px', minHeight: '250px', maxWidth: '600px', maxHeight: '600px', border: '1px solid', borderColor: 'grey.500', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'pinch-zoom' }}
        onMouseDown={event => { const { x, y } = getPosition(event); startDrawing(x, y, event); }}
        onMouseMove={event => { const { x, y } = getPosition(event); draw(x, y, event); }}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={event => { event.preventDefault(); const { x, y } = getPosition(event); startDrawing(x, y, event); }}
        onTouchMove={event => { event.preventDefault(); const { x, y } = getPosition(event); draw(x, y, event); }}
        onTouchEnd={event => { event.preventDefault(); stopDrawing(); }}
      />
    </Box>
  </>;
};
