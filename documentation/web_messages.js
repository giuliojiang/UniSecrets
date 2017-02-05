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
    
    // TODO SERVER CLIENT
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
