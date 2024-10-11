import {RECEIVE_USER_GUIDE_NAME, DOWNLOADING_FILE, FILE_DOWNLOADED } from '../actions/types';


const userGuide = (state = { name: {}, isFetching: false}, action) => {
    switch (action.type) {
        case RECEIVE_USER_GUIDE_NAME:
            return { ...state, name: action.data};
        case DOWNLOADING_FILE:
            return {...state, isFetching:true};
        case FILE_DOWNLOADED:
            return {...state, isFetching:false};
        default:
            return state;
    }
}

export default userGuide;