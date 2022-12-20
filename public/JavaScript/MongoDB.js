const { MongoClient, ServerApiVersion } = require('mongodb');
const uri =
  'mongodb+srv://pvspreddy_mongo:1234509876@cluster0.hxu712f.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const TestMongoConnection = async () => {
  var clientConnection = await client.connect();
  console.log(clientConnection);
  const collection = client.db('test').collection('devices');
  console.log(collection);
  // perform actions on the collection object
  client.close();
  return collection;
};

module.exports = { TestMongoConnection };
