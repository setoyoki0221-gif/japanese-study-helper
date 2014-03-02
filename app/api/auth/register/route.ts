import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword, createSession } from "@/lib/auth";
import { json, error, handler } from "@/lib/api";

export const POST = handler(async (req: Request) => {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return error("Name, email and password are required.");
  }
  if (typeof password !== "string" || password.length < 6) {
    return error("Password must be at least 6 characters.");
  }

  await connectDB();

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return error("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
  });

  await createSession({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  });

  return json({ user: { id: user._id.toString(), name: user.name, email: user.email } }, 201);
});
