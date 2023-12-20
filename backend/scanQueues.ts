import "dotenv/config";
import { Connection } from "mysql";
import * as mysql from "mysql";
import * as readline from "readline";
import * as uuid from "uuid";
import Redis, { Redis as RedisType } from "ioredis";

interface QueueEntry {
  id: string;
  name: string;
  host: string;
  port: number;
  health_value: number;
  groupId: string;
}

const redisHost = process.argv[2] || "localhost";
const redisPort = parseInt(process.argv[3]) || 6379;
const forceRun = process.argv[4] || "";
const askingConfirmation = forceRun !== "force";

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.DB_PORT || "0");
const dbUser = process.env.DB_USERNAME || "root";
const dbPass = process.env.DB_PASSWORD || "root";
const dbDatabase = process.env.DB_DATABASE || "taurus-manager";

const groupId =
  process.env.DEFAULT_GROUP_ID || "cabfc951-f483-4870-9e72-cc5935335349";

const db: Connection = mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPass,
  database: dbDatabase,
});

function doesPrefixExist(prefix: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const queryCheck = "SELECT COUNT(*) AS count FROM queue WHERE name = ?";
    db.query(queryCheck, [prefix], (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results[0].count > 0);
    });
  });
}

async function saveNewPrefixes(prefixes: string[]): Promise<void> {
  const newPrefixes = await checkPrefixes(prefixes);
  if (newPrefixes.length === 0) return;

  let insertData: QueueEntry[] = newPrefixes.map((prefix) => ({
    id: uuid.v4(),
    name: prefix,
    host: redisHost,
    port: redisPort,
    health_value: 100,
    groupId: groupId,
  }));

  let insertDataArray: string[][] = insertData.map((entry) =>
    Object.values(entry)
  );

  const insertQuery =
    "INSERT INTO queue (id, name, host, port, health_value, group_id) VALUES ?";
  return new Promise((resolve, reject) => {
    db.query(insertQuery, [insertDataArray], (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function checkPrefixes(prefixes: string[]): Promise<string[]> {
  let newPrefixes: string[] = [];
  for (const prefix of prefixes) {
    const exists = await doesPrefixExist(prefix);
    if (!exists) newPrefixes.push(prefix);
  }
  return newPrefixes;
}

async function scanPrefixes(
  client: RedisType,
  pattern: string
): Promise<string[]> {
  let cursor = "0";
  let prefixes = new Set<string>();

  do {
    const reply = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = reply[0];
    reply[1].forEach((key: string) => {
      const match = key.match(/bull:(.*?):/);
      if (match && match[1]) {
        prefixes.add(match[1]);
      }
    });

    console.log(
      `Scanning with cursor: ${cursor}, found keys: ${reply[1].length}`
    );

    if (Number(cursor) == 0) {
      console.log("Completed scanning for queues");
    }
  } while (Number(cursor) != 0);

  return Array.from(prefixes);
}

function confirmExecution(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "\n⚠️  WARNING: Potentially Intensive Operation ⚠️\n\n" +
        "This command initiates a comprehensive scan of the Redis server for queue data.\n" +
        "Be aware that this operation may consume significant resources and could take considerable time, depending on the data size.\n" +
        "In production environments, such scans should be conducted with caution. Proceed only if you have a thorough understanding of the implications and have taken appropriate precautions (e.g., ensuring sufficient resource availability, considering off-peak hours).\n\n" +
        "Are you absolutely sure you wish to execute this scan? (yes/no): ",
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "yes");
      }
    );
  });
}

async function main() {
  if (askingConfirmation) {
    const isConfirmed = await confirmExecution();
    if (!isConfirmed) {
      console.log("Execution cancelled.");
      return;
    }
  }

  const client = new Redis({
    host: redisHost,
    port: redisPort,
    lazyConnect: true,
    connectTimeout: 5000,
    maxRetriesPerRequest: 0,
  });
  client.on("error", (err) => console.error("Redis Client Error:", err));

  try {
    console.log("Connected to Redis");
    const prefixes = await scanPrefixes(client, "bull:*");
    console.log("Queues :", prefixes);
    await saveNewPrefixes(prefixes);
    console.log("New queues saved to database");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.quit();
    console.log("Redis client disconnected");
    db.end();
  }
}

main();
