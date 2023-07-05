const express = require('express');
const bodyParser = require('body-parser');
/*api manager */
const { save, find, update, login, newUser,recoveryPass,loginAuthGoogle,checkTokenPassword,updatePassword} = require('./conection');
const {sendEmails} = require('./serviceEmail');

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
  res.json({ data: 'work sistem' });
});

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
app.post('/api/users/password',(req,res)=>{
  updatePassword({...req.body}).then((data)=>{
    console.log(data);
   res.json({...data});
  }).catch((error)=>{
    console.log(error);
    res.json({acknowledged:false});
  });
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
