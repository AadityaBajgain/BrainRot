import React, { useState, type FormEvent } from "react";

interface ReqBody {
  topic: string;
  subject?: string;
  chaos_score?: number;
  style: "sigma" | "delulu" | "conspiracy" | "npc";
  file?:File
}

const Create: React.FC = () => {
  const [res, setRes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

    if (!reqBody.topic.trim()) {
      setError("Please add a topic to generate.");
      return;
    }

    setIsLoading(true);
    setRes("");

    try {

      const file = selectedFile;

      const formData = new FormData()
      formData.append("topic", reqBody.topic)
      formData.append("subject", reqBody.subject ?? "")
      formData.append('style', reqBody.style)
      if (reqBody.chaos_score !== undefined){
        formData.append("chaos_score",String(reqBody.chaos_score))
      }
      if(file){
        formData.append("file",file)
      }


      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request Failed:${response.status}`);
      }

      if (!response.body) {
        const text = await response.text();
        setRes(text);
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          const chunk = decoder.decode(result.value, { stream: true });

          setRes((prev) => (prev ?? "") + chunk);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
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
    <main className="flex flex-col gap-10 pb-16">
      <header className="max-w-2xl">
        <h1 className="font-['Bebas_Neue'] text-4xl uppercase tracking-[0.08em] md:text-5xl">
          Create brainrot study material
        </h1>
      </header>
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
                className="mt-1 block w-full text-xs text-black/60 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.25em] file:text-white"
              />
              <span className="text-sm text-black">
                {selectedFile ? selectedFile.name : "Drop a file or click to upload."}
              </span>
              <span className="text-xs text-black/50">Supported: .pdf, .txt</span>
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-black/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black"
          >
            Reset
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>

      <section className="max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.3em] text-black/50">
            Output
          </h2>
          {isLoading && (
            <span className="text-xs uppercase tracking-[0.3em] text-black/40">
              Streaming
            </span>
          )}
        </div>
        <div className="mt-3 min-h-[160px] rounded-2xl border border-black/10 bg-white/60 p-4 text-sm text-black/80">
          {res || "Your brainrot summary will appear here."}
        </div>
      </section>
    </main>
  );
};

export default Create;
