import React from 'react';
import { NavLink } from 'react-router-dom';

class ListRooms extends React.Component {

    constructor (props) {
        super(props);

        this.state = JSON.parse(localStorage.getItem('rooms')) || {
            rooms: ['0']
        };

        this.addRoom = this.addRoom.bind(this);
        this.removeRoom = this.removeRoom.bind(this);
    }

    addRoom (e) {
        e.preventDefault();
        let msg = this.refs.name;

        if (msg.checkValidity() && !(this.state.rooms.indexOf(msg.value) + 1)) {
            this.setState(Object.assign(this.state, {
                rooms: this.state.rooms.concat(msg.value)
            }));
            localStorage.setItem('rooms', JSON.stringify(this.state));
        }

        this.refs.name.value = '';
    }

    removeRoom (e) {
        let index = e.target.dataset.index;
        this.state.rooms.splice(index, 1);

        this.setState(Object.assign(this.state, {
            rooms: this.state.rooms
        }));
        localStorage.setItem('rooms', JSON.stringify(this.state));
    }

    render () {
        return (
            <div className='ListRooms'>
                <div className='input-group'>
                    <input className='form-control' ref='name' type='text' required />
                    <button className='btn btn-outline-secondary' type='button' onClick={this.addRoom}>Create</button>
                </div>
                <nav className='navRoomList'>
                    <ul className='list-group'>
                        { this.state.rooms.map((elem, index) => {
                            return (<li className='list-group-item'>
                                <NavLink exact class='nav-link room' to={'/' + elem} activeClassName='active'>{elem}</NavLink>
                                <span className='close' data-index={index} onClick={this.removeRoom} />
                            </li>)
                        })}
                    </ul>
                </nav>
            </div>
        )
    }
}

export default ListRooms;
