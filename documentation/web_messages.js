SERVER TO CLIENT

    {
        type : logintoken,
        token: token,
        admin: 1
    }
    Sends new session token to user upon login success
    in: login

    {
        type : loginfail
    }
    Login fails
    in: login
    
    {
        type: loginfirst
    }
    Token check failed, you need to log in first
    in: post, dashboard, new_post
    
    {
        type: postsuccess
    }
    Confirmation that a new secret was successfully posted
    in: new_post
    
    {
        type: postlist,
        posts: [
            id: 92490,
            text: text,
            likes: 12,
            dislikes: 973498234e456,
            college: UCLSUCKS,
            comments: [
                nickname: foiasho,
                text: text
            ]
        ]
    }
    List of messages for the dashboard!
    in: dashboard
    
    {
        type: updatepost,
        id: 92490,
        text: text,
        likes: 12,
        dislikes: 973498234e456,
        college: UCLSUCKS,
        comments: [
            nickname: foiasho,
            text: text
        ]
    }
    Update content of single post
    in: post, dashboard
    
    {
        type: alert
        msg: pofihasopeirhpaer
    }
    in: registration, activation

    {
        type: postnotfound
    }
    Response to 'getpost'
    When the requested post is not found or not accessible
    in: post
    
    {
        type: toactivation
    }
    After user inserted registration details, he is redirected to the email verification page
    in: registration
    
    {
        type: activationsuccess
    }
    Activation of new account was successful. User will be shown a message and a button to go to login
    in: activation
    
    {
        type: collegenotfound
    }
    When user registers, but the email used doesn't correspond to any known college in the database.
    in: registration
    
    {
        type: pendingcollegelist,
        colleges: [
            {
                college: "imperial",
                domain: "ic.ac.uk"
            }
        ]
    }
    Sends to an admin the list of pending colleges to be activated
    in: admin
    
    {
        type: unapproved_posts,
        posts: [
            {
                postid: 34,
                college: "imperial",
                text: "hello world"
            }
        ]
    }
    List of unapproved posts
    in: admin
    
    {
        type: page_not_found
    }
    Notifies that requests page doesn't exist
    in: dashboard
    
    {
        type: total_pages,
        maxp: 2
    }
    Notifies that there are 2 pages available (0 and 1)
    in: dashboard
    
    {
        type: homepage_post_list,
        posts: [
            id: 92490,
            text: text,
            college: UCLSUCKS
        ]
    }
    Response to homepage_list
    in: index
    
    {
        type: goto,
        where: "/login",
        premsg: "you need to login"
    }
    Redirect.
    premsg should be shown before redirecting
    in: index, firsttimesetup


CLIENT TO SERVER

    {
        type: login,
        email: email,
        password: password
    }
    Attempt to login

    {
        type: registration,
        email: email,
        nickname: nickname,
        password: password
    }
    Registration msg

    {
        type: new_post,
        "public": 0/1,
        text: I like rowing sometimes,
        user_token: dfh2UMV0fmfimSVju9rwm
    }
    New post msg
    
    {
        type: new_post_anon,
        text: I like rowing sometimes
    }
    New post msg
    
    {
        type: requestposts,
        user_token: dfh2UMV0fmfimSVju9rwm,
        page: 0
    }
    Request updated post list
    
    {
        type: new_comment,
        user_token: dfh2UMV0fmfimSVju9rwm,
        postid: 82099834,
        text: notbad
    }
    Add a new comment
    
    {
        type: like,
        user_token: dfh2UMV0fmfimSVju9rwm,
        postid: 093749,
        value: 1 // +1 0 or -1
    }
    LIke/ unlike post
    Server will send a updatepost in return
    
    {
        type: validatetoken,
        user_token: dfh2UMV0fmfimSVju9rwm
    }
    Check if token is valid upon connection of WebSocket.
    Might respond with a 'loginfirst' if fail,
    or 'tokenok' if ok

    {
        type: getpost,
        user_token: dfh2UMV0fmfimSVju9rwm,
        postid: 8754
    }
    Requests a single post from the server
    Can return a 'updatepost'
    or a 'postnotfound'
    
    {
        type: activationcode,
        email: oighs@goph.co,
        code: fpoiahseporhfoihapseuhgrposaiuhr
    }
    Client sends email and activation code to activate an account
    
    {
        type: addcollege,
        email: poifhjsoper@fojs.ic.ac.uk,
        college: "bella de padella"
    }
    User requests a new college to be added to database
    
    {
        type: pendingcollegeslist,
        user_token: dfh2UMV0fmfimSVju9rwm
    }
    Request list of colleges that need to be activaated
    
    {
        type: pendingcollegeaction,
        user_token: dfh2UMV0fmfimSVju9rwm
        accept: 1,
        college: Imperial,
        domain: ic.ac.uk
    }
    Accept or reject a college
    
    {
        type: get_unapproved_posts,
        user_token: dfh2UMV0fmfimSVju9rwm
    }
    Request list of unapproved posts (admin only).
    
    {
        type: approve_post,
        user_token: dfh2UMV0fmfimSVju9rwm,
        accept: 1,
        postid: 95487
    }
    Approve or reject a post
    
    {
        type: homepage_list
    }
    Request a list of public posts for the homepage
    
    {
        type: "first_time_form",
        username: "admin",
        email: "email@example",
        college: "Some College",
        password: "password"
    }
    Sends the initial data of the first user account