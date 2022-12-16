require('dotenv').config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const uri =
  'mongodb+srv://lvelarde:mopa2020@cluster0.agfgxcu.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);
const NAMEDB = 'manager';
const COLLECTION = 'users';
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
  const result = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .findOne(queryObj,{ projection: fieldsObj });
  return result;
}
async function login(username, password) {
  const queryObj = await client
    .db(NAMEDB)
    .collection(COLLECTION)
    .findOne({ username });
  if (queryObj === null) {
    return {
      errors: {
        username: 'Usuario Incorrecto',
      },
    };
  }
  const hash = bcrypt.hashSync(password, queryObj.salt);

  if (hash === queryObj.password) {
    const salt = bcrypt.genSaltSync(10);
    const token = bcrypt.hashSync(password, salt);

    const result = await client
      .db(NAMEDB)
      .collection(COLLECTION)
      .updateOne({ _id: queryObj._id }, { $set: { token } });
    if (result.acknowledged) {
      return { username, id: queryObj._id, token,theme:queryObj.theme,photo:queryObj.photo,saveConfigBrowser:queryObj.saveConfigBrowser};
    }
  }
  return {
    errors: {
      password: 'Contrasena Incorrecta',
    },
  };
}

exports.save = save;
exports.find = find;
exports.update = update;
exports.login = login;
exports.newUser = newUser;
