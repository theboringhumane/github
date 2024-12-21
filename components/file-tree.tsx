import { useEffect, useState } from "react";
import Link from "next/link";
import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import logger from "../lib/logger";

interface FileNode {
  name: string;
  path: string;
  type: string;
  size: number;
  url: string;
}

async function getFiles(url: string, path: string = "", branch: string = "sudo") {
  const res = await fetch(
    `/api/github/files?url=${encodeURIComponent(url)}&path=${encodeURIComponent(
      path
    )}&branch=${branch}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch files");
  }

  return res.json();
}

function FileTreeSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function FileTreeNode({
  file,
  url,
  depth = 0,
  branch = "sudo",
}: {
  file: FileNode;
  url: string;
  depth?: number;
  branch?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const toggleFolder = async () => {
    if (file.type === "dir") {
      setIsOpen(!isOpen);
      if (!children.length && !isOpen) {
        setLoading(true);
        try {
          const { files } = await getFiles(url, file.path, branch);
          setChildren(files);
        } catch (error) {
          logger.error("Error fetching folder contents", { error, path: file.path });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={toggleFolder}
      >
        {file.type === "dir" ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Folder className="h-4 w-4" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4" />
          </>
        )}
        <span className="text-sm">{file.name}</span>
      </div>
      {isOpen && (
        <div>
          {loading ? (
            <div className="pl-8">
              <FileTreeSkeleton />
            </div>
          ) : (
            children.map((child) => (
              <FileTreeNode
                key={child.path}
                file={child}
                url={url}
                depth={depth + 1}
                branch={branch}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function FileTree({ url, branch }: { url: string; branch?: string }) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { files } = await getFiles(url, "", branch);
        setFiles(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [url]);

  if (loading) {
    return <FileTreeSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">Error: {error}</div>
    );
  }

  return (
    <Card className="p-4">
      {files.map((file) => (
        <FileTreeNode key={file.path} file={file} url={url} branch={branch} />
      ))}
    </Card>
  );
} 