import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

const VIEWPORT = 260;
const OUTPUT_SIZE = 400;

export default function ImageCropDialog({ open, imageUrl, onCancel, onConfirm }) {
  const imgElRef = useRef(null);
  const dragRef = useRef(null);
  const [imgSize, setImgSize] = useState(null);
  const [baseScale, setBaseScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!open || !imageUrl) return;
    const img = new Image();
    img.onload = () => {
      const s = Math.max(VIEWPORT / img.width, VIEWPORT / img.height);
      imgElRef.current = img;
      setImgSize({ width: img.width, height: img.height });
      setBaseScale(s);
      setScale(s);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageUrl;
  }, [open, imageUrl]);

  if (!open) return null;

  const clampOffset = (ox, oy, s, size) => {
    if (!size) return { x: 0, y: 0 };
    const dw = size.width * s;
    const dh = size.height * s;
    const maxX = Math.max(0, (dw - VIEWPORT) / 2);
    const maxY = Math.max(0, (dh - VIEWPORT) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  };

  const handlePointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(
      clampOffset(dragRef.current.offset.x + dx, dragRef.current.offset.y + dy, scale, imgSize)
    );
  };
  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleZoom = (e) => {
    const newScale = Number(e.target.value);
    setScale(newScale);
    setOffset((prev) => clampOffset(prev.x, prev.y, newScale, imgSize));
  };

  const handleConfirm = () => {
    const img = imgElRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = VIEWPORT / 2 - dw / 2 + offset.x;
    const dy = VIEWPORT / 2 - dh / 2 + offset.y;
    const sx = -dx / scale;
    const sy = -dy / scale;
    const sSize = VIEWPORT / scale;
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, "image/png");
  };

  const dw = imgSize ? imgSize.width * scale : 0;
  const dh = imgSize ? imgSize.height * scale : 0;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="crop-card" onClick={(e) => e.stopPropagation()}>
        <div className="crop-title">사진의 영역을 선택하세요</div>
        <div
          className="crop-viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {imgSize && (
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className="crop-image"
              style={{
                width: dw,
                height: dh,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          <div className="crop-circle-guide" />
        </div>
        <input
          className="crop-zoom-slider"
          type="range"
          min={baseScale}
          max={baseScale * 3}
          step={(baseScale * 3 - baseScale) / 100 || 0.01}
          value={scale}
          onChange={handleZoom}
        />
        <div className="crop-actions">
          <Button variant="gray" onClick={onCancel} className="crop-action-btn">
            취소
          </Button>
          <Button onClick={handleConfirm} className="crop-action-btn">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
