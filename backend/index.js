const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const port = 9090;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get("/test", (req, res) => {
  console.log({ req });
  res.send("Hello World");
});

const mergeChunks = async (fileName, totalChunks) => {
  const chunkDir = __dirname + "/chunks";
  const mergedFilePath = __dirname + "/merged_files";
  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i <= totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath);
  }

  writeStream.end();
  console.log("Chunk merged successfully");
};

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Hit");
  const chunk = req.file.buffer;
  console.log(chunk);
  const chunkNumber = Number(req.body.chunkNumber);
  const totalChunks = Number(req.body.totalChunks);
  const fileName = req.body.originalname;

  const chunkDir = __dirname + "/chunks";

  if (!fs.existsSync(chunkDir)) {
    console.log("Creating a directory");
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);
    console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

    if (chunkNumber === totalChunks) {
      await mergeChunks(fileName, totalChunks);
      console.log("File mirged successfully");
    }

    res.status(200).json({ message: "Chunk uploaded successfully" });
  } catch (err) {
    console.error("Error saving chunk:", err);
    res.status(500).json({ err: "Error saving chunk" });
  }
});

app.listen(port, () => {
  console.log(`Port listening on ${port}`);
});
