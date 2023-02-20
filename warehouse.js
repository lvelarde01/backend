require('dotenv').config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');

const client = new MongoClient(process.env.URI_MONGODB);
const NAMEDB = 'manager';
const COLLECTION = 'warehouse';

function _JsonParse(str) {
  try {
      return JSON.parse(str);
  } catch (e) {
      return false;
  }
}

async function newUser(fieldsObj={}){
  const errors = {};
  const checkUsername = await find({username:fieldsObj?.username},{_id:true,username:true});
  const checkEmail = await find({email:fieldsObj?.email},{_id:true,username:true}); 
  if(checkUsername){ errors.username = "usuario ya existe";}
  if(checkEmail){errors.checkEmail = "correo ya existe";}
  if(Object.keys(errors).length > 0){ return {errors};}
  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(fieldsObj.password, salt);
  return await save({...fieldsObj,salt,password});
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
  console.log('save function Active');
  await client.connect();
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .insertOne(fieldsObj);
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
  if (!ObjectId.isValid(queryObj._id)) {
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