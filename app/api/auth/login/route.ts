import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { verifyPassword, createSession } from "@/lib/auth";
import { json, error, handler } from "@/lib/api";

export const POST = handler(async (req: Request) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    return error("Email and password are required.");
  }

  await connectDB();

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    return error("Invalid email or password.", 401);
  }

  const ok = await verifyPassword(String(password), user.passwordHash);
  if (!ok) {
    return error("Invalid email or password.", 401);
  }

  await createSession({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  });

  return json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
});
