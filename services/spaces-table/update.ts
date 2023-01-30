import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { getEventBody } from "../shared/utils";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

async function handler(event: any, _context: any) {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Modified successfully",
  };

  const requestBody = getEventBody(event);
  const spaceId = event.queryStringParameters?.[PRIMARY_KEY!];

  if (requestBody && spaceId) {
    try {
      const requestBodyKey = Object.keys(requestBody)[0];
      const requestBodyValue = requestBody[requestBodyKey];

      const updateResult = await dbClient
        .update({
          TableName: TABLE_NAME!,
          Key: {
            [PRIMARY_KEY!]: spaceId,
          },
          UpdateExpression: "set #zzzNew = :new",
          ExpressionAttributeNames: {
            "#zzzNew": requestBodyKey,
          },
          ExpressionAttributeValues: {
            ":new": requestBodyValue,
          },
          ReturnValues: "UPDATED_NEW",
        })
        .promise();
      result.body = JSON.stringify(updateResult);
    } catch (err) {
      result.body = err.message;
    }
  }

  return result;
}

export { handler };
