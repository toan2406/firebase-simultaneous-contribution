import React, { Component, PureComponent } from 'react';
import logo from './logo.svg';
import './App.css';
import set from 'lodash/fp/set';
import debounce from 'lodash/debounce';
import firebaseSC from './libs/firebase-sc';

class App extends Component {
  state = {
    users: []
  };

  componentDidMount() {
    firebaseSC.init({
      apiKey: 'AIzaSyBiL4EDEMES7n2uSJBP68Yh7rEVMbJJ2c4',
      authDomain: 'fir-sync-427e9.firebaseapp.com',
      databaseURL: 'https://fir-sync-427e9.firebaseio.com',
      projectId: 'fir-sync-427e9',
      storageBucket: '',
      messagingSenderId: '482500410301'
    });

    firebaseSC.onDataChange(payload => {
      const { ref, value } = payload;
      const path = ref
        .split('/')
        .filter(Boolean)
        .slice(1);

      console.log('Detect change, update state');
      this.setState(({ users }) => ({
        users: set(path, value, users)
      }));
    });

    firebaseSC.fetchData().then(data => this.setState({ users: data.users }));
  }

  handleDataChange = ({ ref, value }) => {
    const path = ref
      .split('/')
      .filter(Boolean)
      .slice(1);

    this.setState(
      ({ users }) => ({
        users: set(path, value, users)
      }),
      () => this.syncDataToFirebase({ ref, value })
    );
  };

  syncDataToFirebase = debounce(({ ref, value }) => {
    firebaseSC.set({ ref, value });
  }, 0);

  render() {
    return (
      <div className="App">
        {this.state.users.map((user, index) => (
          <div key={index}>
            <InputText
              name="name"
              index={index}
              value={user.name}
              onChange={this.handleDataChange}
            />
            <InputText
              name="position"
              index={index}
              value={user.position}
              onChange={this.handleDataChange}
            />
            <InputText
              name="age"
              index={index}
              value={user.age}
              onChange={this.handleDataChange}
            />
          </div>
        ))}
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
