SERVER TO CLIENT

    // TODO CLIENT
    {
        type : logintoken,
        token: token
    }
    Sends new session token to user upon login success

    // TODO CLIENT
    {
        type : loginfail
    }
    Login fails

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
