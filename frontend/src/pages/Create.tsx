import React, { useEffect, useRef, useState, type FormEvent } from "react";

interface ReqBody {
  topic: string;
  subject?: string;
  chaos_score?: number;
  style: "sigma" | "delulu" | "conspiracy" | "npc";
  file?: File;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

const BRAINROT_CLIPS = [
  {
    id: "slime",
    title: "Slime Scoop",
    description: "Oddly satisfying, bright, and impossible to ignore.",
    src: "/clips/slime.mp4",
    sourceUrl: "https://mixkit.co/free-stock-video/slippery-slime-in-the-hands-of-a-woman-who-plays-47343/",
  },
  {
    id: "plasticine",
    title: "Plasticine Loop",
    description: "Soft, colorful motion for a calmer background.",
    src: "/clips/plasticine.mp4",
    sourceUrl: "https://mixkit.co/free-stock-video/showing-yellow-plasticine-in-the-shape-of-ice-cream-48181/",
  },
  {
    id: "dominoes",
    title: "Domino Chain",
    description: "A quick cause-and-effect visual with real momentum.",
    src: "/clips/dominoes.mp4",
    sourceUrl: "https://mixkit.co/free-stock-video/domino-effect-on-dark-background-5253/",
  },
  {
    id: "neon-bokeh",
    title: "Neon Bokeh",
    description: "High-energy color without distracting from the voiceover.",
    src: "/clips/neon-bokeh.mp4",
    sourceUrl: "https://mixkit.co/free-stock-video/vertical-video-of-colorful-bokeh-lights-on-black-background-99842/",
  },
  {
    id: "brain-spiral",
    title: "Brain Spiral",
    description: "The full chaotic-study-mode option.",
    src: "/clips/brain-spiral.mp4",
    sourceUrl: "https://mixkit.co/free-stock-video/dynamic-animation-of-the-head-of-a-screaming-man-32645/",
  },
  {
    id:"TungTung",
    title:"Tung Tung Sahur",
    description:"...",
    src:"/clips/TungTung.mp4",
  }
] as const;

type ClipId = (typeof BRAINROT_CLIPS)[number]["id"] | "custom";

type SelectedClip = {
  id: ClipId;
  title: string;
  description: string;
  src: string;
  sourceUrl?: string;
};

const Create: React.FC = () => {
  const [res, setRes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [selectedClipId, setSelectedClipId] = useState<ClipId>("slime");
  const [customClipFile, setCustomClipFile] = useState<File | null>(null);
  const [customClipUrl, setCustomClipUrl] = useState<string | null>(null);
  const [isNarratedPreviewPlaying, setIsNarratedPreviewPlaying] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const [reqBody, setReqBody] = useState<ReqBody>({
    topic: "",
    subject: "",
    chaos_score: undefined,
    style: "conspiracy",
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "chaos_score") {
      const num = value === "" ? undefined : Number(value);
      setReqBody({
        ...reqBody,
        chaos_score: Number.isNaN(num) ? undefined : num,
      });

      return;
    }

    setReqBody({
      ...reqBody,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setAudioSrc("");

    if (!reqBody.topic.trim()) {
      setError("Please add a topic to generate.");
      return;
    }

    setIsLoading(true);
    setRes("");

    try {
      const file = selectedFile;

      const formData = new FormData();
      formData.append("topic", reqBody.topic);
      formData.append("subject", reqBody.subject ?? "");
      formData.append("style", reqBody.style);
      if (reqBody.chaos_score !== undefined) {
        formData.append("chaos_score", String(reqBody.chaos_score));
      }
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.detail ?? `Request failed (${response.status}).`);
      }

      const data = await response.json();
      setRes(data.response ?? "");
      setAudioSrc(data.audio_url ? new URL(data.audio_url, API_BASE_URL).toString() : "");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong while generating your study script.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReqBody({
      topic: "",
      subject: "",
      chaos_score: undefined,
      style: "conspiracy",
    });
    setRes("");
    setError(null);
    setSelectedFile(null);
    setAudioSrc("");
    setIsNarratedPreviewPlaying(false);
    setSelectedClipId("slime");
    setCustomClipFile(null);
    setCustomClipUrl(null);
  };

  useEffect(() => {
    return () => {
      if (customClipUrl) URL.revokeObjectURL(customClipUrl);
    };
  }, [customClipUrl]);

  const selectedClip: SelectedClip = selectedClipId === "custom" && customClipFile && customClipUrl
    ? {
        id: "custom",
        title: customClipFile.name,
        description: "Your uploaded background clip.",
        src: customClipUrl,
      }
    : BRAINROT_CLIPS.find((clip) => clip.id === selectedClipId) ?? BRAINROT_CLIPS[0];

  const selectClip = (clipId: ClipId) => {
    previewVideoRef.current?.pause();
    previewAudioRef.current?.pause();
    setIsNarratedPreviewPlaying(false);
    setSelectedClipId(clipId);
  };

  const handleCustomClipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const clip = event.target.files?.[0] ?? null;
    if (!clip) return;
    if (!clip.type.startsWith("video/")) {
      setError("Please choose an MP4, WebM, or another browser-supported video file.");
      return;
    }

    previewVideoRef.current?.pause();
    previewAudioRef.current?.pause();
    setIsNarratedPreviewPlaying(false);
    setCustomClipFile(clip);
    setCustomClipUrl(URL.createObjectURL(clip));
    setSelectedClipId("custom");
  };

  const toggleNarratedPreview = async () => {
    const video = previewVideoRef.current;
    const audio = previewAudioRef.current;
    if (!video || !audio) return;

    if (isNarratedPreviewPlaying) {
      video.pause();
      audio.pause();
      setIsNarratedPreviewPlaying(false);
      return;
    }

    try {
      video.currentTime = 0;
      audio.currentTime = 0;
      await Promise.all([video.play(), audio.play()]);
      setIsNarratedPreviewPlaying(true);
    } catch (err) {
      console.error(err);
      setError("Your browser could not start the narrated preview. Use the audio controls below instead.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    setSelectedFile(file);
  };

  return (
    <main className="max-w-[90vw] flex flex-col gap-10 pb-16 mx-auto">
      <header className="max-w-2xl">
        <h1 className="font-['Bebas_Neue'] text-4xl uppercase tracking-[0.08em] md:text-5xl">
          Create brainrot study material
        </h1>
      </header>
      <div className="flex flex-col justify-between md:flex-row gap-5">
        <form onSubmit={handleSubmit} className="grid max-w-4xl gap-6">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-6">
              <label className="grid gap-2 text-sm text-black/70">
                <span className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Topic
                </span>
                <input
                  type="text"
                  name="topic"
                  placeholder="Binary search, mitosis, French Revolution..."
                  value={reqBody.topic}
                  onChange={handleChange}
                  className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black shadow-sm focus:border-black/40 focus:outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm text-black/70">
                <span className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Description (optional)
                </span>
                <textarea
                  name="subject"
                  placeholder="Describe what you want explained in 1-2 sentences."
                  value={reqBody.subject}
                  onChange={handleChange}
                  rows={5}
                  className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black shadow-sm focus:border-black/40 focus:outline-none"
                />
              </label>
            </div>

            <label className="flex h-full flex-col justify-between rounded-2xl bg-white/50 text-sm text-black/70">
              <span className="text-xs uppercase tracking-[0.3em] text-black/50">
                Upload PDF/TXT (optional)
              </span>
              <div
                className={`mt-3 flex h-full flex-col gap-6 rounded-2xl border border-dashed px-4 py-4 transition ${
                  isDragging ? "border-black/60 bg-white" : "border-black/20"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  name="study_file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-xs text-black/60 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.25em] file:text-white hover:cursor-pointer"
                />
                <span className="text-sm text-black">
                  {selectedFile
                    ? selectedFile.name
                    : "Drop a file or click to upload."}
                </span>
                <span className="text-xs text-black/50">
                  Supported: .pdf, .txt
                </span>
              </div>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-black/70">
              <span className="text-xs uppercase tracking-[0.3em] text-black/50">
                Style
              </span>
              <select
                name="style"
                value={reqBody.style}
                onChange={handleChange}
                className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black shadow-sm focus:border-black/40 focus:outline-none"
              >
                <option value="sigma">Sigma</option>
                <option value="delulu">Delulu</option>
                <option value="conspiracy">Conspiracy</option>
                <option value="npc">NPC</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-black/70">
              <span className="text-xs uppercase tracking-[0.3em] text-black/50">
                Chaos Score (1-100)
              </span>
              <input
                type="number"
                name="chaos_score"
                placeholder="Auto"
                min={1}
                max={100}
                value={reqBody.chaos_score ?? ""}
                onChange={handleChange}
                className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black shadow-sm focus:border-black/40 focus:outline-none"
              />
            </label>
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-xs uppercase tracking-[0.3em] text-black/50">
              Background clip
            </legend>
            <p className="text-sm text-black/60">
              Choose the visual that will play with your generated voiceover.
            </p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {BRAINROT_CLIPS.map((clip) => {
                const isSelected = clip.id === selectedClipId;
                return (
                  <button
                    key={clip.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectClip(clip.id)}
                    className={`overflow-hidden rounded-2xl border text-left transition focus:outline-none focus:ring-2 focus:ring-black/50 ${
                      isSelected ? "border-black bg-black text-white shadow-md" : "border-black/15 bg-white/60 hover:border-black/50"
                    }`}
                  >
                    <video
                      src={clip.src}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="aspect-[9/12] w-full bg-black object-cover"
                    />
                    <span className="block p-3">
                      <span className="block text-sm font-semibold">{clip.title}</span>
                      <span className={`mt-1 block text-xs leading-4 ${isSelected ? "text-white/70" : "text-black/55"}`}>
                        {clip.description}
                      </span>
                    </span>
                  </button>
                );
              })}
              <label
                className={`flex min-h-44 cursor-pointer flex-col justify-between rounded-2xl border border-dashed p-3 transition ${
                  selectedClipId === "custom" ? "border-black bg-black text-white" : "border-black/25 bg-white/60 hover:border-black/50"
                }`}
              >
                <span className="text-2xl" aria-hidden="true">+</span>
                <span>
                  <span className="block text-sm font-semibold">Your clip</span>
                  <span className={`mt-1 block text-xs leading-4 ${selectedClipId === "custom" ? "text-white/70" : "text-black/55"}`}>
                    {customClipFile ? customClipFile.name : "Upload gameplay or a video you have rights to use."}
                  </span>
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleCustomClipChange}
                  className="sr-only"
                />
              </label>
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60 hover:cursor-pointer"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-black/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black hover:cursor-pointer"
            >
              Reset
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
        <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white/60 p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50">
              Generated Output
            </p>
            <div className="max-h-64 overflow-auto rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-black/80 whitespace-pre-wrap">
              {res || "Your brainrot summary will appear here."}
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-black/50">
                Audio Preview
              </p>
              {audioSrc ? (
                <audio src={audioSrc} controls className="w-full" />
              ) : (
                <p className="text-sm text-black/50">
                  Generate content to load the voiceover.
                </p>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-black">
              <video
                key={selectedClip.id}
                ref={previewVideoRef}
                src={selectedClip.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="aspect-[9/16] max-h-[28rem] w-full object-cover"
                onPause={() => setIsNarratedPreviewPlaying(false)}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 text-black">
                <div>
                  <p className="text-sm font-semibold">{selectedClip.title}</p>
                  <p className="text-xs text-black/55">Selected background clip</p>
                </div>
                {audioSrc ? (
                  <button
                    type="button"
                    onClick={toggleNarratedPreview}
                    className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    {isNarratedPreviewPlaying ? "Pause preview" : "Play with voice"}
                  </button>
                ) : (
                  <p className="text-xs text-black/55">Generate narration to preview the pairing.</p>
                )}
              </div>
              {selectedClip.sourceUrl ? (
                <a
                  href={selectedClip.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-black px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:text-white"
                >
                  Clip source & license
                </a>
              ) : (
                <p className="bg-black px-4 py-3 text-center text-xs text-white/70">
                  Use only clips you own or are licensed to reuse.
                </p>
              )}
            </div>
            {audioSrc && (
              <audio
                ref={previewAudioRef}
                src={audioSrc}
                onEnded={() => {
                  previewVideoRef.current?.pause();
                  setIsNarratedPreviewPlaying(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Create;
