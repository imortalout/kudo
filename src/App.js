import React from 'react';
import logo from './logo.svg';
import './App.css';

import firebase from 'firebase'

var firebaseConfig = {
  apiKey: "AIzaSyCoB_i-QhgrvHfk-S6cQeM_HhO_qLv59-I",
  authDomain: "kudo-344d6.firebaseapp.com",
  databaseURL: "https://kudo-344d6.firebaseio.com",
  projectId: "kudo-344d6",
  storageBucket: "kudo-344d6.appspot.com",
  messagingSenderId: "896922984879",
  appId: "1:896922984879:web:d43247ec0294cd50738f5a",
  measurementId: "G-PVSTECC9QC"
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

export default class App extends React.Component {

  state = {
    votes: []
  }

  constructor(props) {
    super(props)
    console.log('Props')
  }

  componentDidMount(){

    var refThis = this
    
    var firebaseRef = firebase.database().ref('votes')
    firebaseRef.once('value', function(snapshot){
      var peoples = snapshot.val()
      var array = []

      for (var [key, value] of Object.entries(peoples)) {
           console.log(value); // "a 5", "b 7", "c 9"
           array.push(value)
      }
      refThis.setState({
        votes: array
      })
    })

   // var firebaseRef = firebase.database().ref('votes').push()
   // var object = {
   //    name: 'Rafa',
   //    photo: 'https://firebasestorage.googleapis.com/v0/b/kudo-344d6.appspot.com/o/Screen%20Shot%202020-06-18%20at%2019.16.09.png?alt=media&token=c235d144-d666-42c1-aa47-ff3850061b6a'
   // }
   // firebaseRef.set(object)

  }

  render() {

    var { votes } = this.state


    return(
      <div className="App">
        <h1>Dê um kudo!</h1>
        <div className="Selos">
          <div className="Title">
            <h2>Selos Disponíveis</h2>
            <p>Atualizado em 01/04/2020</p>
          </div>
          <div className="Total-Selos">
            <div className="Selo Blue"><div className="Emoji">👨‍🎓</div><div className="Point">0</div></div>
            <div className="Selo Yellow"><div className="Emoji">👏</div><div className="Point">0</div></div>
            <div className="Selo Pink"><div className="Emoji">🙏</div><div className="Point">0</div></div>
          </div>
        </div>
        <div className="Votes">
          { votes.map(function(d, idx){
           return (
               <div className="Vote">
                <img src={d.photo}/>
                <div className="Wrap">
                  <div className="Wrap-Title">
                    <p>Dê um Kudo para</p>
                    <h3>{d.name}</h3>
                  </div>
                  <div className="Total-Selos">
                    <div className="Selo Blue"><div className="Emoji">👨‍🎓</div></div>
                    <div className="Selo Yellow"><div className="Emoji">👏</div></div>
                    <div className="Selo Pink"><div className="Emoji">🙏</div></div>
                  </div>
                </div>
            </div>
            )
          })}
        </div>
      </div>
    )
  }
}

