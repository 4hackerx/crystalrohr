import { useState } from "react";
import { pinata } from "@/services/pinata";

const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const uploadFile = async (): Promise<string | void> => {
    if (!file) {
      return;
    }
    try {
      setUploading(true);
      const keyRequest = await fetch("/api/key", {
        method: "GET",
      });
      const keyData = await keyRequest.json();
      const upload = await pinata.upload.file(file).key(keyData.JWT);
      const urlRequest = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid: upload.cid }),
      });
      const url = await urlRequest.json();
      setUrl(url);
      return url;
    } catch (e) {
      console.log(e);
      alert("Trouble uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  return { file, setFile, url, setUrl, uploading, uploadFile, handleChange };
};

export default useFileUpload;
