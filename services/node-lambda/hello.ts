import { APIGatewayProxyEvent } from "aws-lambda";

async function handler(event: APIGatewayProxyEvent, _context: any) {
  if (isAuthorized(event)) {
    return {
      status: 200,
      body: JSON.stringify("You are authorized"),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify("You are not authorized"),
  };
}

function isAuthorized(event: APIGatewayProxyEvent) {
  const groups = event.requestContext.authorizer?.claims["cognito:groups"];
  if (groups) {
    return (groups as string).includes("admins");
  }
  return false;
}

export { handler };
