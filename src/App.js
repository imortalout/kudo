// Base React 
import React from 'react';
import logo from './logo.svg';
import './App.css';

// Icones do FeatherIcons
import * as Icon from 'react-feather';

// Bliblioteca de Notificaçao
import Noty from 'noty';
import "../node_modules/noty/lib/noty.css"
import "../node_modules/noty/lib/themes/mint.css"

// Firebase Config Servidor
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

function Options(props){
    if(props.name === 'blue'){
      return (<div className="Selo Blue"><div className="Emoji">👨‍🎓</div></div>)
    } else  if(props.name === 'yellow'){
      return (<div className="Selo Yellow"><div className="Emoji">👏</div></div>)
    } else {
      return (<div className="Selo Pink"><div className="Emoji">🙏</div></div>)
    }
}

export default class App extends React.Component {

  state = {
    votes: [],
    kudos: [],
    nameUser: 'Login',
    blue: 0,
    pink: 0,
    yellow: 0,
    feed: false,
    openFeed: false,
    imageUser: 'https://firebasestorage.googleapis.com/v0/b/kudo-344d6.appspot.com/o/user.png?alt=media&token=cd87a326-b63e-476d-bb61-ec255cbcae52',
  }

  constructor(props) {
    super(props)

    // Bind para conseguir acessar o This
    this.logout = this.logout.bind(this)
    this.option = this.option.bind(this)
    this.openSide = this.openSide.bind(this)
    this.closeSide = this.closeSide.bind(this)
  }

