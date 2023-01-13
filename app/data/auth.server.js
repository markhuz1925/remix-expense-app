import { prisma } from "./database.server";
import { hash, compare } from "bcryptjs";
import { createCookieSessionStorage, redirect } from "@remix-run/node";

const SESSION_SECRET = process.env.SESSION_SECRET;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
  },
});

async function createUserSession(userId, redirectPath) {
  const session = await sessionStorage.getSession(userId);
  session.set("userId", userId);
  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": sessionStorage.commitSession(session),
    },
  });
}

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

  const user = await prisma.users.create({
    data: { email: email, password: passwordHash },
  });

  return createUserSession(user.id, "/expenses");
}

export async function login({ email, password }) {
  const existingUser = await prisma.users.findFirst({
    where: { email },
  });

  if (!existingUser) {
    const error = new Error(
      "Couldn't log you in, please check your credentials"
    );
    error.status = 401;
    throw error;
  }

  const passwordCorrect = await compare(password, existingUser.password);

  if (existingUser.password !== passwordCorrect) {
    const error = new Error(
      "Couldn't log you in, please check your credentials"
    );
    error.status = 401;
    throw error;
  }

  return createUserSession(existingUser.id, "/");
}
