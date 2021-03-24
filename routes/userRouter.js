const express = require('express');
const bodyParser = require('body-parser');

const user = require('../models/usersModel');

var userRouter = express.Router();

userRouter.use(bodyParser.json());

/** 
 * * User register error handlers
    Consist of two type of error handler for register function

 *  * Duplicate Properties Errors
        Rise an error when registered user are trying to register again with same email or userID , marked with error code 11000

 *  * Validation Errors
        Some error were caused by user validation fail, it means the requirements to register as new user are not fulfilled
*/
const handleErrors = (err)=>{
    console.log(err.message, err.code);
    
    let errors = {name : '', email : '', userID : '', password : ''};

    // Duplicate E-Mail Error
    if(err.code === 11000){
        errors.email = "E-Mail is already registered";
        errors.userID = "UserID has been used, enter another one"
        return errors;
    }

    // Validation Error Type
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties})=>{
            console.log(properties);
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

/**
 * *Root path API 
    Consist of 1 API

 *  * RETRIEVE ALL users data
 */
userRouter.route('/')

    // RETRIEVE all registered users
    .get((req, res, next)=>{
        user.find({})
            .then((userNext)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(userNext);
            })
            .catch((err)=>{
                console.log('Error = ' + err);
                res.statusCode =500;
                res.end('Internal Server Error');
            })
    });

/**
 * * Register path API
        Consist of one POST method that will handle registering process, there is no role restriction in this method.

        * *Requirements that must be fulfilled are placed in request BODY           
            * * Basic user requirements
                * @param name : "username",
                * @param email : "user valid email",
                * @param password : "user password, must be at least 8 chars"
 */
userRouter.route('/register')

    // CREATE a user
    .post(async(req, res, next) =>{
        const{name, email, password} = req.body;

        await user.create(req.body)
            .then((userNext)=>{
                console.log('New user created', userNext);
                res.statusCode = 200;
                res.setHeader('Content-type','application/json');
                res.json(userNext);
            })    
        .catch((err)=>{
            const errors = handleErrors(err);
            res.statusCode = 400;
            res.json({errors});
        });
    });

/**
 * *Specific user path API 
        These APIs are specified for one user only, it will only return the specified user through an id as path params 
            * @param userid MongoDB object id as path for specified user

        Consist of 3 APIs

            * * RETRIEVE Specified user, it will return user details for requested id
                * * Authorized Role
                    - USER can access this API for authorized user itself only, because this API is protected by checkID method for BASIC USER role. It means one user couldn't access other user details.

            * * UPDATE specified user, it will give update functionality on user details. Place the newest details on request BODY
                * *Request BODY value
                    * @param name : "username",
                    * @param email : "user valid email",
                    * @param userID : "user valid unique ID, STRING"
                    * @param password : "user password, must be at least 8 chars",
                    * @param interest : ["user topics interests"] 
                    * @param isInstitution : default is FALSE, request to TRUE if user want change membership to institution type one
        
            * * DELETE specified user
                * ! Plese use this API with caution    
*/
userRouter.route('/:userid')

    // RETRIEVE user details for specific id 
    .get((req, res, next) =>{
        user.findById(req.params.userid)
            .then((userNext)=>{
                if(userNext){
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(userNext);
                } else {
                    res.statusCode = 400;
                    res.end('User not Found')
                }
            })
            .catch((err)=>{
                console.log('Error = ' + err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            });
    })
    
    // UPDATE functionality for specific id
    .put((req, res, next) =>{
        user.findByIdAndUpdate(
            req.params.userid,
        {
            $set : req.body
        },{
            new : true
        })
            .then((userUpd)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(userUpd);
                console.log(`user ${req.params.userid} successfully updated`,userUpd)
            })
            .catch((err)=>{
                console.log('Error = ' + err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            });
    })

    // *! DELETE specific id
    .delete((req, res, next) =>{
        user.findByIdAndRemove(req.params.userid)
            .then((resp)=>{
                res.statusCode = 200;
                res.end('User '+ req.params.userid + ' has been deleted');
            })
            .catch((err)=>{
                console.log('Error : ' + err);
                res.statusCode = 500;
                res.end('Internal Server Error');                
            })
    });

module.exports = userRouter;
