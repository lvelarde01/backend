const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

/*api manager */
const { save, find, update, login, newUser,recoveryPass,loginAuthGoogle,checkTokenPassword} = require('./conection');
const {sendEmails} = require('./serviceEmail');
//Users
const SaveUser =require('./users').save;
const FindUser =require('./users').find;
const FindAllUser =require('./users').findAll;
const TrashUser = require('./users').trash;
const TrashAllUser = require('./users').trashAll;
const UpdateUser = require('./users').update;

//WareHouse
const SaveWareHouse =require('./warehouse').save;
const FindWareHouse =require('./warehouse').find;
const FindAllWareHouse =require('./warehouse').findAll;
const TrashWareHouse = require('./warehouse').trash;
const TrashAllWareHouse = require('./warehouse').trashAll;
const UpdateWareHouse = require('./warehouse').update;
//Container
const SaveContainer =require('./container').save;
const FindContainer =require('./container').find;
const FindAllContainer =require('./container').findAll;
const TrashContainer = require('./container').trash;
const TrashAllContainer = require('./container').trashAll;
const UpdateContainer = require('./container').update;
//Collection
const SaveCollection =require('./collection').save;
const FindCollection =require('./collection').find;
const FindAllCollection =require('./collection').findAll;
const TrashCollection = require('./collection').trash;
const TrashAllCollection = require('./collection').trashAll;
const UpdateCollection = require('./collection').update;
//Workers
const SaveWorkers =require('./workers').save;
const FindWorkers =require('./workers').find;
const FindAllWorkers =require('./workers').findAll;
const TrashWorkers = require('./workers').trash;
const TrashAllWorkers = require('./workers').trashAll;
const UpdateWorkers = require('./workers').update;
//vps
const SaveVps =require('./vps').save;
const FindVps =require('./vps').find;
const FindAllVps =require('./vps').findAll;
const TrashVps = require('./vps').trash;
const TrashAllVps = require('./vps').trashAll;
const UpdateVps = require('./vps').update;



const bcrypt = require('bcryptjs');
const {OAuth2Client} = require('google-auth-library');

const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.text({ limit: '200mb' }));


