import * as net from "net";

const echo = (path: string) => {
  let str = path.replace("/echo", "");
  if (str.startsWith("/")) {
    str = str.replace("/", "");
  }
  return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`;
};

const root = () => {
  return "HTTP/1.1 200 OK\r\n\r\n";
};

const notFound = () => {
  return "HTTP/1.1 404 Not Found\r\n\r\n";
};

const userAgent = (headers: { [key: string]: string }) => {
  const useragent = headers["User-Agent"];
  return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${useragent.length}\r\n\r\n${useragent}`;
};

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const parts = request.split("\r\n");
    const [_method, path, _version] = parts[0].split(" ");
    const headers: { [key: string]: string } = {};
    for (let i = 1; i < parts.length - 2; i++) {
      const [key, value] = parts[i].split(": ");
      headers[key] = value;
    }

    if (path === "/") {
      var response = root();
    } else if (path.startsWith("/echo")) {
      var response = echo(path);
    } else if (path === "/user-agent") {
      var response = userAgent(headers);
    } else {
      var response = notFound();
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
