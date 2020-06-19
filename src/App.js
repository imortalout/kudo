import React from 'react';
import logo from './logo.svg';
import './App.css';


import * as Icon from 'react-feather';
import Noty from 'noty';

import "../node_modules/noty/lib/noty.css";  
import "../node_modules/noty/lib/themes/mint.css"; 

import firebase from 'firebase';

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
    votes: [],
    nameUser: 'Usuário',
    blue: 0,
    pink: 0,
    yellow: 0,
    imageUser: 'https://firebasestorage.googleapis.com/v0/b/kudo-344d6.appspot.com/o/user.png?alt=media&token=cd87a326-b63e-476d-bb61-ec255cbcae52'
  }

  constructor(props) {
    super(props)

    this.logout = this.logout.bind(this)
  }

  componentDidMount(){

    var refThis = this

    firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var photoUrl = user.photoURL
      var displayName = user.displayName
      var uid = user.uid

      console.log(user)

      refThis.setState({
        nameUser: displayName,
        imageUser: photoUrl
      })

      var refBaseUser = firebase.database().ref('users/' + user.uid )
      refBaseUser.once('value', function(snapshot){

        var value = snapshot.val()
        if(value === null){ 
          refBaseUser.set({
            points: {
              blue: 2,
              yellow: 2,
              pink: 2
            }
          })
        }
      })

      var refPointsUser = firebase.database().ref('users/' + user.uid + '/points')
      refPointsUser.on('value', function(snapshot){
        var value = snapshot.val()
        console.log(value)

        refThis.setState({
          blue: value.blue,
          yellow: value.yellow,
          pink: value.pink
        })
      })

      } else {
      // No user is signed in.
        refThis.setState({
          nameUser: "Usuário",
          imageUser: 'https://firebasestorage.googleapis.com/v0/b/kudo-344d6.appspot.com/o/user.png?alt=media&token=cd87a326-b63e-476d-bb61-ec255cbcae52'
        })
      }
    });

    
    var firebaseRef = firebase.database().ref('votes')
    firebaseRef.once('value', function(snapshot){
      var peoples = snapshot.val()
      var array = []

      for (var [key, value] of Object.entries(peoples)) {
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

  loginWithGoogle(){

    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      var credential = result.credential
      // The signed-in user info.
      var user = result.user;

      console.log(user)
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  logout(){

    var refThis = this

    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      refThis.setState({
        nameUser: "Usuário",
        imageUser: 'https://firebasestorage.googleapis.com/v0/b/kudo-344d6.appspot.com/o/user.png?alt=media&token=cd87a326-b63e-476d-bb61-ec255cbcae52',
        blue: 0,
        yellow: 0,
        pink: 0
      })
      new Noty({
        text: "Deslogado"
      }).show();
    }).catch(function(error) {
      // An error happened.
    });
  }

  render() {

    var { votes, nameUser, imageUser, blue, pink, yellow } = this.state

    return(
      <div className="App">
        <div className="Perfil">
          <div onClick={this.loginWithGoogle}>
            <img src={imageUser}/>  
          </div>
          <p>{nameUser}</p>
          <div className="Logout" onClick={this.logout}>
            <Icon.LogOut size={20}/>
          </div>
        </div>
        <h1>Dê um kudo!</h1>
        <div className="Selos">
          <div className="Title">
            <h2>Selos Disponíveis</h2>
            <p>Atualizado em 01/04/2020</p>
          </div>
          <div className="Total-Selos">
            <div className="Selo Blue"><div className="Emoji">👨‍🎓</div><div className="Point">{blue}</div></div>
            <div className="Selo Yellow"><div className="Emoji">👏</div><div className="Point">{pink}</div></div>
            <div className="Selo Pink"><div className="Emoji">🙏</div><div className="Point">{yellow}</div></div>
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

