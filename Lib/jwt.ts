import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type JWT_payload = {
  sub: string;
  email: string;
};

export const signToken = async (payload: JWT_payload): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
};

export const verifyToken = async (
  token: string,
): Promise<JWT_payload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JWT_payload;
  } catch {
    return null;
  }
};
