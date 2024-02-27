

const initial = {
    username : "",
    gamestate : {
    deck: [],
    username: "",
    allcards: 5,
    defusecard: 0,
    leaderboard: [{
        username: "",
        points: 0
    }]
    }
}

const reducer = (state=initial, action) => {
    if(action.type==='won')
    {
        const updatedLeaderboard = state.gamestate.leaderboard.map((user) =>
        user.username === action.payload
        ? { ...user, points: user.points + 1 }
        : user
        )
        return {
            ...state,
            gamestate: {
                ...state.gamestate,
                leaderboard : updatedLeaderboard
            }
        }
    }
    if(action.type==='registration')
    {
        return {
            ...state,
            username: action.payload,
            gamestate: {
                ...state.gamestate,
                username: action.payload,
                leaderboard: [{
                    username: action.payload,
                    points: 0
                }]
            }

        }
    }
    
    if(action.type==='remove')
    {
        return {
            ...state,
            gamestate: {
                ...state.gamestate,
                allcards: state.gamestate.allcards - action.payload
            }
        }
    }
    else if(action.type==='reset')
    {
        return {
            ...state,
            gamestate: {
                ...state.gamestate,
                allcards: 5,
                defusecard: 0
            }
        }
    }
    else if(action.type==='defuse')
    {
        return {
            ...state,
            gamestate: {
                ...state.gamestate,
                allcards: state.gamestate.allcards - action.payload,
                defusecard: state.gamestate.defusecard + action.payload
            }
        }
    }
    else if(action.type==='bomb')
    {
        if(state.gamestate.defusecard>0)
        {
            return {
                ...state,
                gamestate : {
                    ...state.gamestate,
                    allcards: state.gamestate.allcards - action.payload,
                    defusecard: state.gamestate.defusecard - action.payload
                }
            }
        }
        else{
            return {
                ...state,
                gamestate : {
                    ...state.gamestate,
                    allcards: 5
                }
            }
        }
    }
    else
    {
        return state;
    }
}

export default reducer;