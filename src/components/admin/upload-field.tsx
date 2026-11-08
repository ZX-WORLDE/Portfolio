"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upload as blobUpload } from "@vercel/blob/client";
import {
  CheckCircle2,
  CloudUpload,
  Link2,
  Loader2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Admin media field with two interchangeable modes:
 *  - UPLOAD: drag & drop / browse → streams to Vercel Blob (when
 *    BLOB_READ_WRITE_TOKEN is set) or the local upload endpoint,
 *    with a live progress bar.
 *  - URL: paste any external or bundled URL, exactly like before.
 * The value written into the form is always a playable URL, so the
 * Cut/Setting schemas stay unchanged.
 */

const VIDEO_EXTS = [".mp4", ".m4v", ".webm", ".mov"];
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function humanSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

type UploadFieldProps = {
  kind: "video" | "image";
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
};

export function UploadField({
  kind,
  label,
  value,
  onChange,
  placeholder,
}: UploadFieldProps) {
  const [mode, setMode] = useState<"blob" | "local" | null>(null);
  const [ephemeral, setEphemeral] = useState(false);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVideo = kind === "video";
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const okExts = isVideo ? VIDEO_EXTS : IMAGE_EXTS;
  const accept = isVideo ? "video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov" : "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

  /* Which backend is live? Warn when Vercel runs without a Blob token. */
  useEffect(() => {
    fetch("/api/admin/upload")
      .then((r) => r.json())
      .then((d) => {
        setMode(d.mode === "blob" ? "blob" : "local");
        setEphemeral(Boolean(d.vercel) && d.mode !== "blob");
      })
      .catch(() => setMode("local"));
  }, []);

  /* Editing a cut that already has a URL → start on the URL tab. */
  useEffect(() => {
    if (value) setTab("url");
  }, []);

  const startUpload = useCallback(
    async (file: File) => {
      setError(null);
      const dot = file.name.lastIndexOf(".");
      const ext = dot === -1 ? "" : file.name.slice(dot).toLowerCase();
      if (!okExts.includes(ext)) {
        setError(
          isVideo
            ? "Unsupported video — use MP4, WebM or MOV."
            : "Unsupported image — use JPG, PNG or WebP."
        );
        return;
      }
      if (file.size > maxBytes) {
        setError(`File is over the ${Math.round(maxBytes / 1024 / 1024)}MB limit.`);
        return;
      }

      setBusy(true);
      setProgress(0);
      try {
        let url: string;
        if (mode === "blob") {
          const res = await blobUpload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/admin/upload",
            clientPayload: JSON.stringify({ kind }),
          });
          url = res.url;
          setProgress(100);
        } else {
          url = await new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/admin/upload");
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
              }
            };
            xhr.onload = () => {
              try {
                const d = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && d.ok) {
                  resolve(d.url as string);
                } else {
                  reject(new Error(d.error ?? "Upload failed."));
                }
              } catch {
                reject(new Error("Upload failed."));
              }
            };
            xhr.onerror = () => reject(new Error("Network error during upload."));
            const fd = new FormData();
            fd.append("file", file);
            fd.append("kind", kind);
            xhr.send(fd);
          });
        }
        setUploaded({ name: file.name, size: file.size });
        onChange(url);
        setTab("upload");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setBusy(false);
      }
    },
    [kind, mode, okExts, isVideo, maxBytes, onChange]
  );

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void startUpload(f);
    e.target.value = "";
  }

  const hasValue = Boolean(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="flex items-center gap-2 font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-ash">
          {label} *
          {mode && (
            <span className="flex items-center gap-1 text-[8px] text-[#5f5f5f]">
              <CloudUpload className="h-3 w-3" />
              {mode === "blob" ? "VERCEL BLOB" : "LOCAL DISK"}
            </span>
          )}
        </Label>
        <div className="flex border border-line" role="tablist">
          {(["upload", "url"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 font-mono text-[8px] tracking-[0.18em] transition-colors",
                tab === t
                  ? "bg-ember text-ink"
                  : "text-ash hover:text-bone"
              )}
            >
              {t === "upload" ? (
                <Upload className="h-2.5 w-2.5" />
              ) : (
                <Link2 className="h-2.5 w-2.5" />
              )}
              {t === "upload" ? "UPLOAD" : "URL"}
            </button>
          ))}
        </div>
      </div>

      {tab === "url" ? (
        <Input
          required
          maxLength={500}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 border-line bg-[#0e0e0e] font-mono text-xs text-bone placeholder:text-[#4a4a4a] focus-visible:ring-ember"
        />
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void startUpload(f);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 text-center transition-colors disabled:cursor-wait",
            dragOver
              ? "border-ember bg-ember/10"
              : "border-line bg-[#0e0e0e] hover:border-ember/60"
          )}
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-ember" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-ember">
                UPLOADING{progress > 0 && mode === "local" ? ` — ${progress}%` : "…"}
              </span>
              <span className="relative block h-[3px] w-40 overflow-hidden bg-white/10">
                <span
                  className={cn(
                    "block h-full bg-ember transition-[width] duration-200",
                    mode === "blob" && progress < 100 && "animate-pulse w-1/3"
                  )}
                  style={
                    mode === "local" || progress === 100
                      ? { width: `${progress}%` }
                      : undefined
                  }
                />
              </span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-ash" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-bone">
                DROP THE {isVideo ? "VIDEO" : "POSTER"} HERE — OR CLICK TO BROWSE
              </span>
              <span className="font-mono text-[8px] tracking-[0.16em] text-[#5f5f5f]">
                {isVideo ? "MP4 / WEBM / MOV · UP TO 200MB" : "JPG / PNG / WEBP · UP TO 5MB"}
              </span>
            </>
          )}
        </button>
      )}

      {/* Hidden native picker — works with display:none for security dialogs */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={pickFile}
      />

      {ephemeral && (
        <p className="flex items-start gap-2 border border-ember/40 bg-ember/10 px-3 py-2 font-mono text-[9px] leading-relaxed tracking-[0.12em] text-ember">
          <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
          LOCAL-DISK MODE ON VERCEL — UPLOADED FILES DO NOT SURVIVE RESTARTS.
          SET BLOB_READ_WRITE_TOKEN (STORAGE → BLOB) FOR PERSISTENT UPLOADS.
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 border border-ember/40 bg-ember/10 px-3 py-2 font-mono text-[9px] tracking-[0.12em] text-ember">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {uploaded && !busy && (
        <p className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-[#7a8f7a]">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#7a8f7a]" />
          UPLOADED — {uploaded.name} ({humanSize(uploaded.size)})
        </p>
      )}

      {hasValue && (
        <div className="mt-1 flex items-center gap-3 border border-line bg-[#0b0b0b] p-2">
          <div className="h-20 w-14 shrink-0 overflow-hidden border border-line bg-[#0e0e0e]">
            {isVideo ? (
              <video
                key={value}
                src={value}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                key={value}
                src={value}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[9px] tracking-[0.1em] text-ash">
              {value}
            </p>
            <p className="mt-1 font-mono text-[8px] tracking-[0.16em] text-[#5f5f5f]">
              {isVideo ? "VIDEO SOURCE" : "POSTER IMAGE"} — LIVE PREVIEW LEFT
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
