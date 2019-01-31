import React from "react"

class MainChat extends React.Component{
    // clear chat when you change room
    componentWillReceiveProps (nextProps, nextContext) {
        if (this.props.id !== nextProps.id) {
            this.setState({
                msg: [],
                users: []
            });
        }
    }

    constructor (props) {
        super(props);
        this.socket = this.props.socket;

        this.socket.on('message', (msg) => {
            this.setState(Object.assign(this.state, {
                msg: this.state.msg.concat(msg)
            }))
        });
        this.socket.on('addUser', (msg) => {
            this.setState(Object.assign(this.state, {
                users: this.state.users.concat(msg.name)
            }))
        });
        this.socket.on('removeUser', (msg) => {
            let index = this.state.users.indexOf(msg.name);
            this.state.users.splice(index, 1);

            this.setState(Object.assign(this.state))
        });
        this.state = {
            msg: [],
            users: []
        };
        this.submit = this.submit.bind(this);
    }

    submit (e) {
        e.preventDefault();
        let msg = this.refs.message;

        if (msg.checkValidity()) {
            this.socket.emit('text', {
                text: this.refs.message.value,
                room: this.props.id
            });

            let stringDate = new Date().toLocaleString('ru',{
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });
            this.setState(Object.assign(this.state, {
                msg: this.state.msg.concat({
                    text: this.refs.message.value,
                    name: this.props.name,
                    date: stringDate
                })
            }));

            msg.value = '';
        }
    }

    render () {
        return (<div className='Chat_main'>
            <div className='messages' ref='chatField'>
                {this.state.users.map((elem) => {
                    return (
                        <div className='message form-control user'>
                            <span className='author'>{elem}</span>
                        </div>
                    )
                })}
                {this.state.msg.map((elem) => {
                    return (
                        <div className='message form-control'>
                            <span className='author time'>{elem.date} </span>
                            <span className='author'>{elem.name}</span>
                            : {elem.text}</div>
                    )
                })}
            </div>
            <div className='input-group'>
                <input type='text' className='form-control' ref='message' required />
                <button className='btn btn-outline-secondary' type='button' onClick={this.submit}>Submit</button>
            </div>
        </div>)
    }

    // scroll chat to the last message
    componentDidUpdate () {
        this.refs.chatField.scrollTo(0, 1000);
    }
}
export default MainChat;
