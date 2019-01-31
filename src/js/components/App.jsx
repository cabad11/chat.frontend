import React from 'react';
import { Switch, Route } from 'react-router-dom'
import Chat from './Chat.jsx'
import ListRooms from './ListRooms.jsx'

class App extends React.Component {
    constructor (props) {
        super(props);
        this.socket = this.props.socket;
        this.state = {
            hidden: false
        };
        this.submit = this.submit.bind(this);
    }
    // Submit your name and open chat component
    submit (e) {
        e.preventDefault();
        if (this.refs.name.checkValidity()) {
            this.socket.emit('initUser',{
                name: this.refs.name.value
            });
            this.setState(Object.assign(this.state, {
                hidden: true,
                name: this.refs.name.value
            }))
        }
    }
    render () {
        return (
            <div id='main'>
                <ListRooms socket={this.socket} />
                <div className='Chat_container'>
                    <label htmlFor='name' hidden={this.state.hidden}>Write your name for begin</label>
                    <div className='input-group' hidden={this.state.hidden}>
                        <input ref='name' className='form-control' type={'text'} required id='name' />
                        <button className='btn btn-outline-secondary' type='button' onClick={this.submit}>Create</button>
                    </div>
                    <Switch>
                        <Route path='/:id' render={(props) =>
                            !this.state.hidden || <Chat socket={this.socket} name={this.state.name} {...props} />} />
                    </Switch>
                </div>
            </div>
        )
    }
}

export default App;
