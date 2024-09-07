
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'ChatMessages';  // Replace with your table name

// URL to use to send messages to our client
const ENDPOINT = '7l8nohylm6.execute-api.us-west-2.amazonaws.com/production/';
const client = new AWS.ApiGatewayManagementApi({ endpoint: ENDPOINT });
const names = {};

const sendToOne = async (id, body) => {
  try {
    await client.postToConnection({
      'ConnectionId': id,
      'Data': Buffer.from(JSON.stringify(body)),
    }).promise();
  } catch (e) {
    console.log(e);
  }
};

const sendToAll = async (ids, body) => {
  const all = ids.map(i => sendToOne(i, body));
  return Promise.all(all);
};

exports.handler = async (event) => {
  if (event.requestContext) {
    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;

    let body = {};

    try {
      if (event.body) {
        body = JSON.parse(event.body);
      }
    } catch (e) {
      console.log('Error parsing body:', e);
    }

    const timestamp = new Date().toISOString();  // or use Date.now() for numeric timestamp

    switch (routeKey) {
      case '$connect':
        // Handle new connection
        break;

      case '$disconnect':
        await sendToAll(Object.keys(names), { systemMessage: `${names[connectionId]} has left the chat` });
        delete names[connectionId];
        await sendToAll(Object.keys(names), { members: Object.values(names) });
        break;

      case 'setName':
        names[connectionId] = body.name;
        await sendToAll(Object.keys(names), { members: Object.values(names) });
        await sendToAll(Object.keys(names), { systemMessage: `${names[connectionId]} has joined the chat` });
        break;

      case 'sendPublic':
        const publicMessage = `${names[connectionId]}: ${body.message}`;
        await sendToAll(Object.keys(names), { publicMessage });
        
        // Save the message to DynamoDB
        const publicParams = {
          TableName: tableName,
          Item: {
            Sender: names[connectionId],
            Timestamp: timestamp,
            Message: body.message,
          },
        };

        try {
          await dynamoDb.put(publicParams).promise();
          console.log('Public message saved to DynamoDB');
        } catch (error) {
          console.log('Error saving public message to DynamoDB:', error);
        }
        break;

      case 'sendPrivate':
        const to = Object.keys(names).find(key => names[key] === body.to);
        const privateMessage = `${names[connectionId]}: ${body.message}`;
        await sendToOne(to, { privateMessage });

        // Save the private message to DynamoDB
        const privateParams = {
          TableName: tableName,
          Item: {
            Sender: names[connectionId],
            Recipient: body.to,  // Add this attribute to distinguish private messages
            Timestamp: timestamp,
            Message: body.message,
          },
        };

        try {
          await dynamoDb.put(privateParams).promise();
          console.log('Private message saved to DynamoDB');
        } catch (error) {
          console.log('Error saving private message to DynamoDB:', error);
        }
        break;

      default:
        console.log('Unknown route:', routeKey);
    }

    console.log(body);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };

  return response;
};
