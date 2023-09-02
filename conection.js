require('dotenv').config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');

const client = new MongoClient(process.env.URI_MONGODB);
const NAMEDB = 'mrdelivery';
const COLLECTION = 'users';

function _JsonParse(str) {
  try {
      return JSON.parse(str);
  } catch (e) {
      return false;
  }
}
function genUsernameByEmail(email){
  const ArrayUsername = email.split('@');
  let username = ArrayUsername[0] + Math.floor(Math.random() * 2022);
  return username;
}
function genUserPassword(email){
  return email + Math.floor(Math.random() * 2023);
}

async function checkTokenPassword(dataUserObj){
  let token = dataUserObj?.token || undefined;
  if(!token) return {error:"token Invalido"};
  let DecodeToken = Buffer.from(dataUserObj.token, 'base64');
  const tokenToObj = _JsonParse(DecodeToken.toString());
  if(!tokenToObj) return {error:"Json Invalido"};
  const query = await find(tokenToObj,{_id:true,username:true});
  return query || {error: "token Invalido o Expirado"};
}
async function verifyOauthGoogle(responseOauth) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
      idToken: responseOauth.credential,
      audience: responseOauth.client_id,  // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  return payload;
}



async function loginAuthGoogle(responseOauth={}){
  const errors = {};
  const userOauth = await verifyOauthGoogle(responseOauth);
  const dataUserObj = await find({email:userOauth?.email},{_id:true,username:true,role:true,firstname:true,lastname:true,theme:true,photo:true,saveConfigBrowser:true});
  const salt = bcrypt.genSaltSync(10);
  const password= genUserPassword(userOauth.email);
  const token = bcrypt.hashSync(password, salt);

  if(!dataUserObj){
    return {
      errors: {
        username: 'Usuario Incorrecto',
      },
    };
  }
  
  /*if(!dataUserObj){
    saveUserObj = {
      email: userOauth.email,
      username:genUsernameByEmail(userOauth.email),
      sub:userOauth.sub,
      firstname:userOauth.given_name,
      lastname:userOauth.family_name,
      password,
      company:'',
      company_ssid:'',
      theme:'blue',
      photo:userOauth.picture,
      saveConfigBrowser:true,
      keypassword:'',
      token,
      role:responseOauth?.typeLoggin,
      type_access:"google",
      finish_register:false,
     }
     const newUserObj = await newUser(saveUserObj);
     if(newUserObj.acknowledged) {
      return {...saveUserObj,id:newUserObj._id};
      }
    }
    */
   
      const result = await client
      .db(NAMEDB)
      .collection(COLLECTION)
      .updateOne({ _id: dataUserObj._id}, { $set: { token,type_login:'google'} });
      return {...dataUserObj,token,id:dataUserObj._id,type_login:'google'};
}


async function recoveryPass(fieldsObj={}){
  const errors = {};
  const checkEmail = await find({email:fieldsObj?.email},{_id:true,username:true,token:true,firtsname:true,lastname:true});
  if(!checkEmail){ errors.email = "correo electronico no registrado";}
  if(Object.keys(errors).length > 0){ return {errors};}
  const keypassword = bcrypt.hashSync(fieldsObj?.email + Math.floor(Math.random() * 2022), checkEmail.token);
  const result = await update({_id:checkEmail._id},{keypassword});
  if(!result.acknowledged){
    return {errors:"No se logro realizar el registro"};
  }
  return {email:fieldsObj?.email,keypassword}; 
}
async function updatePassword({_id,oldpassword,password,createPassword=false}){
  const errors = {};
  _id = ObjectId(_id);
  const userInfo = await find({_id},{_id:true,username:true,salt:true,password:true});
  console.log({_id,oldpassword,password});

  if(!userInfo){ errors.oldpassword = "Usuario o contraseña Incorrecta ";}
    if(!createPassword){
      const userCurrentPassword = bcrypt.hashSync(oldpassword, userInfo.salt);
      if( userCurrentPassword !==userInfo.password){ errors.oldpassword = "contrasena Incorrecta";}
    }
  if(Object.keys(errors).length > 0){ return {errors};}
  const newpassword = bcrypt.hashSync(password, userInfo.salt);
  const result =  await update({_id},{password:newpassword});
  return result;
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

  if (hash === queryObj.password ) {
    const salt = bcrypt.genSaltSync(10);
    const token = bcrypt.hashSync(password, salt);

    const result = await client
      .db(NAMEDB)
      .collection(COLLECTION)
      .updateOne({ _id: queryObj._id }, { $set: { token,type_login:'normal' } });
    if (result.acknowledged) {
      return { username, id: queryObj._id,role: queryObj.role, token,type_login:'normal',theme:queryObj.theme,photo:queryObj.photo,saveConfigBrowser:queryObj.saveConfigBrowser};
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
exports.updatePassword = updatePassword;
exports.recoveryPass = recoveryPass;
exports.loginAuthGoogle = loginAuthGoogle;
exports.checkTokenPassword = checkTokenPassword;