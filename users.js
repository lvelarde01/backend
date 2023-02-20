require('dotenv').config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');

const client = new MongoClient(process.env.URI_MONGODB);
const NAMEDB = 'manager';
const COLLECTION = 'users';

function _JsonParse(str) {
  try {
      return JSON.parse(str);
  } catch (e) {
      return false;
  }
}

async function trashAll(queryObj={}){
  if(Object.keys(queryObj).length == 0 ){
    return {error:'no hay items'};
  }
  const allQuerys = Object.keys(queryObj).reduce((key,index,array)=>{
    return [...key,ObjectId(index)]
  },[]);
  console.log(allQuerys);
  const result = await client
  .db(NAMEDB)
  .collection(COLLECTION)
  .deleteMany({_id: { $in: allQuerys}});
  return result;
} 
async function trash(queryObj={}){
  if (!ObjectId.isValid(queryObj._id)) {
    return { error: 'Id Invalidate' };
  }
  queryObj._id = ObjectId(queryObj._id);
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .deleteOne(queryObj);
  return result;
}
async function findAll(queryObj = {},fieldsObj={}) {
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .find(queryObj,{ projection: fieldsObj });
  return result;
}

async function save(fieldsObj = {}) {
  await client.connect();
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .insertOne(fieldsObj);
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
  if (!ObjectId.isValid(queryObj._id) && queryObj?._id) {
    return { error: 'Id Invalidate' };
  }
  if(queryObj?._id){
    queryObj._id = ObjectId(queryObj._id);
  }
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .findOne(queryObj,{ projection: fieldsObj });
    return result;
}
exports.save = save;
exports.find = find;
exports.findAll = findAll;
exports.update = update;
exports.trash = trash;
exports.trashAll =trashAll