app.use(express.static('public'));
app.get('/', (req, res) => { 
  res.json({data:'work'});
});
//vps
app.post('/api/vps/checkisunique',(req,res)=>{
  const dataUserObj = req.body;
  FindVps({...dataUserObj},{_id:true}).then((data)=>{
    const result = {isunique:false};
    if(data===null){
      result.isunique = true;
    }
    res.json({...result});
  }).catch((error)=>{
    res.json({error:true});
  });
});
app.post('/api/vps/add', (req, res) => { 
  async function saveAll(){ 
    const {name,...rest} = req.body;  
    let dateUnix = new Date();
    let result = await FindVps({name});
    console.log(result);
    if(result || !name ){
      res.json({name:"Vps Registrado o Invalido"});
      return;
    }
    let saveData = await SaveVps({name,...rest,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  saveAll().catch((error)=>{
    res.json({error});
  })

});

app.post('/api/vps/list', (req, res) => {
  async function getAll(){ 
    let name = req.query.name || {};
    let dateUnix = new Date();
    let result = await FindAllVps({...name},{});
    let dataArray = await result.toArray();
    if(dataArray.length > 0){
      res.json(dataArray);
      return;
    }
    res.json({});
  }
  getAll().catch((error)=>{
    console.log(error);
    res.json({error:'no ha data'});
  }) 

});
app.post('/api/vps/edit', (req, res) => { 
  async function update(){ 
    const {_id,name,...rest} = req.body;  
    let dateUnix = new Date();
    let Query = await FindVps({name},{_id:true,name:true});
    if(Query?.hasOwnProperty('_id') && Query?._id?.toString() !== _id){
      res.json({name:'VPS ya Registrado'});
      return;
    }
    let saveData = await UpdateVps({_id},{name,...rest,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  update().catch((error)=>{
    res.json({error});
  })
});
app.post('/api/vps/getinfo', (req, res) => { 
  async function getinfo(){ 
    const {_id} = req.body;
    let result = await FindVps({_id});
    if(!result || !_id ){
      res.json({name:"vps Registrado o Invalido"});
      return;
    }
    res.json(result);
  }
  getinfo().catch((error)=>{
    res.json({error});
  });
});
app.post('/api/vps/trashall', (req, res) => { 
  
  async function trash(){ 
    const {..._ids} = req.body;
    let result = await TrashAllVps(_ids);
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/vps/trash', (req, res) => { 
  async function trash(){ 
    const {_id} = req.body;
    let result = await TrashVps({_id});
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
//workers
app.post('/api/workers/checkisunique',(req,res)=>{
  const dataUserObj = req.body;
  FindWorkers({...dataUserObj},{_id:true}).then((data)=>{
    const result = {isunique:false};
    if(data===null){
      result.isunique = true;
    }
    res.json({...result});
  }).catch((error)=>{
    res.json({error:true});
  });
});
app.post('/api/workers/add', (req, res) => { 
  async function saveAll(){ 
    const {name} = req.body;  
    let dateUnix = new Date();
    let result = await FindWorkers({name});
    if(result || !name ){
      res.json({name:"Conainer Registrado o Invalido"});
      return;
    }
    let saveData = await SaveWorkers({name,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  saveAll().catch((error)=>{
    res.json({error});
  })

});

app.post('/api/workers/list', (req, res) => {
  async function getAll(){ 
    let name = req.query.name || {};
    let dateUnix = new Date();
    let result = await FindAllWorkers({...name},{});
    let dataArray = await result.toArray();
    if(dataArray.length > 0){
      res.json(dataArray);
      return;
    }
    res.json({});
  }
  getAll().catch((error)=>{
    console.log(error);
    res.json({error:'no ha data'});
  }) 

});
app.post('/api/workers/edit', (req, res) => { 
  async function update(){ 
    const {_id,name} = req.body;  
    let dateUnix = new Date();
    let Query = await FindWorkers({name},{_id:true,name:true});
    if(Query?.hasOwnProperty('_id') && Query?._id?.toString() !== _id){
      res.json({name:'Worker ya Registrado'});
      return;
    }
    let saveData = await UpdateWorkers({_id},{name,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  update().catch((error)=>{
    res.json({error});
  })
});
app.post('/api/workers/getinfo', (req, res) => { 
  async function getinfo(){ 
    const {_id} = req.body;
    let result = await FindWorkers({_id});
    if(!result || !_id ){
      res.json({name:"warehouse Registrado o Invalido"});
      return;
    }
    res.json(result);
  }
  getinfo().catch((error)=>{
    res.json({error});
  });
});
app.post('/api/workers/trashall', (req, res) => { 
  
  async function trash(){ 
    const {..._ids} = req.body;
    let result = await TrashAllWorkers(_ids);
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/workers/trash', (req, res) => { 
  async function trash(){ 
    const {_id} = req.body;
    let result = await TrashWorkers({_id});
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
//collection
app.post('/api/collection/checkisunique',(req,res)=>{
  const dataUserObj = req.body;
  FindCollection({...dataUserObj},{_id:true}).then((data)=>{
    const result = {isunique:false};
    if(data===null){
      result.isunique = true;
    }
    res.json({...result});
  }).catch((error)=>{
    res.json({error:true});
  });
});
app.post('/api/collection/add', (req, res) => { 
  async function saveAll(){ 
    const {name} = req.body;  
    let dateUnix = new Date();
    let result = await FindCollection({name});
    console.log(result);
    if(result || !name ){
      res.json({name:"Conainer Registrado o Invalido"});
      return;
    }
    let saveData = await SaveCollection({name,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  saveAll().catch((error)=>{
    res.json({error});
  })
});

app.post('/api/collection/list', (req, res) => { 
  async function getAll(){ 
    const {fieldsObj,...name} = req.body;  
    let result = await FindAllCollection({...name},{...fieldsObj});
    let dataArray = await result.toArray();
    if(dataArray.length > 0){
      res.json(dataArray);
      return;
    }
    res.json({});
  }
  getAll().catch((error)=>{
    console.log(error);
    res.json({error:'no ha data'});
  })
});
app.post('/api/collection/edit', (req, res) => { 
  async function update(){ 
    const {_id,name,...rest} = req.body;  
    let dateUnix = new Date();
    let Query = await FindCollection({name},{_id:true,name:true});
    if(Query?.hasOwnProperty('_id') && Query?._id?.toString() !== _id){
      res.json({name:'Coleccion ya Registrado'});
      return;
    }
    let saveData = await UpdateCollection({_id},{name,...rest,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  update().catch((error)=>{
    res.json({error});
  })
});
app.post('/api/collection/getinfo', (req, res) => { 
  async function getinfo(){ 
    const {_id} = req.body;
    let result = await FindCollection({_id});
    if(!result || !_id ){
      res.json({name:"warehouse Registrado o Invalido"});
      return;
    }
    res.json(result);
  }
  getinfo().catch((error)=>{
    res.json({error});
  });
});
app.post('/api/collection/trashall', (req, res) => { 
  
  async function trash(){ 
    const {..._ids} = req.body;
    let result = await TrashAllCollection(_ids);
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/collection/trash', (req, res) => { 
  async function trash(){ 
    const {_id} = req.body;
    let result = await TrashCollection({_id});
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});

//container
app.post('/api/container/checkisunique',(req,res)=>{
  const dataUserObj = req.body;
  FindContainer({...dataUserObj},{_id:true}).then((data)=>{
    const result = {isunique:false};
    if(data===null){
      result.isunique = true;
    }
    res.json({...result});
  }).catch((error)=>{
    res.json({error:true});
  });
});
app.post('/api/container/add', (req, res) => { 
  async function saveAll(){ 
    const {name,...rest} = req.body;  
    let dateUnix = new Date();
    let result = await FindContainer({name});
    if(result || !name ){
      res.json({name:"Conainer Registrado o Invalido"});
      return;
    }
    let saveData = await SaveContainer({name,...rest,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  saveAll().catch((error)=>{
    res.json({error});
  })
});

app.post('/api/container/list', (req, res) => { 
  async function getAll(){
    const {fieldsObj,...name} = req.body;  
    let result = await FindAllContainer({...name},{...fieldsObj});
    let dataArray = await result.toArray();
    if(dataArray.length > 0){
      res.json(dataArray);
      return;
    }
    res.json({});
  }
  getAll().catch((error)=>{
    console.log(error);
    res.json({error:'no ha data'});
  })
});
app.post('/api/container/edit', (req, res) => { 
  async function update(){ 
    const {_id,name,...rest} = req.body;
    let dateUnix = new Date();
    let Query = await FindContainer({name},{_id:true,name:true});
    if(Query?.hasOwnProperty('_id') && Query?._id?.toString() !== _id){
      res.json({name:'Container ya Registrado'});
      return;
    }
    let saveData = await UpdateContainer({_id},{name,...rest,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  update().catch((error)=>{
    res.json({error});
  })
});
app.post('/api/container/getinfo', (req, res) => { 
  async function getinfo(){ 
    const {_id} = req.body;
    let result = await FindContainer({_id});
    if(!result || !_id ){
      res.json({name:"warehouse Registrado o Invalido"});
      return;
    }
    res.json(result);
  }
  getinfo().catch((error)=>{
    res.json({error});
  });
});
app.post('/api/container/trashall', (req, res) => { 
  
  async function trash(){ 
    const {..._ids} = req.body;
    let result = await TrashAllContainer(_ids);
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/container/trash', (req, res) => { 
  async function trash(){ 
    const {_id} = req.body;
    let result = await TrashContainer({_id});
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
//WareHouse
app.post('/api/warehouse/checkisunique',(req,res)=>{
  const dataUserObj = req.body;
  FindWareHouse({...dataUserObj},{_id:true}).then((data)=>{
    const result = {isunique:false};
    if(data===null){
      result.isunique = true;
    }
    res.json({...result});
  }).catch((error)=>{
    res.json({error:true});
  });
});
app.post('/api/warehouse/edit', (req, res) => { 
  async function update(){ 
    const {_id,name} = req.body;  
    let dateUnix = new Date();
    let Query = await FindWareHouse({name},{_id:true,name:true});
    if(Query?.hasOwnProperty('_id') && Query?._id?.toString() !== _id){
      res.json({name:'WareHouse ya Registrado'});
      return;
    }
    let saveData = await UpdateWareHouse({_id},{name,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  update().catch((error)=>{
    res.json({error});
  })
});
app.post('/api/warehouse/getinfo', (req, res) => { 
  
  async function getinfo(){ 
    const {_id} = req.body;
    let result = await FindWareHouse({_id});
    if(!result || !_id ){
      res.json({name:"warehouse Registrado o Invalido"});
      return;
    }
    res.json(result);
  }
  getinfo().catch((error)=>{
    res.json({error});
  });
});
app.post('/api/warehouse/trashall', (req, res) => { 
  
  async function trash(){ 
    const {..._ids} = req.body;
    let result = await TrashAllWareHouse(_ids);
    console.log(result);

    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/warehouse/trash', (req, res) => { 
  
  async function trash(){ 
    const {_id} = req.body;
    console.log(_id);
    let result = await TrashWareHouse({_id});
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/warehouse/list', (req, res) => { 
  async function getAll(){ 
    let name = req.query.name || {};
    let dateUnix = new Date();
    let result = await FindAllWareHouse({...name},{});
    let dataArray = await result.toArray();
    if(dataArray.length > 0){
      res.json(dataArray);
      return;
    }
    res.json({});

  }
  getAll().catch((error)=>{
    console.log(error);
    res.json({error:'no ha data'});
  })
});
app.post('/api/warehouse/add', (req, res) => { 
  async function saveAll(){ 
    const {name} = req.body;  
    console.log(name);  
    let dateUnix = new Date();
    let result = await FindWareHouse({name});
    console.log(result);
    if(result || !name ){
      res.json({name:"warehouse Registrado o Invalido"});
      return;
    }
    let saveData = await SaveWareHouse({name,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    console.log(saveData);
    res.json(saveData);
  }
  saveAll().catch((error)=>{
    res.json({error});
  })
});

//Users
app.get('/check',(req,res)=>{
let token = req.query.token;
let client_id = req.query.clinet_id;
console.log(req.query);

const client = new OAuth2Client();
async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.APP_GOOGLEAPI,  // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  res.json(payload);
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}
verify().catch(console.error);

});
app.post('/api/users/logingoogle',(req,res)=>{
  const dataUserObj = req.body;
  loginAuthGoogle({...dataUserObj}).then((data)=>{
    res.json(data);
  }).catch((error)=>{
    res.json(error);
  })
});

app.post('/api/users/checkisunique',(req,res)=>{
  const dataUserObj = req.body;
  find({...dataUserObj},{_id:true}).then((data)=>{
    const result = {isunique:false};
    console.log(data);
    if(data===null){
      result.isunique = true;
    }
    res.json({...result});
  }).catch((error)=>{
    res.json({error:true});
  });
});
app.post('/api/users/add',(req,res) =>{
  const dataUserObj = req.body;
  newUser(dataUserObj).then((data)=>{
    res.json(data);
  }).catch((error)=>{
    console.log(error);
    res.json({error:"server down of error systems"});
  })
  
});
app.post('/api/users/list', (req, res) => {
  async function getAll(){ 
    let name = req.query.name || {};
    let dateUnix = new Date();
    let result = await FindAllUser({...name},{});
    let dataArray = await result.toArray();
    if(dataArray.length > 0){
      res.json(dataArray);
      return;
    }
    res.json({});
  }
  getAll().catch((error)=>{
    console.log(error);
    res.json({error:'no ha data'});
  }) 

});
app.post('/api/users/trashall', (req, res) => { 
  
  async function trash(){ 
    const {..._ids} = req.body;
    let result = await TrashAllUser(_ids);
    console.log(result);

    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/users/trash', (req, res) => { 
  
  async function trash(){ 
    const {_id} = req.body;
    console.log(_id);
    let result = await TrashUser({_id});
    res.json(result);
  }
  trash().catch((error)=>{
    console.log(error);
    res.json({error:'error en data'});
  })
});
app.post('/api/users/edit', (req, res) => { 
  async function update(){ 
    const {_id,...name} = req.body;  
    let dateUnix = new Date();
    let Query = await FindUser({name},{_id:true,name:true});
    if(Query?.hasOwnProperty('_id') && Query?._id?.toString() !== _id){
      res.json({name:'Usuario ya Registrado'});
      return;
    }
    let saveData = await UpdateUser({_id},{...name,unix: dateUnix.getTime(), utc: dateUnix.toUTCString()}); 
    res.json(saveData);
  }
  update().catch((error)=>{
    res.json({error});
  })
});
app.post('/api/users/getinfo', (req, res) => { 
  
  async function getinfo(){ 
    const {_id} = req.body;
    let result = await FindUser({_id});
    if(!result || !_id ){
      res.json({name:"warehouse Registrado o Invalido"});
      return;
    }
    res.json(result);
  }
  getinfo().catch((error)=>{
    res.json({error});
  });
});
app.post('/api/users/checktoken',(req,res)=>{
  const dataUserObj = req.body;
    checkTokenPassword(dataUserObj).then((data)=>{
      if(data?.error){
        console.log(data);
        return res.json({error:"Este acceso ha expirado, por favor, solicite un nuevo acceso."});
      }
    res.json(data);
  }).catch((error)=>{
    console.log(error);
    res.json({error:"se presento un problema en el servidor. Por favor, intenta mas Tarde."});
  });
});
app.post('/api/users/newpassword',(req,res)=>{
  const dataUserObj = req.body;

});
app.post('/api/users/recoverypassword',(req,res)=>{
  const dataUserObj = req.body;
  recoveryPass(dataUserObj).then((data)=>{
    if(data?.errors){
      res.json({...data});
      return;
    }
    const dataEncrypt = Buffer.from(JSON.stringify(data));
    const token = dataEncrypt.toString('base64')
    sendEmails({email:data.email,type:'recovery',token});
    res.json({acknowledged:true});
  }).catch((error)=>{
    console.log(error);
    res.json({error:"se presento un problema en el servidor. Por favor, intenta mas Tarde."});
  });
});
app.get('/add', (req, res) => {
  console.log('start Service');
  save({
    username: 'lvelarde01',
    password: '$2a$10$RONdN3HpK6VqIYFKM7srZ.1XEgfm.I5ZBm8dLR6DLNDbyVTXutINK',
    salt: '$2a$10$RONdN3HpK6VqIYFKM7srZ.',
    email: 'velardeluisangel@gmail.com',
    firstname: 'luis',
    lastname: 'velarde',
    token: '$2a$10$Kd9T9DXUdeOWxuCiwidcFeTSqdSIsnYSsRtUM0VSpc3FzgSiiI7dO',
    role: 'admin',
    company: 'claudstudio test service',
    company_ssid: 'RIF J123456789',
  })
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.json(error);
    });
});
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Username: ', username);
  console.log('Password: ', password);
  login(username, password)
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.json(error);
    });
});
app.post('/api/users/info', (req, res) => {
  const { _id, token } = req.body;
  find({ token }).then((data) => {
    res.json(data);
  });
});

app.post('/api/users/updateinfo', (req, res) => {
  const { query, data } = req.body;
  console.log(data);
  update({ ...query }, { ...data }).then((data) => {
    res.json(data);
  });
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
