import dispatcher from '../dispatcher';

export function addRoomMessage(data) {
    dispatcher.dispatch({
        type: 'ADD_MESSAGE',
        data
    })
};

export function saveRoomMessage(data) {
    dispatcher.dispatch({
        type: 'ROOM_MESSAGE',
        data
    })
};

export function getMessage(){
  dispatcher.dispatch({
      type: 'GET_MESSAGE',
  })
}
