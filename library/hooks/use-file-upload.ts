import { useState, useCallback } from "react";
import { pinata } from "@/services/pinata";

const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const uploadFile = useCallback(
    async ({
      file2,
    }: {
      file2?: File;
    } = {}): Promise<string | void> => {
      const _file = file2 || file;
      if (!_file) {
        return;
      }

      try {
        setUploading(true);
        const [keyData, upload] = await Promise.all([
          fetch("/api/key").then((res) => res.json()),
          pinata.upload
            .file(_file)
            .key((await fetch("/api/key").then((res) => res.json())).JWT),
        ]);

        const url = await fetch("/api/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cid: upload.cid }),
        }).then((res) => res.json());

        setUrl(url);
        return url;
      } catch (e) {
        console.error("Error uploading file:", e);
        throw new Error("Trouble uploading file");
      } finally {
        setUploading(false);
      }
    },
    [file]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  }, []);

  return { file, setFile, url, setUrl, uploading, uploadFile, handleChange };
};

export default useFileUpload;
