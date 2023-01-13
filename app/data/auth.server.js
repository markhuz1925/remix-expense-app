import { prisma } from "./database.server";
import { hash } from "bcryptjs";

export async function signUp({ email, password }) {
  const existingUser = await prisma.users.findFirst({
    where: { email },
  });

  if (existingUser) {
    const error = new Error(`User ${existingUser.email} already exists`);
    error.status = 422;
    throw error;
  }

  const passwordHash = await hash(password, 12);

  await prisma.users.create({
    data: { email: email, password: passwordHash },
  });
}
