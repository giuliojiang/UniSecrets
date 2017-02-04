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
    
    // TODO SERVER CLIENT
    {
        type: loginfirst
    }
    Token check failed, you need to log in first

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

    // TODO SERVER
    {
        type: new_post,
        "public": 0/1,
        text: I like rowing sometimes,
        user_token: dfh2UMV0fmfimSVju9rwm
    }
    New post msg