  componentDidMount(){

    var refThis = this

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // Usuario sendo reconhecido
        var photoUrl = user.photoURL
        var displayName = user.displayName
        var uid = user.uid
        // Informacoes do usuario 
        refThis.setState({  
          nameUser: displayName,
          imageUser: photoUrl
        })

        // Verificação dos pontos
        var refBaseUser = firebase.database().ref('users/' + user.uid )
        refBaseUser.once('value', function(snapshot){

          var value = snapshot.val()
          // Caso nao tenha sao gerados
          if(value === null){ 
            refBaseUser.set({
              points: {
                blue: 2,
                yellow: 2,
                pink: 2
              }
            })
            // Colocado para receber os votos
            var firebaseRef = firebase.database().ref('votes').push()
            var object = {
              name: displayName,
              photo: photoUrl,
              uid: user.uid
            }
            firebaseRef.set(object)
          }
        })

        // [ON] como escutador dos pontos, para quando a info vier ser colocada
        var refPointsUser = firebase.database().ref('users/' + user.uid + '/points')
        refPointsUser.on('value', function(snapshot){
          var value = snapshot.val()

          if(value){
            refThis.setState({
              blue: value.blue,
              yellow: value.yellow,
              pink: value.pink
            })
          }
        })
      // Caso não exista usuário
      } else {
      // No user is signed in.
        refThis.setState({
          nameUser: "Login",
          imageUser: 'https://firebasestorage.googleapis.com/v0/b/kudo-344d6.appspot.com/o/user.png?alt=media&token=cd87a326-b63e-476d-bb61-ec255cbcae52'
        })
      }
    });

    // Busca pelos usuarios para listar
    var firebaseRef = firebase.database().ref('votes')
    firebaseRef.on('value', function(snapshot){
      var peoples = snapshot.val()
      var array = []

      if(peoples){
        for (var [key, value] of Object.entries(peoples)) {
            value.key = key
            
            var kudos = value.kudos 

            var blue = 0
            var pink = 0
            var yellow = 0

            for (var [key, value] of Object.entries(kudos)){
              if(value.color === 'pink'){
                pink = pink + 1
              } else if (value.color === 'yellow'){
                yellow = yellow + 1
              } else {
                blue =  blue + 1
              }
            }

            value.blue = blue
            value.pink = pink
            value.yellow = yellow

            console.log(value)
            array.push(value)
        }
      }
      refThis.setState({
        votes: array,
        votesObject: peoples
      })
    })

    var firebaseHistory = firebase.database().ref('history')
    firebaseHistory.on('value', function(snapshot){
      var historys = snapshot.val()
      var array = []

      if(historys){
        for (var [key, value] of Object.entries(historys)) {
            value.key = key

            function timeConverter(UNIX_timestamp){
              var a = new Date(UNIX_timestamp);
              var months = ['Jan','Fev','Mar','Abril','Maio','Jun','Jul','Ag','Set','Out','Nov','Dez'];
              var year = a.getFullYear();
              var month = months[a.getMonth()];
              var date = a.getDate();
              var hour = a.getHours();
              var min = a.getMinutes();
              var sec = a.getSeconds();
              var time = date + ' ' + month + ' - ' + hour + ':' + min;
              return time;
            }

            var time = timeConverter(value.vote.time)

            var newObject = {
              photoVote: value.vote.photo,
              nameVote: value.vote.name,
              photoTo: value.to.photo,
              nameTo: value.to.name,
              option: value.to.color, 
              time: time
            }

            array.push(newObject)
            
        }

        array.sort(function (a, b) {
          if (a.time > b.time) {
              return -1
          }
          if (a.time < b.time) {
              return 1
          }
          return 0 
      })

        refThis.setState({
          kudos: array
        })
      }
    })
  }

  option(key, color){
    // Localiza quantos pontos tem
    var pointsColor = this.state[color]
    var vote = this.state.votesObject[key]

    // Verifica se existe o usuario
    var user = firebase.auth().currentUser
    
    if(user){
      if(pointsColor >= 1){

        var refData = firebase.database() 

        var refPoints = refData.ref('users/'+ user.uid + '/points/' + color)
        var refVotes = refData.ref('users/' + user.uid + '/votes/').push()
        var refPeople = refData.ref('votes/' + key + '/kudos/').push()
        var refHistory = refData.ref('history').push()
        var timeStamp = firebase.database.ServerValue.TIMESTAMP

        var recPeople = {
          name: vote.name,
          photo: vote.photo,
          uid: vote.key,
          color: color,
          time: timeStamp
        }

        var toPeople = {
          name: user.displayName,
          photo: user.photoURL,
          uid: user.uid, 
          color: color,
          time: timeStamp
        }

        refHistory.set({to: recPeople, vote: toPeople})

        refVotes.set(recPeople)
        refPeople.set(toPeople)

        refPoints.transaction(function(currentClicks) {            
              return (currentClicks || 0) - 1
        })

        new Noty({
          title: 'Certo', 
          text: 'Kudo Efetuado',
          type: 'success',
          timeout: 1500,
        }).show()
      } else {
        new Noty({
          title: 'Error', 
          text: 'Sem Pontos',
          type: 'error',
          timeout: 1500,
        }).show()  
      }
    } else {
      new Noty({
          title: 'Error', 
          text: 'Você Precisa estar Logado',
          type: 'error',
          timeout: 1500,
        }).show()
    } 
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
        nameUser: "Login",
        imageUser: 'https://firebasestorage.googleapis.com/v0/b/kudo-344d6.appspot.com/o/user.png?alt=media&token=cd87a326-b63e-476d-bb61-ec255cbcae52',
        blue: 0,
        yellow: 0,
        pink: 0
      })
      new Noty({
          title: 'Certo', 
          text: 'Deslogado com Sucesso',
          type: 'success',
          timeout: 1500,
      }).show()
    }).catch(function(error) {
      // An error happened.
    });
  }  

  openSide(){
    function sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    this.setState({feed: true})
    // Usage!
    sleep(300).then(() => {
        this.setState({openFeed: true})
    })
  }

  closeSide(){
    function sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    this.setState({openFeed: false})
    // Usage!
    sleep(300).then(() => {
        this.setState({feed: false})
    })
  }



  render() {

    var { votes, nameUser, imageUser, blue, pink, yellow, openFeed, feed, kudos, data, options } = this.state

    var refThis = this

    return(
      <div className="App">
        <div className="Perfil">
          <div className="Options">
            <div className="SideBar" onClick={this.openSide}>
              <Icon.Sidebar size={20}/>
            </div>
          </div>
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
            <div className="Selo Yellow"><div className="Emoji">👏</div><div className="Point">{yellow}</div></div>
            <div className="Selo Pink"><div className="Emoji">🙏</div><div className="Point">{pink}</div></div>
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
                    <div className="Selo Blue" onClick={() => refThis.option(d.key, "blue")}><div className="Emoji">👨‍🎓</div><div className="Point">{d.blue}</div></div>
                    <div className="Selo Yellow" onClick={() => refThis.option(d.key, "yellow")}><div className="Emoji">👏<div className="Point">{d.yellow}</div></div></div>
                    <div className="Selo Pink" onClick={() => refThis.option(d.key, "pink")}><div className="Emoji">🙏<div className="Point">{d.pink}</div></div></div>
                  </div>
                </div>
            </div>
            )
          })}
        </div>
        {feed ? (
          <div className={"Kudos " +  openFeed}>
            <div className="Feed">
              <h3>Feed Kudos</h3>
              <div className="FeedKudo">
              { kudos.map(function(d, idx){
                return(
                  <div className="Kudo">
                    <div className="peopleVote">  
                      <img src={d.photoVote}/>
                      <p>{d.nameVote}</p>
                    </div>
                    <div className="OptionsKudo">
                      <Icon.ArrowRightCircle size={20} color="#585A5D"/>
                      <Options name={d.option}/>
                    </div>
                    <div className="peopleVote">  
                      <img src={d.photoTo}/>
                      <p>{d.nameTo}</p>
                    </div>
                    <p className="KudoTime">{d.time}</p>
                  </div>
                )
              })}
              </div>
            </div>
            <div className="Background" onClick={this.closeSide}></div>
          </div>
          ) : null
        }
      </div>
    )
  }
}

