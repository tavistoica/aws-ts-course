import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dbClient = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

async function handler(event: APIGatewayProxyEvent, _context: any) {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Modified successfully",
  };

  const spaceId = event.queryStringParameters?.[PRIMARY_KEY!];

  try {
    if (spaceId) {
      const deleteResult = await dbClient
        .delete({
          TableName: TABLE_NAME!,
          Key: {
            [PRIMARY_KEY!]: spaceId,
          },
        })
        .promise();

      result.body = JSON.stringify(deleteResult);
    }
  } catch (err) {
    result.body = err.message;
  }

  return result;
}

export { handler };
