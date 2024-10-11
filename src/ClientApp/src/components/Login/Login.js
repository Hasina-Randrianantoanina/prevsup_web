import React, { useState } from "react";
import { useEffect } from "react";
import {  Message } from "semantic-ui-react"
import ContactLogin from "./ContactLogin";
import sanitizeHtml from "sanitize-html-react";

import './Login.css';

function Login(props) {

  const { handleSubmit, appInfo } = props;

  const [user, setUser] = useState(
    {
      username: "",
      password: "",
    }
  );
  const sanitizeConf = {
    allowedTags: ["b", "i", "p", "div", "br", "u","a"],
};

  const mail = "prevision.superieur@enseignementsup.gouv.fr"
  const textContact=`<p>En cas de difficulté d’accès ou d’utilisation de l’application, ou d’interrogation sur les données, nous vous remercions d’envoyer votre demande au SIES via l’adresse ci-contre : <a href="mailto:${mail}"><b><span style='color:rgba(7, 74, 85, 0.7)'>prevision.superieur@enseignementsup.gouv.fr</span></b></a><p>`
  const appInfoState = appInfo? appInfo.info : {content:"Erreur, pas d'information", address:"Erreur, pas d'adresse"}
  const [applicationText,setApplicationText] = useState(appInfoState.content)
  const [infoAdress,setInfoAdress] = useState(appInfoState.address)
  useEffect(()=>{
document.querySelector('title').textContent='Prevsup - Login';
  },[])

  const [isRunning, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const handleChange = (event) => {
    let name = event.target.name;
    let value = event.target.value;
    user[name] = value;
    setUser(user);
  }
  const insertPost = async function (data) {
    let response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    })
    let responseData = await response.json()
    //console.log(responseData)
  }

  const handleLogin = () => {
    setRunning(true);
    handleSubmit(user).then(data => {
      setRunning(false);
      document.querySelector('title').textContent='Prevsup';
      setMessage("");
    }).catch(err => {
      setMessage(err);
      setRunning(false)
    });
  }
  const handleKeyPress=(event)=>{
    if (event.key === 'Enter') {handleLogin()}
  }

  const buttonAttribute = {};
  if (isRunning) {buttonAttribute.style = { backgroundColor:'#b6b6b6',cursor:'not-allowed'};buttonAttribute.disabled=true;}
  return (
    <div>
    <div className="parent-login" >

      <div>
      <div className="container-login">
          <div id="form"> 
            <div className="title">Connexion à prevsup</div>
            <div className="image"><img src={require('../../img/logo.png')} alt="logo" /></div>
            <div className="allinput">
              <div className="input-text" id="login_user">
                <label id="lusername" className="label-login" >Identifiant</label>
                <input type="text" placeholder="Login de connexion" name='username' onChange={handleChange} onKeyPress={(event) => handleKeyPress(event)}/>
              </div>
              <div className="input-text" id="login_pass">
                <label id="lpassword" className="label-login" >Mot de passe</label>
                <input type="password" placeholder="Mot de Passe" name='password' onChange={handleChange} onKeyPress={(event) => handleKeyPress(event)} />
              </div>
              {/* <div className="container text-danger visually-hidden" id="login_error"><i className="fa fa-exclamation-triangle "></i> Erreur lors de la connexion</div> */}
              <button {...buttonAttribute} loading= "true" id="login_submit" className="login_submit" onClick={handleLogin} >Connexion</button>
              
            </div>
          </div>
          {message !== "" ? (<Message className="message_erreur" negative><Message.Header>{message}</Message.Header></Message>) : (<div></div>)}
      </div>
      </div>
      <div className="info">
        <div className="text-zone">
          <div className="AppInfoTextArea" dangerouslySetInnerHTML={{__html: sanitizeHtml(applicationText, sanitizeConf)}} />
        </div>
        <div>
          <div className="contact-interface" dangerouslySetInnerHTML={{__html: sanitizeHtml(infoAdress, sanitizeConf)}} />
        </div>
      </div>
    </div>
    </div>
  )
}
export default Login;