import React from 'react';
import MainChat from './MainChat.jsx'
import VideoChat from './VideoChat.jsx'
class Chat extends React.Component {
    // When you change room leave from old room and enter in new
    componentWillReceiveProps (nextProps, nextContext) {
        this.socket.emit('changeRoom', {});
        this.socket.emit('addRoom', {
            room: nextProps.match.params.id
        });
    }

    constructor (props) {
        super(props);
        this.socket = this.props.socket;
    }
    render () {
        return (
            <div className='chat'>
                <VideoChat socket={this.socket} id={this.props.match.params.id} />
                <MainChat socket={this.socket} id={this.props.match.params.id} name={this.props.name} />
            </div>
        )
    }

}
export default Chat;
