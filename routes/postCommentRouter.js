const express = require('express');
const bodyParser = require('body-parser');

const user = require('../models/usersModel');
const postComment = require('../models/postTimelineModel');

var postCommentRouter = express.Router();

postCommentRouter.use(bodyParser.json());

/**
 * *Root path API 
    Consist of 2 API

 *  * GET ALL published post
 */                                                  
postCommentRouter.route('/')
    .get((req, res, next)=>{
        postComment.userPost.find({})
            .then((result)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(result);
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.end('Internal Server Error');
                console.log(err);
            })
    });

/**
 * * Specific user path API
    These APIs are specified for one user only, it will only be used on the specified user through an id as path params 
        * @param userid MongoDB object id as path for specified user

    Consist of 2 APIs

        * * RETRIEVE Specified user posts, it will return user posts for requested user id

        * * CREATE a post by specific user, it will publish a post created by the user. Place the post content on request BODY
            * *Request BODY value
                * @param postContent : Content of the post from the user
 */
postCommentRouter.route('/user/:userid')

    // RETRIEVE all the posts of a specific user
    .get((req, res, next)=>{
        user.findById(req.params.userid).populate({
            path : "userPost",
            model : 'userPost',
        })
            .then((result)=>{
                console.log(result);
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(result.userPost);
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.end('Internal Server Error');
                console(err);    
            });
    })

    // CREATE post by the user
    .post((req, res, next)=>{
        const postContent = req.body.postContent;
        const userPostRef = req.params.userid;

        postComment.userPost.create({
            postContent,
            userPostRef
        })
            .then((postCreated)=>{                
                return user.findByIdAndUpdate(
                    req.params.userid,
                        {
                            $push : {
                            userPost : postCreated
                        }
                    },{new : true}
                )
                .then((result)=>{
                    res.statusCode = 201;
                    res.setHeader('Content-type','application/json');
                    res.json(result.userPost);
                })
            })
            .catch((err)=>{
                console.log(err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            })
    });

/**
 * *Specific post from specific user path API
    These APIs are specified for one post from one user only, it will only be used on the specified post and user through an id as path params 
        * @param userid MongoDB object id as path for specified user
        * @param postid MongoDB object id as path for specified post

    Consist of 3 APIs

        * * RETRIEVE Specified user post, it will return one user post for requested user id

        * * UPDATE a post by specific and authorized user. Place the post content on request BODY
            * *Request BODY value
                * @param postContent : Content of the post from the user
        
        * * DELETE a post by specific and authorized user only. 
            *! USE WITH CAUTION !
 */
postCommentRouter.route('/user/:userid/post/:postid')

    // RETRIEVE specified user post
    .get((req, res, next)=>{
        user.findById(req.params.userid).populate({
            path : 'userPost',
            match : {
                _id : req.params.postid
            },
            populate : {
                path : "comments",
                model : "commentPost"
            }
        })
            .then((result)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(result.userPost);
            })

            .catch((err)=>{
                console.log(err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            })
    })

    // UDPATE specified user post
    .put((req, res, next)=>{
        user.findById(req.params.userid)
            .then((result)=>{
                postComment.userPost.findByIdAndUpdate(
                    req.params.postid,
                    {
                        $set : {
                            postContent : req.body.postContent
                        }
                    },{
                        new : true
                    }
                )
                    .then((finalResult)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(finalResult);
                    })
            })
            .catch((err)=>{
                res.statusCode = 500;
                console.log(err);
                res.end('Internal Server Error');
            })

    })

    // DELETE specified user post
    .delete((req, res, next)=>{
        user.findByIdAndUpdate(
            req.params.userid,
            {
                $pull : {
                    userPost : req.params.postid
                }
            },{
                new : true
            }
        )
            .then((result)=>{
                postComment.userPost.findByIdAndRemove(req.params.postid)
                    .then((respon)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(result);
                    })
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.end('Internal Server Error');
                console.log(err);
            })
    });

/**
 * *Specific comment from specific post path API
    These APIs are specified for one post from one user only, it will only be used on the specified post and user through an id as path params 
        * @param userid MongoDB object id as path for specified user
        * @param postid MongoDB object id as path for specified post

    Consist of 1 API

        * * CREATE Specified user comment on a post, it will create comment and push it into desired post.
*/
postCommentRouter.route('/post/:postid/comment/commentator/:commentatorid')

    // CREATE comment
    .post((req, res, next)=>{
        const commentContent = req.body.commentContent;
        const userComReference = req.params.commentatorid;

        postComment.commentPost.create({
            commentContent,
            userComReference
        })
            .then((commentCreated)=>{
                postComment.userPost.findByIdAndUpdate(
                    req.params.postid,
                    {
                        $push : {
                            comments : commentCreated
                        }
                    }
                )
                    .then((result)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(result);
                    })
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.end('Internal Server Error');
                console.log(err);
            })
    });

/**
 * * Comments on specified user post API
        This API is used for RETRIEVE all comments on specified user post through an id as path params
            * @param postid MongoDB object id as path for specified user post

        Consist of 1 API

            * * Retrieve all comments on specified user post.
 */
postCommentRouter.route('/post/:postid/comment')
    .get((req, res, next)=>{
        postComment.userPost.findById(req.params.postid).populate({
            path : 'comments',
            model : 'commentPost'
        })
            .then((result)=>{
                console.log(result);
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(result.comments);
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.end('Internal Server Error');
                console.log(err);
            })
    });

/**
 * *Specific comment from specific post path API
    These APIs are specified for selected comment from one post only, it will only be used on the specified comment and post through an id as path params 
        * @param postid MongoDB object id as path for specified user
        * @param commentid MongoDB object id as path for specified post

    Consist of 2 APIs

        * * RETRIEVE Specified comment post, it will return one comment for requested user id
        
        * * DELETE a comment by specific and authorized user only. 
            *! USE WITH CAUTION !
*/
postCommentRouter.route('/post/:postid/comment/:commentid')
    .get((req, res, next)=>{
        postComment.userPost.findById(req.params.postid).populate({
            path : 'comments',
            model : "commentPost",    
            match : {
                _id : req.params.commentid
            }
        })
            .then((result)=>{
                console.log(result);
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(result.comments);
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.end('Internal Server Error');
                console.log(err);
            })
    })

    .delete((req, res, next)=>{
        postComment.userPost.findByIdAndUpdate(
            req.params.postid,
            {
                $pull : {
                    comments : req.params.commentid
                } 
            },{
                new : true
            }
        )
            .then((respon)=>{
                postComment.commentPost.findOneAndRemove(req.params.commentid)
                    .then((respon2)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(respon);
                    })
            })
            .catch((err)=>{
                res.statusCode = 500;
                res.end('Internal Server Error');
                console.log(err);
            })
    })


module.exports = postCommentRouter;
