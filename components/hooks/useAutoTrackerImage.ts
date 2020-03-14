import { useCallback, MutableRefObject, RefObject } from "react";
import Jimp from "jimp";
import { createScheduler, createWorker } from "tesseract.js";
import { EventEmitter } from "events";

declare const ImageCapture: any;

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function useAutoTrackerImage(
  videoRef: RefObject<HTMLVideoElement>,
  videoOverlayRef: RefObject<HTMLCanvasElement>,
  imageCapture: RefObject<typeof ImageCapture>,
  bitmapCanvas: MutableRefObject<HTMLCanvasElement | undefined>,
  previewRef: RefObject<HTMLImageElement | null>,
  previewRef2: RefObject<HTMLImageElement | null>,
  rafRef: MutableRefObject<number | undefined>,
  defBb1: MutableRefObject<BoundingBox>,
  defBb2: MutableRefObject<BoundingBox>
): [EventEmitter, () => Promise<void>] {
  let schedulerCache;
  async function prepareScheduler() {
    if (schedulerCache) return schedulerCache;
    const scheduler = createScheduler();
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    scheduler.addWorker(worker);
    schedulerCache = scheduler;
    return scheduler;
  }
  const emitter = new EventEmitter();
  const fn = useCallback(async () => {
    try {
      if (videoRef.current && videoOverlayRef.current && imageCapture.current) {
        const imageBitmap = await imageCapture.current.grabFrame();
        if (!bitmapCanvas.current) {
          bitmapCanvas.current = document.createElement("canvas");
        }
        bitmapCanvas.current.height = imageBitmap.height;
        bitmapCanvas.current.width = imageBitmap.width;
        const context = bitmapCanvas.current.getContext("2d")!;
        context.clearRect(
          0,
          0,
          bitmapCanvas.current.width,
          bitmapCanvas.current.height
        );
        context.drawImage(
          imageBitmap,
          0,
          0,
          imageBitmap.width,
          imageBitmap.height
        );
        const dataUrl = bitmapCanvas.current.toDataURL();
        const img = await Jimp.read(dataUrl);
        const modifier =
          bitmapCanvas.current.height / videoRef.current.clientHeight;
        const image64 = await img
          .clone()
          .crop(
            defBb1.current.x * modifier,
            defBb1.current.y * modifier,
            defBb1.current.width * modifier,
            defBb1.current.height * modifier
          )
          .invert()
          .getBase64Async(Jimp.MIME_PNG);
        const image642 = await img
          .clone()
          .crop(
            defBb2.current.x * modifier,
            defBb2.current.y * modifier,
            defBb2.current.width * modifier,
            defBb2.current.height * modifier
          )
          .invert()
          .getBase64Async(Jimp.MIME_PNG);
        if (previewRef.current) {
          previewRef.current.src = image64;
        }
        if (previewRef2.current) {
          previewRef2.current.src = image642;
        }
        const scheduler = await prepareScheduler();
        const [text1, text2] = await Promise.all([
          scheduler.addJob("recognize", image64),
          scheduler.addJob("recognize", image642)
        ]);
        emitter.emit("text", {
          defBb1: text1.data.text
            .split("")
            .filter(i => `${i}`.match(/[a-zA-Z\s]/))
            .join("")
            .trim(),
          defBb2: text2.data.text
            .split("")
            .filter(i => `${i}`.match(/[a-zA-Z\s]/))
            .join("")
            .trim()
        });
        rafRef.current = requestAnimationFrame(fn);
      }
    } catch (e) {
      console.error("[error]", e);
    }
  }, [
    videoRef,
    videoOverlayRef,
    imageCapture,
    bitmapCanvas,
    previewRef,
    rafRef,
    defBb1
  ]);
  return [emitter, fn];
}
