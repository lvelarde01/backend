require('dotenv').config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');

const client = new MongoClient(process.env.URI_MONGODB);
const NAMEDB = 'mrdelivery';
const COLLECTION = 'store';

function _JsonParse(str) {
  try {
      return JSON.parse(str);
  } catch (e) {
      return false;
  }
}
async function save(fieldsObj = {}) {
  console.log('save function Active');
  await client.connect();
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .insertOne(fieldsObj);
  console.log(result);
  return result;
}
async function saveAll(fieldsObj = []) {
    console.log('saveAll function Active');
    await client.connect();
    const result = await client
      .db(NAMEDB)
      .collection(COLLECTION)
      .insertMany(fieldsObj);
    console.log(result);
    return result;
  }
async function update(queryObj = {}, fieldsObj = {}) {
  if (!ObjectId.isValid(queryObj._id)) {
    return { error: 'Id Invalidate' };
  }
  await client.connect();
  queryObj._id = ObjectId(queryObj._id);
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .updateOne(queryObj, { $set: fieldsObj }, { upsert: true });
  return result;
}
async function find(queryObj = {}, fieldsObj = {}) {
  if(Object.entries(queryObj).length < 1) return null;
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .findOne(queryObj,{ projection: fieldsObj });
  return result;
}
async function findAll(queryObj = {}, fieldsObj = {},order = {}) {
  
  let result = null
    if(Object.entries(queryObj).length < 1) return null;

    if(Object.entries(order).length > 0) {
      console.log({order})
       result = await client
      .db(NAMEDB)
      .collection(COLLECTION)
      .find(queryObj,{ projection: fieldsObj }).sort(order).toArray();
    }else{
      result = await client
      .db(NAMEDB)
      .collection(COLLECTION)
      .find(queryObj,{ projection: fieldsObj }).toArray();
    }
    return result;
  }
  async function deleteAll(fieldsObj = {}) {
    console.log('save function Active');
    await client.connect();
    const result = await client
      .db(NAMEDB)
      .collection(COLLECTION)
      .deleteMany(fieldsObj);
    console.log(result);
    return result;
  }
exports.save = save;
exports.saveAll = saveAll;
exports.find = find;
exports.findAll = findAll;
exports.update = update;
exports.deleteAll = deleteAll;
