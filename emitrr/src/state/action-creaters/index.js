export const removeCard = (card) => {
    return (dispatch) => {
        dispatch({
            type: 'remove',
            payload: card
        })
    }
}

export const resetCard = (card) => {
    return (dispatch) => {
        dispatch({
            type: 'reset',
            payload: card
        })
    }
}

export const checkDefuse = (defuse) => {
    return (dispatch) => {
        dispatch({
            type: 'defuse',
            payload: defuse
        })
    }
}

export const checkBomb = (defuse) => {
    return (dispatch) => {
        dispatch({
            type: 'bomb',
            payload: defuse
        })
    }
}

export const incrementPoint = (point) => {
    return (dispatch) => {
        dispatch({
            type: 'won',
            payload: point
        })
    }
}

export const userRegistration = (username) => {
    return (dispatch) => {
        dispatch({
            type: 'registration',
            payload: username
        })
    }
}

