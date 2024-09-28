// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState } from "react";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const chunkSize = Math.min(5 * 1024 * 1024, selectedFile.size); // 5 MB
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    // const chunkProgress = 100 / totalChunks;
    let chunkNumber = 0;
    let start = 0;
    let end = 0;

    const uploadNextChunk = async () => {
      console.log(end, selectedFile.size);
      if (end <= selectedFile.size) {
        const chunk = selectedFile.slice(start, end);
        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("chunkNumber", chunkNumber);
        formData.append("totalChunks", totalChunks);
        formData.append("originalname", selectedFile.name);

        fetch("http://localhost:9090/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            chunkNumber++;
            start = end;
            end =
              Math.min(end + chunkSize, selectedFile.size) +
              (end >= selectedFile.size ? 1 : 0);
            if (end <= selectedFile.size) {
              uploadNextChunk();
            }
          })
          .catch((err) => {
            console.log("Error uploading chunk: ", err);
          });
      }
    };

    uploadNextChunk();
  };
  return (
    <div>
      <h1>Upload File</h1>
      <input type="file" onChange={handleFileChange} /> <br /> <br />
      <button onClick={handleFileUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;
