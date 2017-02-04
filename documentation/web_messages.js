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

    // TODO CLIENT
    {
        type: login,
        email: email,
        password: password
    }
    Attempt to login