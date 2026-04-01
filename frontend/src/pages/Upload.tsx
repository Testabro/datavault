import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_LABELS,
  createListing,
  formatBytes,
} from "../lib/api";
import type { DataCategory, Listing } from "../lib/api";

const CATEGORIES: DataCategory[] = [
  "healthcare",
  "finance",
  "nlp",
  "computer_vision",
  "tabular",
  "time_series",
  "other",
];

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DataCategory>("tabular");
  const [priceAda, setPriceAda] = useState("");
  const [providerAddress, setProviderAddress] = useState("");

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createListing(formData),
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (
      dropped &&
      (dropped.name.endsWith(".csv") || dropped.name.endsWith(".parquet"))
    ) {
      setFile(dropped);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) setFile(selected);
    },
    [],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price_lovelace", String(Math.round(parseFloat(priceAda) * 1_000_000)));
    formData.append("provider_address", providerAddress);

    mutation.mutate(formData);
  };

  const createdListing = mutation.data as Listing | undefined;

  // Success state
  if (mutation.isSuccess && createdListing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
          <svg
            className="h-10 w-10 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">
          Dataset Listed!
        </h2>
        <p className="mb-6 max-w-md text-gray-400">
          Your dataset "{createdListing.title}" has been encrypted,
          uploaded to IPFS, and listed on the marketplace with a
          zero-knowledge proof.
        </p>
        <div className="flex gap-3">
          <Link
            to={`/listing/${createdListing.id}`}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500"
          >
            View Listing
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
        Upload Dataset
      </h1>
      <p className="mb-8 text-gray-500">
        Upload a CSV or Parquet file. We will extract metadata, generate a
        zero-knowledge proof, encrypt the data, and store it on IPFS.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File drop zone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Dataset File
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all ${
              isDragOver
                ? "border-violet-500 bg-violet-500/10"
                : file
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-gray-700 bg-gray-900 hover:border-gray-600 hover:bg-gray-900/80"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.parquet"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <>
                <svg
                  className="mb-3 h-10 w-10 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-medium text-emerald-300">{file.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatBytes(file.size)}
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  Click or drag to replace
                </p>
              </>
            ) : (
              <>
                <svg
                  className="mb-3 h-10 w-10 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-400">
                  <span className="font-medium text-violet-400">
                    Click to browse
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  CSV or Parquet files only
                </p>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Anonymized Patient Records 2024"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the dataset, its source, and intended use cases..."
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Category + Price row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium text-gray-300"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DataCategory)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-1.5 block text-sm font-medium text-gray-300"
            >
              Price (ADA)
            </label>
            <input
              id="price"
              type="number"
              required
              min="0.000001"
              step="any"
              value={priceAda}
              onChange={(e) => setPriceAda(e.target.value)}
              placeholder="e.g. 50.00"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Provider address */}
        <div>
          <label
            htmlFor="provider"
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            Provider Address
          </label>
          <input
            id="provider"
            type="text"
            required
            value={providerAddress}
            onChange={(e) => setProviderAddress(e.target.value)}
            placeholder="addr1..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <p className="mt-1 text-xs text-gray-600">
            Your Cardano wallet address for receiving payments.
          </p>
        </div>

        {/* Error */}
        {mutation.error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Failed to create listing"}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={
            !file ||
            !title.trim() ||
            !description.trim() ||
            !priceAda ||
            !providerAddress.trim() ||
            mutation.isPending
          }
          className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Uploading & Encrypting...
            </span>
          ) : (
            "Upload & List Dataset"
          )}
        </button>
      </form>
    </div>
  );
}
