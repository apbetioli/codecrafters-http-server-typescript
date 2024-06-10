import * as net from "net";
import fs from "fs";

type Options = {
  method: string;
  path: string;
  headers: { [key: string]: string };
  body: string;
};

const echo = ({ path, headers }: Options) => {
  const str = path.replace("/echo/", "");

  let responseHeaders = `Content-Type: text/plain\r\nContent-Length: ${str.length}\r\n`;
  if (
    headers &&
    headers["accept-encoding"] &&
    headers["accept-encoding"]
      .split(",")
      .find((encoding) => encoding.trim() === "gzip")
  ) {
    responseHeaders += `Content-Encoding: gzip\r\n`;
  }

  return `HTTP/1.1 200 OK\r\n${responseHeaders}\r\n${str}`;
};

const root = (options: Options) => {
  return "HTTP/1.1 200 OK\r\n\r\n";
};

const notFound = (options: Options) => {
  return "HTTP/1.1 404 Not Found\r\n\r\n";
};

const userAgent = ({ headers }: Options) => {
  const ua = headers["user-agent"];
  return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${ua.length}\r\n\r\n${ua}`;
};

const files = (options: Options) => {
  let directory = "/tmp/";
  const directoryIndex = process.argv.findIndex((arg) => arg === "--directory");
  if (directoryIndex >= 0) {
    directory = process.argv[directoryIndex + 1];
    if (!directory.endsWith("/")) directory += "/";
  }

  let filename = options.path.replace("/files/", "");
  const filepath = `${directory}${filename}`;

  if (options.method === "GET") {
    if (!fs.existsSync(filepath)) return notFound(options);

    const content = fs.readFileSync(filepath).toString("utf8");

    return `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
  } else if (options.method === "POST") {
    fs.writeFileSync(filepath, options.body);

    return `HTTP/1.1 201 Created\r\n\r\n`;
  } else {
    return `HTTP/1.1 405 Method Not Allowed\r\n\r\n`;
  }
};

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const parts = request.split("\r\n");
    const [method, path, _version] = parts[0].split(" ");
    const headers: { [key: string]: string } = {};
    for (let i = 1; i < parts.length - 2; i++) {
      const [key, value] = parts[i].split(": ");
      headers[key.toLowerCase()] = value;
    }
    const options = {
      method,
      path,
      headers,
      body: parts[parts.length - 1],
    };

    if (path === "/") {
      var response = root(options);
    } else if (path.startsWith("/echo/")) {
      var response = echo(options);
    } else if (path.startsWith("/files/")) {
      var response = files(options);
    } else if (path === "/user-agent") {
      var response = userAgent(options);
    } else {
      var response = notFound(options);
    }

    socket.write(response);
    socket.end();
  });
});

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
