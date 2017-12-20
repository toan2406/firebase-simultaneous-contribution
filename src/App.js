import React, { Component, PureComponent } from 'react';
import logo from './logo.svg';
import './App.css';
import set from 'lodash/fp/set';
import firebaseSC from './libs/firebase-sc';

class App extends Component {
  state = {
    users: []
  };

  componentDidMount() {
    firebaseSC.init({
      debounceTime: 500,
      enableQueue: false,
      apiKey: 'AIzaSyBiL4EDEMES7n2uSJBP68Yh7rEVMbJJ2c4',
      authDomain: 'fir-sync-427e9.firebaseapp.com',
      databaseURL: 'https://fir-sync-427e9.firebaseio.com',
      projectId: 'fir-sync-427e9',
      storageBucket: '',
      messagingSenderId: '482500410301'
    });

    firebaseSC.onDataChange(this.updateUsers);
    firebaseSC.fetchData().then(data => this.setState({ users: data.users }));
  }

  handleDataChange = ({ ref, value }) => {
    this.updateUsers({ ref, value }, () => firebaseSC.set({ ref, value }));
  };

  handleAddUser = () => {
    const ref = `/users/${this.state.users.length}`;
    const value = { name: '', position: '', age: '' };
    this.updateUsers({ ref, value }, () => firebaseSC.set({ ref, value }));
  };

  updateUsers = ({ ref, value }, callback) => {
    const path = ref
      .split('/')
      .filter(Boolean)
      .slice(1);

    this.setState(
      ({ users }) => ({
        users: set(path, value, users)
      }),
      callback
    );
  };

  render() {
    return (
      <div className="App">
        {this.state.users.map((user, index) => (
          <div key={index}>
            <h4>User no.{index + 1}</h4>
            <label>Name</label>
            <InputText
              name="name"
              index={index}
              value={user.name}
              onChange={this.handleDataChange}
            />
            <br />
            <label>Position</label>
            <InputText
              name="position"
              index={index}
              value={user.position}
              onChange={this.handleDataChange}
            />
            <br />
            <label>Age</label>
            <InputText
              name="age"
              index={index}
              value={user.age}
              onChange={this.handleDataChange}
            />
          </div>
        ))}

        <br />

        <button onClick={this.handleAddUser}>Add user</button>
      </div>
    );
  }
}

class InputText extends PureComponent {
  handleChange = e => {
    const { index, name, onChange } = this.props;
    onChange({
      ref: `/users/${index}/${name}`,
      value: e.target.value
    });
  };

  render() {
    return <input value={this.props.value} onChange={this.handleChange} />;
  }
}

export default App;
