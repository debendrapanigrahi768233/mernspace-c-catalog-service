import { Request } from "express";
import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksClient from "jwks-rsa";
import config from "config";
import { AuthCookie } from "../types";

//It will return a middleware that we can directly plug into our route
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default expressjwt({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    secret: jwksClient.expressJwtSecret({
        jwksUri: config.get("auth.jwksUri"),
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ["RS256"],
    getToken(req: Request) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const token = authHeader.split(" ")[1];
            if (token) {
                return token;
            }
        }

        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});
