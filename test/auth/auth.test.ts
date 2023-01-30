import { AuthService } from "./authService";
import { config } from "./config";
import * as AWS from "aws-sdk";

async function callStuff() {
  const authService = new AuthService();

  const user = await authService.login(
    config.TEST_USER_NAME,
    config.TEST_USER_PASSWORD
  );

  await authService.getAWSTemporaryCreds(user);
  const someCreds = AWS.config.credentials;

  const test = 5;
  console.log(test, someCreds);
}

callStuff();
