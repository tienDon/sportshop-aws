import { Prisma } from "./generated/prisma/client.js";
import { prisma } from "./src/lib/prisma.js";

const dropdb = async () => {
  try {
    console.log("delete data on db: ");
    await prisma.sport.deleteMany({});
  } catch (error) {}
};

dropdb();
