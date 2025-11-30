const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const DDB_TABLE = process.env.DDB_TABLE || 'ESP_Data';

exports.handler = async (event) => {
  try {
    const params = { TableName: DDB_TABLE };
    const items = [];
    let data;
    do {
      data = await ddb.scan(params).promise();
      if (data.Items) items.push(...data.Items);
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (data.LastEvaluatedKey);

    const latest = {};
    for (const it of items) {
      const id = it.device_id;
      if (!latest[id] || (it.timestamp && latest[id].timestamp < it.timestamp)) latest[id] = it;
    }
    const devices = Object.keys(latest).map(k => ({ device_id: k, lastSeen: latest[k].timestamp, lastItem: latest[k] }));
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ devices }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};
