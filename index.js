let SERVER_NAME = 'user-api'
let PORT = 3000;
let HOST = '127.0.0.1';

const mongoose = require ("mongoose");
let uristring = 'mongodb://127.0.0.1:27017/data';

// Makes db connection asynchronously
mongoose.connect(uristring, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', ()=>{
  // we're connected!
  console.log("!!!! Connected to db: " + uristring)
});

const userSchema = new mongoose.Schema({
  name: String, 
  age: String
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'User' collection in the MongoDB database
let UsersModel = mongoose.model('Users', userSchema);

let errors = require('restify-errors');
let restify = require('restify')

  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

  server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('**** Resources: ****')
  console.log('********************')
  console.log(' /users')
  console.log(' /users/:id')  
})

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Get all users in the system
server.get('/users', function (req, res, next) {
  console.log('GET /users params=>' + JSON.stringify(req.params));

  // Find every entity in db
  UsersModel.find({})
    .then((users)=>{
        // Return all of the users in the system
        res.send(users);
        return next();
    })
    .catch((error)=>{
        return next(new Error(JSON.stringify(error.errors)));
    });
})

// Get a single user by their user id
server.get('/users/:id', function (req, res, next) {
  console.log('GET /users/:id params=>' + JSON.stringify(req.params));

  // Find a single user by their id in db
  UsersModel.findOne({ _id: req.params.id })
    .then((user)=>{
      console.log("found user: " + user);
      if (user) {
        // Send the user if no issues
        res.send(user)
      } else {
        // Send 404 header if the user doesn't exist
        res.send(404)
      }
      return next();
    })
    .catch((error)=>{
        console.log("error: " + error);
        return next(new Error(JSON.stringify(error.errors)));
    });
})

// Create a new user
server.post('/users', function (req, res, next) {
  console.log('POST /users params=>' + JSON.stringify(req.params));
  console.log('POST /users body=>' + JSON.stringify(req.body));

  // validation of manadatory fields
  if (req.body.name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('name must be supplied'))
  }
  if (req.body.age === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('age must be supplied'))
  }

  let newUser = new UsersModel({
		name: req.body.name, 
		age: req.body.age
	});

  // Create the user and save to db
  newUser.save()
    .then((user)=> {
      console.log("saved user: " + user);
      // Send the user if no issues
      res.send(201, user);
      return next();
    })
    .catch((error)=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
  });
})


// Delete user with the given id
server.del('/users/:id', function (req, res, next) {
  console.log('POST /users params=>' + JSON.stringify(req.params));
  // Delete the user in db
  UsersModel.findOneAndDelete({ _id: req.params.id })
    .then((deletedUser)=>{      
      console.log("deleted user: " + deletedUser);
      if(deletedUser){
        res.send(200, deletedUser);
      } else {
        res.send(404, "User not found");
      }      
      return next();
    })
    .catch(()=>{
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
})


// // Example of using promise
// UsersModel.findOne({ _id: req.params.id })
// .then((user)=>{ }) // success
// .catch((error)=>{ }); // error
