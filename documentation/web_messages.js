SERVER TO CLIENT

    {
        type : logintoken,
        token: token
    }
    Sends new session token to user upon login success

    {
        type : loginfail
    }
    Login fails
    
    {
        type: loginfirst
    }
    Token check failed, you need to log in first
    
    {
        type: postsuccess
    }
    Confirmation that a new secret was successfully posted
    
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
    
    {
        type: alert
        msg: pofihasopeirhpaer
    }
    
    {
        type: tokenok
    }
    Response to validatetoken
    
    {
        type: postnotfound
    }
    Response to 'getpost'
    When the requested post is not found or not accessible

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
        college: college,
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
        type: requestposts,
        user_token: dfh2UMV0fmfimSVju9rwm,
        more: 1 // TODO CLIENT SERVER
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