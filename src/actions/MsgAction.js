import dispatcher from '../dispatcher';

export function sendMessage(data) {
    dispatcher.dispatch({
        type: 'SEND_MESSAGE',
        data
    })
};

export function historyMessage(data) {
    dispatcher.dispatch({
        type: 'HISTORY_MESSAGE',
        data
    })
};
