import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../config/api";
import { Spinner } from "../components/ui/Spinner";
import {
  DownloadIcon,
  LockIcon,
  LucideFolder,
  FileIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { formatBytes, getFileIcon } from "../assets/assets";

const SharedWithMe = () => {
  const { token } = useParams();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(`/api/shares/access/${token}`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to access shared link:", err);

        setError(
          err.response?.data?.message ||
            "This shared link is invalid, expired, or unavailable.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSharedData();
    } else {
      setError("Invalid share link.");
      setIsLoading(false);
    }
  }, [token]);

  const isDownloadAllowed = data?.permission === "download";

  const renderFilePreview = (file, url) => {
    const mimeType = file?.mime_type || "";

    if (!url) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
          <FileIcon className="size-12" />
          <p>Preview is currently unavailable.</p>
        </div>
      );
    }

    if (mimeType.startsWith("image/")) {
      return (
        <img
          src={url}
          alt={file.name}
          className="max-w-full max-h-[65vh] object-contain rounded-lg"
        />
      );
    }

    if (mimeType === "application/pdf") {
      return (
        <iframe
          src={url}
          title={file.name}
          className="w-full h-[65vh] rounded-lg"
        />
      );
    }

    if (mimeType.startsWith("video/")) {
      return (
        <video
          src={url}
          controls
          className="max-w-full max-h-[65vh] rounded-lg"
        >
          Your browser does not support video playback.
        </video>
      );
    }

    if (mimeType.startsWith("audio/")) {
      return (
        <div className="w-full max-w-xl p-8 flex flex-col items-center gap-5">
          <FileIcon className="size-16 text-slate-400" />
          <p className="font-medium text-slate-700">{file.name}</p>
          <audio src={url} controls className="w-full">
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    if (mimeType.startsWith("text/") || mimeType === "application/json") {
      return (
        <iframe
          src={url}
          title={file.name}
          className="w-full h-[65vh] rounded-lg bg-white"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <FileIcon className="size-16 text-slate-400" />

        <div>
          <h3 className="font-semibold text-slate-800">
            Preview not available
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            This file type cannot be previewed in your browser.
          </p>
        </div>

        {isDownloadAllowed && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
          >
            <DownloadIcon className="size-4" />
            Download File
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-5 md:px-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <LucideFolder className="size-7 text-orange-500" />
          <span className="text-xl font-bold text-slate-800">Drivea</span>
        </Link>

        <Link
          to="/login"
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-orange-500 transition"
        >
          Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:px-8">
        {/* Loading */}
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Loading shared content...</p>
          </div>
        ) : error ? (
          /* Error */
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <LockIcon className="size-8 text-red-500" />
            </div>

            <h2 className="text-xl font-semibold text-slate-800">
              Unable to access shared content
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-md">{error}</p>

            <Link
              to="/"
              className="mt-6 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            >
              Go Home
            </Link>
          </div>
        ) : !data ? (
          /* Empty State */
          <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
            Shared content not found.
          </div>
        ) : data.resource_type === "file" && data.file ? (
          /* Shared File */
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(data.file.mime_type, "size-9 shrink-0")}

                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-semibold text-slate-800 truncate">
                    {data.file.name}
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Shared by {data.owner?.name || "User"}
                    {" · "}
                    {formatBytes(data.file.size || 0)}
                  </p>
                </div>
              </div>

              {isDownloadAllowed && data.url && (
                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition shrink-0"
                >
                  <DownloadIcon className="size-4" />
                  Download
                </a>
              )}
            </div>

            {/* Preview Container */}
            <div className="min-h-[350px] bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 flex items-center justify-center overflow-hidden">
              {renderFilePreview(data.file, data.url)}
            </div>

            <p className="text-xs text-center text-slate-400">
              This file was shared with you through Drivea.
            </p>
          </div>
        ) : data.resource_type === "folder" && data.folder ? (
          /* Shared Folder */
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <LucideFolder className="size-10 text-orange-500" />

              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-800">
                  {data.folder.name}
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Shared by {data.owner?.name || "User"}
                </p>
              </div>
            </div>

            {/* Folder Contents */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800">
                  Folder Contents
                </h2>
              </div>

              {/* Subfolders */}
              {data.subFolders?.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center gap-3 px-5 py-4 border-b border-slate-100"
                >
                  <LucideFolder className="size-6 text-orange-500 shrink-0" />

                  <span className="text-sm font-medium text-slate-700 truncate">
                    {folder.name}
                  </span>
                </div>
              ))}

              {/* Files */}
              {data.files?.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.mime_type, "size-6 shrink-0")}

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {file.name}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {formatBytes(file.size || 0)}
                      </p>
                    </div>
                  </div>

                  {isDownloadAllowed && file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 border border-orange-200 rounded-lg transition shrink-0"
                    >
                      <DownloadIcon className="size-4" />
                      Download
                    </a>
                  )}
                </div>
              ))}

              {/* Empty Folder */}
              {!data.subFolders?.length && !data.files?.length && (
                <div className="py-16 text-center text-sm text-slate-400">
                  This folder is empty.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Unsupported Resource */
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <FileIcon className="size-14 text-slate-400 mb-4" />

            <h2 className="text-lg font-semibold text-slate-800">
              Shared content unavailable
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              The shared resource could not be found.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedWithMe;
