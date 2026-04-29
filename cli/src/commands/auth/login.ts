import { Command } from "commander";
import http from "http";
import ora from "ora";
import fetch from "node-fetch";
import open from "open";
import { saveCredentials } from "../../utils/credentials.js";
import { generatePkce } from "../../utils/pkce.js";
import { getAvailablePort } from "../../utils/ports.js";
import { login } from "../../services/auth.service.js";

const BASE_URL = process.env.INSIGHTA_API_URL ?? "";
const PORT = 9876;

export function registerLogin(program: Command) {
  program.command("login").action(async () => {
    const spinner = ora("Logging in...").start();

    try {
      const state = crypto.randomUUID();
      const { verifier, challenge } = generatePkce();

      const authUrl = `${BASE_URL}/auth/github?code_challenge=${challenge}&state=${state}&cli_callback=http://localhost:${PORT}/callback`;
      // const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user&state=${state}`;
      console.log(`Opening browser for GitHub authentication...`);
      await open(authUrl);

      const server = http.createServer(async (req, res) => {
        function finish(message: string, success = true) {
          if (success) spinner.succeed(message);
          else spinner.fail(message);

          res.end(message);

          server.close(() => process.exit(success ? 0 : 1));
        }

        if (req.url!.startsWith("/callback")) {
          const url = new URL(req.url!, `http://localhost:${PORT}`);
          const code = url.searchParams.get("code");
          const returnedState = url.searchParams.get("state");

          if (state !== returnedState) {
            res.end("State mismatch. Authentication failed.");
            console.error("Invalid state parameter.");
            server.close();
            return;
          }

          // console.log("Received code from GitHub, exchanging for token...");

          try {
            if (!code) {
              res.end("Missing authorization code");
              return;
            }

            const params = new URLSearchParams({
              code,
              code_verifier: verifier,
              state: returnedState,
            });

            const fetchUrl = `${BASE_URL}/auth/github/callback?${params.toString()}`;

            const tokenResponse = await fetch(fetchUrl, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            const tokenData = await tokenResponse.text();
            // console.log(`[DEBUG] Raw response body:`, tokenData);

            let data: any;
            try {
              data = JSON.parse(tokenData);
            } catch (parseErr) {
              console.error(
                `[ERROR] Failed to parse response as JSON:`,
                parseErr,
              );
              throw new Error(`Invalid JSON response: ${tokenData}`);
            }

            // console.log(`[DEBUG] Parsed data object:`, data);

            const accessToken = data.access_token;
            const refreshToken = data.refresh_token;
            const username = data.username;

            if (accessToken && refreshToken && username) {
              await saveCredentials({
                accessToken: accessToken,
                refreshToken: refreshToken,
                username: username,
              });
              finish(`Logged in as @${username}`);
            } else {
              finish("Authentication failed.", false);
            }
          } catch (error) {
            console.error("Error during token exchange:", error);
            return res.end("Authentication failed.");
          }

          server.close();
        }
      });

      server.listen(PORT, () => {
        console.log(
          `Waiting for callback on http://localhost:${PORT}/callback`,
        );
      });
    } catch (err: any) {
      spinner.fail(err.message);
    }
  });
}
