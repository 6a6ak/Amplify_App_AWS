const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = DynamoDBDocument.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });
const DDB_TABLE = process.env.DDB_TABLE || 'ESP_Data';
const publicFields = ['device_id', 'timestamp', 'temperature', 'humidity', 'speed', 'plate', 'name', 'from', 'status'];
const publicItem = item => Object.fromEntries(publicFields.filter(key => Object.hasOwn(item, key)).map(key => [key, item[key]]));

exports.handler = async (event) => {
  try {
    const params = { TableName: DDB_TABLE };
    const items = [];
    let data;
    do {
      data = await ddb.send(new ScanCommand(params));
      if (data.Items) items.push(...data.Items);
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (data.LastEvaluatedKey);

    const latest = Object.create(null);
    for (const it of items) {
      const id = it.device_id;
      if (!latest[id] || (it.timestamp && latest[id].timestamp < it.timestamp)) latest[id] = it;
    }
    const devices = Object.keys(latest).map(k => ({ device_id: k, lastSeen: latest[k].timestamp, lastItem: publicItem(latest[k]) }));
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ devices }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unable to load telemetry' }) };
  }
};
