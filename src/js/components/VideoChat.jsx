import React from 'react';

class VideoChat extends React.Component {
    // Close connections and clear field when you change room
    componentWillReceiveProps (nextProps, nextContext) {
        if (nextProps.id === this.props.id) return
        for (let peerId in this.peers) {
            this.peers[peerId].close();
        }

        this.setState(Object.assign(this.state, {
            channels: {}
        }));

        this.peers = {};
    }

    constructor (props) {
        super(props);
        this.socket = this.props.socket;

        this.state = {
            channels: [],
            hidden: false
        };
    }

    componentWillMount () {
        let socket = this.socket;
        this.peers = {};
        let localStream;

        // Get stream from your camera and begin connection
        navigator.getUserMedia({ 'audio': true, 'video': true },
            (stream) => { /* user accepted access to a/v */
                localStream = stream;
                this.setState(Object.assign(this.state, { myCamera: stream }));
                this.socket.emit('addRoom', {
                    room: this.props.id
                });
                socket.on('addPeer', addPeer.bind(this));
            },
            () => {
                this.setState({ hidden: true });
                this.socket.emit('addRoom', {
                    room: this.props.id
                });
            });

        function addPeer (config) {
            let peerId = config.peerId;

            if (peerId in this.peers) {
                return;
            }

            // Create RTC Connection
            let Connection = new RTCPeerConnection(
                { iceServers: [
                    { url: 'stun:23.21.150.121' },
                    { url: 'stun:stun.l.google.com:19302' },
                    { url: 'turn:numb.viagenie.ca', credential: 'your password goes here', username: 'example@example.com' }
                ]
                },
                {
                    optional: [
                        { DtlsSrtpKeyAgreement: true }, // требуется для соединения между Chrome и Firefox
                        { RtpDataChannels: true } // требуется в Firefox для использования DataChannels API
                    ]
                }
            );

            this.peers[peerId] = Connection;

            Connection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('relayICECandidate', {
                        'peerId': peerId,
                        'iceCandidate': {
                            'sdpMLineIndex': event.candidate.sdpMLineIndex,
                            'candidate': event.candidate.candidate
                        }
                    });
                }
            };

            Connection.onaddstream = (event) => {
                this.state.channels[peerId] = event.stream;
                this.setState(this.state);
            };
            // Add our local stream
            Connection.addStream(localStream);
            // If you enter channel create offer
            if (config.shouldCreateOffer) {
                Connection.createOffer().then(
                    (description) => {
                        Connection.setLocalDescription(description,
                            () => {
                                socket.emit('relaySessionDescription',
                                    { 'peerId': peerId, 'sessionDescription': description });
                            }
                        );
                    }
                );
            }
        }

        // Peers get session descriptions with information about video settings
        socket.on('sessionDescription', (config) => {
            let peerId = config.peerId;
            let peer = this.peers[peerId];
            let remoteDescription = config.sessionDescription;
            let desc = new RTCSessionDescription(remoteDescription);
            peer.setRemoteDescription(desc,
                () => {
                    if (remoteDescription.type === 'offer') {
                        peer.createAnswer().then(
                            (localDescription) => {
                                peer.setLocalDescription(localDescription,
                                    () => {
                                        socket.emit('relaySessionDescription',
                                            { 'peerId': peerId, 'sessionDescription': localDescription });
                                    }
                                );
                            });
                    }
                }
            );
        });

        // When you get IceCandidate
        socket.on('iceCandidate', (config) => {
            let peer = this.peers[config.peerId];
            let iceCandidate = config.iceCandidate;
            peer.addIceCandidate(new RTCIceCandidate(iceCandidate));
        });

        socket.on('removePeer', (config) => {
            let peerId = config.peerId;
            if (peerId in this.peers) {
                this.peers[peerId].close();
            }

            delete this.peers[peerId];
            delete this.state.channels[peerId];
            this.setState(Object.assign(this.state));
        });
    }

    render () {
        this.channels = [];
        for (let i in this.state.channels) {
            this.channels.push(this.state.channels[i])
        }
        return (
            <div className='VideoChat' hidden={this.state.hidden}>
                { <video muted autoPlay className='video camera' />}
                { this.channels.map((elem) => <video className='video peer' autoPlay />)}
            </div>
        );
    }

    componentDidMount () {
        this.componentDidUpdate();
    }

    // Set src to video elements
    componentDidUpdate (prevProps, prevState, snapshot) {
        document.querySelectorAll('.peer').forEach((elem, index) => {
            elem.srcObject = this.channels[index];
        });
        document.querySelector('.camera').srcObject = this.state.myCamera;
    }
}
export default VideoChat
