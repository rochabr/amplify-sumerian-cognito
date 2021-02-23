import React, { useState, useEffect } from 'react'
import logo from './logo.svg';
import './App.css';

import { Auth, Hub } from 'aws-amplify';

const initialFormState = {
  username: '', password: '', email: '', authCode: '', formType: 'signUp'
}

function App() {
  const [formState, updateFormState] = useState(initialFormState)
  const [user, updateUser] = useState(null)
  useEffect(() => {
    checkUser()
    setAuthListener()
  }
, [])

async function setAuthListener(){
  Hub.listen('auth', (data) => {
    switch (data.payload.event) {
      case 'signOut':
          updateFormState(() => ({ ...formState, formType: "signUp" }))
          break;
        default:
          break;
    }
  });
}
async function checkUser(){
  try{
    const user = await Auth.currentAuthenticatedUser()
    console.log('user: ', user)
    updateUser(user)
    updateFormState(() => ({ ...formState, formType: "signedIn" }))
  } catch (err){
    //updateUser(null)
  }
}
  function onChange(e){
    e.persist()
    updateFormState(() => ({ ...formState, [e.target.name]: e.target.value }))
  }
  const { formType } = formState
  async function signUp(){
    const {username, email, password } = formState
    await Auth.signUp({ username, password, attributes: { email }})
    updateFormState(() => ({ ...formState, formType: "confirmSignUp" }))
  }
  async function confirmSignUp(){
    const {username, authCode } = formState
    await Auth.confirmSignUp(username, authCode)
    updateFormState(() => ({ ...formState, formType: "signIn" }))
  }
  async function signIn(){
    const {username, password } = formState
    await Auth.signIn(username, password)
    updateFormState(() => ({ ...formState, formType: "signedIn" }))
  }

  return (
    <div className="App">
      {
        formType === 'signUp' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username" /><br></br>
            <input name="password" type="password" onChange={onChange} placeholder="password" /><br></br>
            <input name="email" onChange={onChange} placeholder="email" /><br></br>
            <button onClick={signUp}>Sign Up</button>
            <br></br>
            <br></br>
            <h5>Already have an account?</h5>
            <button onClick={() => updateFormState(() => ({
              ...formState, formType: "signIn"
            }))}>Sign In</button>
          </div>
        )
      }
      {
        formType === 'confirmSignUp' && (
          <div>
            <input name="authCode" onChange={onChange} placeholder="Confirmation code" /><br></br>
            <button onClick={confirmSignUp}>Confirm</button>
          </div>
        )
      }
      {
        formType === 'signIn' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username" /><br></br>
            <input name="password" type="password" onChange={onChange} placeholder="password" /><br></br>
            <button onClick={signIn}>Sign In</button>
          </div>
        )
      }
      {
        formType === 'signedIn' && (
          <div>
            <h1>Hello world, welcome user.</h1>
            <button onClick={
              () => Auth.signOut()
            }>Sign Out</button>
          </div>
        )
      }
    </div>
  );
}

export default App;
