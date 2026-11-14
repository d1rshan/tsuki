import type { FFmpeg } from "@ffmpeg/ffmpeg";

import type { PixelCrop } from "./image-utils";

/** Each job owns a worker and virtual filesystem; originals never leave the browser. */
export async function processMedia(file: File, crop: PixelCrop, start: number, duration: number) {
  const moduleURL = "/media-engine/worker/index.js";
  const { FFmpeg: Engine } = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ moduleURL
  )) as { FFmpeg: typeof FFmpeg };
  const engine = new Engine();
  try {
    await engine.load({
      classWorkerURL: "/media-engine/worker/worker.js",
      coreURL: "/media-engine/core/ffmpeg-core.js",
      wasmURL: "/media-engine/core/ffmpeg-core.wasm",
    });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const animated =
      file.type === "video/mp4" ||
      file.type === "image/gif" ||
      (file.type === "image/webp" && new TextDecoder("latin1").decode(bytes).includes("ANIM"));
    let input = "input";
    await engine.writeFile(input, bytes.slice());
    // FFmpeg's WebP decoder only supports stills. Decode animated WebP frames
    // with the browser, retaining their individual durations for the encoder.
    if (animated && file.type === "image/webp") {
      type Decoder = {
        tracks: { ready: Promise<void>; selectedTrack: { frameCount: number } };
        decode(options: { frameIndex: number }): Promise<{ image: VideoFrame }>;
        close(): void;
      };
      const DecoderClass = (
        globalThis as unknown as {
          ImageDecoder?: new (options: { data: Uint8Array; type: string }) => Decoder;
        }
      ).ImageDecoder;
      if (!DecoderClass)
        throw new Error(
          "Animated WebP needs a browser with ImageDecoder support. Please use GIF or MP4 instead.",
        );
      const decoder = new DecoderClass({ data: bytes, type: file.type });
      try {
        await decoder.tracks.ready;
        const lines: string[] = [];
        let elapsed = 0;
        for (
          let index = 0;
          index < decoder.tracks.selectedTrack.frameCount && elapsed < 6;
          index++
        ) {
          const { image } = await decoder.decode({ frameIndex: index });
          try {
            const canvas = new OffscreenCanvas(image.displayWidth, image.displayHeight);
            canvas.getContext("2d")!.drawImage(image, 0, 0);
            const frame = await canvas.convertToBlob({ type: "image/png" });
            const name = `frame${index}.png`;
            await engine.writeFile(name, new Uint8Array(await frame.arrayBuffer()));
            const seconds = Math.max(0.01, (image.duration ?? 100000) / 1000000);
            lines.push(`file '${name}'`, `duration ${seconds}`);
            elapsed += seconds;
          } finally {
            image.close();
          }
        }
        input = "frames.txt";
        await engine.writeFile(input, lines.join("\n"));
      } finally {
        decoder.close();
      }
    }
    const width = Math.max(2, Math.floor(crop.width / 2) * 2);
    const height = Math.max(2, Math.floor(crop.height / 2) * 2);
    const filter = `crop=${width}:${height}:${Math.floor(crop.x)}:${Math.floor(crop.y)},scale='min(960,iw)':-2,setsar=1`;
    const args = [
      "-ss",
      String(start),
      ...(input === "frames.txt" ? ["-f", "concat", "-safe", "0"] : []),
      "-i",
      input,
      "-vf",
      filter,
      "-an",
    ];
    if ((await engine.exec([...args, "-frames:v", "1", "poster.webp"])) !== 0)
      throw new Error("Cannot decode this media.");
    const poster = new Blob([(await engine.readFile("poster.webp")) as Uint8Array<ArrayBuffer>], {
      type: "image/webp",
    });
    if (!animated) return { blob: poster, poster: null };
    if (
      (await engine.exec([
        ...args,
        "-t",
        String(Math.min(6, Math.max(0.1, duration))),
        "-r",
        "24",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "26",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "output.mp4",
      ])) !== 0
    )
      throw new Error("Cannot process this animation.");
    return {
      blob: new Blob([(await engine.readFile("output.mp4")) as Uint8Array<ArrayBuffer>], {
        type: "video/mp4",
      }),
      poster,
    };
  } finally {
    engine.terminate();
  }
}
