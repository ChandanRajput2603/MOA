import React, { useEffect, useRef, useState } from "react";
import { api, errorMessage } from "./api";
import "./sport-image-field.css";

const ignorePending = (_pending: boolean) => {};
export default function SportImageField({value, onChange, onPending = ignorePending, aspect = 4/3, label = "Image", circular = false}: {
  value: string; onChange: (url: string) => void; onPending?: (pending: boolean) => void; aspect?: number; label?: string; circular?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<"crop" | "fit">("crop");
  const outputHeight = Math.round(1200 / aspect);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    let active = true;
    image.onload = () => { if(active) setSource(image); };
    image.onerror = () => { if(active) { setError("This image could not be opened. Choose a PNG, JPEG or WebP image."); setFile(null); onPending(false); } };
    image.src = url;
    return () => { active = false; URL.revokeObjectURL(url); };
  }, [file, onPending]);
  useEffect(() => {
    if (!source || !canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    if (!ctx) { setError("Image cropping is unavailable in this browser."); return; }
    const width = source.naturalWidth, height = source.naturalHeight;
    const cropW = Math.min(width, height * aspect) / zoom;
    const cropH = cropW / aspect;
    ctx.clearRect(0,0,1200,outputHeight);
    if(mode === "fit") {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,1200,outputHeight);
      const scale = Math.min(1200/width,outputHeight/height);
      ctx.drawImage(source,(1200-width*scale)/2,(outputHeight-height*scale)/2,width*scale,height*scale);
      return;
    }
    ctx.drawImage(source, (width-cropW)*x/100, (height-cropH)*y/100, cropW,cropH,0,0,1200,outputHeight);
  }, [source, zoom, x, y, mode, aspect, outputHeight]);
  function cancel() { setFile(null);setSource(null);setError("");onPending(false); }
  async function upload() {
    if(!canvas.current || !source || busy) return;
    if(!canvas.current.getContext("2d")) { setError("Image cropping is unavailable in this browser."); return; }
    setBusy(true);setError("");
    try {
      const blob = await new Promise<Blob>((resolve,reject) => canvas.current!.toBlob(
        b => b ? resolve(b) : reject(new Error("Could not crop this image.")), "image/png"));
      const form = new FormData();
      form.append("file", new File([blob], "image-edited.png", {type:"image/png"}));
      const response = await api.post("/upload",form);
      if (!response.data.url) throw new Error("Upload did not return an image URL.");
      onChange(response.data.url);setUploaded(true);setFile(null);setSource(null);onPending(false);
    } catch(e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <div className="sport-image-field">
    <label>{label} URL
      <input type="url" placeholder="https://…" value={value || ""} disabled={!!file || busy} onChange={e=>{onChange(e.target.value);setUploaded(false);}}/>
    </label>
    <label>Choose image to crop or fit
      <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>{
        const next=e.target.files?.[0];e.target.value="";if(!next)return;
        setError("");setUploaded(false);
        if(!["image/png","image/jpeg","image/webp"].includes(next.type)||next.size>10*1024*1024) {
          setError("Choose a PNG, JPEG or WebP image smaller than 10 MB.");return;
        }
        setSource(null);setZoom(1);setX(50);setY(50);setFile(next);onPending(true);
      }}/>
    </label>
    {file && <div className="sport-crop-controls">
      <p>Crop to fill the frame, or fit the whole image with white padding.</p>
      <label>Framing<select disabled={busy} value={mode} onChange={e=>setMode(e.target.value as "crop" | "fit")}><option value="crop">Crop to fill</option><option value="fit">Fit whole image</option></select></label>
      {!source && <p role="status">Opening image…</p>}
      <canvas ref={canvas} width={1200} height={outputHeight} style={{aspectRatio: String(aspect), borderRadius: circular ? "50%" : undefined}} role="img" aria-label="Image framing preview"/>
      <fieldset disabled={busy || !source || mode === "fit"}>
        <label>Zoom ({zoom.toFixed(1)}×)<input type="range" min="1" max="3" step=".05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
        <label>Horizontal position<input type="range" min="0" max="100" value={x} onChange={e=>setX(Number(e.target.value))}/></label>
        <label>Vertical position<input type="range" min="0" max="100" value={y} onChange={e=>setY(Number(e.target.value))}/></label>
      </fieldset>
      <div className="sport-crop-actions">
        <button type="button" className="btn outline" disabled={busy} onClick={cancel}>Cancel</button>
        <button type="button" className="btn" disabled={busy || !source} onClick={upload}>{busy ? "Uploading…" : "Apply & upload"}</button>
      </div>
    </div>}
    {error && <p role="alert" className="error">{error}</p>}
    {uploaded && <p role="status">Image uploaded. Save any remaining form changes to finish.</p>}
    {!file && value && <img className="sport-image-preview" src={value} style={{aspectRatio: String(aspect), borderRadius: circular ? "50%" : undefined}} alt="Current image"/>}
  </div>;
}
