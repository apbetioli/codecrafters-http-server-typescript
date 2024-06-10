import * as net from "net";

const echo = (path: string) => {
  let str = path.replace("/echo", "");
  if (str.startsWith("/")) {
    str = str.replace("/", "");
  }
  return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`;
};

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const path = data.toString().split(" ")[1];
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith("/echo")) {
      socket.write(echo(path));
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });
});

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, "localhost", () => {
  console.log("Server is running on port 4221");
});
