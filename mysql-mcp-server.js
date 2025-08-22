// mysql-mcp-server.js
import { Server } from "@modelcontextprotocol/sdk/server";
import mysql from "mysql2/promise";

const server = new Server({
  name: "MySQL MCP Server",
  version: "1.0.0",
});

// Example: a simple ping tool
server.tool("ping", "Check if MySQL is alive", async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "trae_user",
    password: process.env.MYSQL_PASSWORD || "Jamb2018.",
    database: process.env.MYSQL_DATABASE || "trae_ai_db",
    port: process.env.MYSQL_PORT || 3306,
  });
  const [rows] = await connection.query("SELECT 1 as ok");
  return { ok: rows[0].ok === 1 };
});

// Start the MCP server
server.start();
