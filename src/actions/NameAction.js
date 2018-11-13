import dispatcher from '../dispatcher';

export function setName(name) {
    dispatcher.dispatch({
        type: 'SET_NAME',
        name
    });
};

export function addName(name){
  dispatcher.dispatch({
      type: 'ADD_NAME',
      name
  });
};

export function delName(name) {
    dispatcher.dispatch({
        type: 'DEL_NAME',
        name
    });
};
