// import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../services/spaces-table/create";

const event = {
  body: {
    location: "Paris",
  },
};

// const event: APIGatewayProxyEvent = {
//   queryStringParameters: {
//     // spaceId: "f2fbe373-3900-456b-b3fd-09c0f73725cc",
//     location: "Timisoara",
//   },
// } as any;

handler(event as any, {} as any).then((result) => {
  console.log(result.body);
  const items = JSON.parse(result.body);
  console.log(items);
});
