import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";
import {
  MissingFieldError,
  validateAsSpaceEntry,
} from "../shared/input-validator";
import { getEventBody } from "../shared/utils";

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DynamoDB",
  };

  try {
    const item = getEventBody(event);
    item.spaceId = v4();
    validateAsSpaceEntry(item);

    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise();

    result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);
  } catch (err) {
    if (err instanceof MissingFieldError) {
      result.statusCode = 403;
    } else {
      result.statusCode = 500;
    }
    result.body = err.message;
  }

  return result;
}

export { handler };
