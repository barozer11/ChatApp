// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import './App.css';
// import { Amplify } from 'aws-amplify';
// import { awsExports } from './aws-exports';
// import { Authenticator } from '@aws-amplify/ui-react';
// import '@aws-amplify/ui-react/styles.css';
// import { Auth } from "aws-amplify";
// import { ChatClient } from './chat-client';

// const URL = 'wss://7l8nohylm6.execute-api.us-west-2.amazonaws.com/production/';

// Amplify.configure({
//   Auth: {
//     region: awsExports.REGION,
//     userPoolId: awsExports.USER_POOL_ID,
//     userPoolWebClientId: awsExports.USER_POOL_APP_CLIENT_ID
//   }
// });


// function App() {
//   const [jwtToken, setJwtToken] = useState('');

//   useEffect(() => {
//     fetchJwtToken();
//   }, []);
  
//   const fetchJwtToken = async () => {
//     try {
//       const session = await Auth.currentSession();
//       const token = session.getIdToken().getJwtToken();
//       setJwtToken(token);
//     } catch (error) {
//       console.log('Error fetching JWT token:', error);
//     }
//   };

//   const socket = useRef(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [members, setMembers] = useState([]);
//   const [chatRows, setChatRows] = useState([]);

//   const onSocketOpen = useCallback(() => {
//     setIsConnected(true);
//     const name = prompt('Enter your name');
//     socket.current?.send(JSON.stringify({ action: 'setName', name }));
//   }, []);

//   const onSocketClose = useCallback(() => {
//     setMembers([]);
//     setIsConnected(false);
//     setChatRows([]);
//   }, []);

//   const onSocketMessage = useCallback((dataStr) => {
//     console.log(dataStr, "this is socket message");
//     const data = JSON.parse(dataStr);
//     if (data.members) {
//       setMembers(data.members);
//     } else if (data.publicMessage) {
//       setChatRows(oldArray => [...oldArray, <span><b>{data.publicMessage}</b></span>]);
//     } else if (data.privateMessage) {
//       alert(data.privateMessage);
//     } else if (data.systemMessage) {
//       setChatRows(oldArray => [...oldArray, <span><i>{data.systemMessage}</i></span>]);
//     }
//   }, []);

//   const onConnect = useCallback(() => {
//     if (socket.current?.readyState !== WebSocket.OPEN) {
//       socket.current = new WebSocket(URL);
//       socket.current.addEventListener('open', onSocketOpen);
//       socket.current.addEventListener('close', onSocketClose);
//       socket.current.addEventListener('message', (event) => {
//         onSocketMessage(event.data);
//       });
//     }
//   }, [onSocketOpen, onSocketClose, onSocketMessage]);

//   useEffect(() => {
//     return () => {
//       socket.current?.close();
//     };
//   }, []);

//   const onSendPrivateMessage = useCallback((to) => {
//     const message = prompt('Enter private message for ' + to);
//     console.log(message);
//     socket.current?.send(JSON.stringify({
//       action: 'sendPrivate',
//       message,
//       to,
//     }));
//   }, []);

//   const onSendPublicMessage = useCallback(() => {
//     const message = prompt('Enter public message');
//     console.log(message);

//     socket.current?.send(JSON.stringify({
//       action: 'sendPublic',
//       message,
//     }));
//   }, []);

//   const onDisconnect = useCallback(() => {
//     if (isConnected) {
//       socket.current?.close();
//     }
//   }, [isConnected]);
  
  
//   return (
//     <Authenticator initialState='signIn'
//     components={{
//       SignUp: {
//         FormFields() {

//           return (
//             <>
//               <Authenticator.SignUp.FormFields />

//               {/* Custom fields for given_name and family_name */}
//               <div><label>First name</label></div>
//               <input
//                 type="text"
//                 name="given_name"
//                 placeholder="Please enter your first name"
//               />
//               <div><label>Last name</label></div>
//               <input
//                 type="text"
//                 name="family_name"
//                 placeholder="Please enter your last name"
//               />
//               <div><label>Email</label></div>
//               <input
//                 type="text"
//                 name="email"
//                 placeholder="Please enter a valid email"
//               />


//             </>
//           );
//         },
//       },
//     }}
//     services={{
//       async validateCustomSignUp(formData) {
//         if (!formData.given_name) {
//           return {
//             given_name: 'First Name is required',
//           };
//         }
//         if (!formData.family_name) {
//           return {
//             family_name: 'Last Name is required',
//           };
//         }
//         if (!formData.email) {
//           return {
//             email: 'Email is required',
//           };
//         }
//       },
//     }}
//     >
//       {({ signOut, user}) => (
//         <div>Welcome {user.username}
//             <ChatClient
//     isConnected={isConnected}
//     members={members}
//     chatRows={chatRows}
//     onPublicMessage={onSendPublicMessage}
//     onPrivateMessage={onSendPrivateMessage}
//     onConnect={onConnect}
//     onDisconnect={onDisconnect}
//   />
//         <button onClick={signOut}>Sign out</button>
//         <h4>Your JWT token:</h4>
//         {jwtToken}
//         </div>
//       )}
//     </Authenticator>




// );
// }

// export default App;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Amplify } from 'aws-amplify';
import { awsExports } from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Auth } from "aws-amplify";
import { jwtDecode } from "jwt-decode";
import { ChatClient } from './chat-client';

const URL = 'wss://7l8nohylm6.execute-api.us-west-2.amazonaws.com/production/';

Amplify.configure({
  Auth: {
    region: awsExports.REGION,
    userPoolId: awsExports.USER_POOL_ID,
    userPoolWebClientId: awsExports.USER_POOL_APP_CLIENT_ID
  }
});

function App() {
  const [jwtToken, setJwtToken] = useState('');
  const [givenName, setGivenName] = useState('');  // State to store given name
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [chatRows, setChatRows] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    fetchJwtToken();
  }, []);
  

  const fetchJwtToken = async () => {
    try {
      // Get the current authenticated session
      const session = await Auth.currentSession();
      
      // Extract the JWT token from the session
      const token = session.getIdToken().getJwtToken();
      setJwtToken(token);
  
      // Decode the JWT token
      const decodedToken = jwtDecode(token);
      console.log('Decoded JWT Token:', decodedToken);  // Log decoded token for debugging
  
      // Extract and set the given name from the decoded token
      if (decodedToken.given_name) {
        setGivenName(decodedToken.given_name);
      } else {
        console.warn('Given name not found in the token payload.');
      }
    } catch (error) {
      // Log any errors encountered during the process
      console.error('Error fetching JWT token:', error);
    }
  };

  const onSocketOpen = useCallback(() => {
    setIsConnected(true);
    const name = givenName;   // Use given name 
    socket.current?.send(JSON.stringify({ action: 'setName', name }));
  }, [givenName]);

  const onSocketClose = useCallback(() => {
    setMembers([]);
    setIsConnected(false);
    setChatRows([]);
  }, []);

  const onSocketMessage = useCallback((dataStr) => {
    console.log(dataStr, "this is socket message");
    const data = JSON.parse(dataStr);
    if (data.members) {
      setMembers(data.members);
    } else if (data.publicMessage) {
      setChatRows(oldArray => [...oldArray, <span><b>{data.publicMessage}</b></span>]);
    } else if (data.privateMessage) {
      alert(data.privateMessage);
    } else if (data.systemMessage) {
      setChatRows(oldArray => [...oldArray, <span><i>{data.systemMessage}</i></span>]);
    }
  }, []);

  const onConnect = useCallback(() => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      socket.current = new WebSocket(URL);
      socket.current.addEventListener('open', onSocketOpen);
      socket.current.addEventListener('close', onSocketClose);
      socket.current.addEventListener('message', (event) => {
        onSocketMessage(event.data);
      });
    }
  }, [onSocketOpen, onSocketClose, onSocketMessage]);

  const onSendPrivateMessage = useCallback((to) => {
    const message = prompt('Enter private message for ' + to);
    console.log(message);
    socket.current?.send(JSON.stringify({
      action: 'sendPrivate',
      message,
      to,
    }));
  }, []);

  const onSendPublicMessage = useCallback(() => {
    const message = prompt('Enter public message');
    console.log(message);

    socket.current?.send(JSON.stringify({
      action: 'sendPublic',
      message,
    }));
  }, []);

  const onDisconnect = useCallback(() => {
    if (isConnected) {
      socket.current?.close();
    }
  }, [isConnected]);

  return (
    <Authenticator
      initialState='signIn'
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <Authenticator.SignUp.FormFields />
                <div><label>First name</label></div>
                <input
                  type="text"
                  name="given_name"
                  placeholder="Please enter your first name"
                />
                <div><label>Last name</label></div>
                <input
                  type="text"
                  name="family_name"
                  placeholder="Please enter your last name"
                />
                <div><label>Email</label></div>
                <input
                  type="text"
                  name="email"
                  placeholder="Please enter a valid email"
                />
              </>
            );
          },
        },
      }}
      services={{
        async validateCustomSignUp(formData) {
          if (!formData.given_name) {
            return { given_name: 'First Name is required' };
          }
          if (!formData.family_name) {
            return { family_name: 'Last Name is required' };
          }
          if (!formData.email) {
            return { email: 'Email is required' };
          }
        },
      }}
    >
      {({ signOut, user }) => (
        <div>
          Welcome {user.username}
          {/* Open WebSocket connection on successful sign-in */}
          {onConnect()}

          <ChatClient
            isConnected={isConnected}
            members={members}
            chatRows={chatRows}
            onPublicMessage={onSendPublicMessage}
            onPrivateMessage={onSendPrivateMessage}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            signOut = {signOut}
          />

          {/* Close WebSocket connection on sign-out */}
          <button onClick={() => { onDisconnect(); signOut(); }}>
            Sign out
          </button>

          <h4>Your JWT token:</h4>
          {jwtToken}
        </div>
      )}
    </Authenticator>
  );
}

export default App;

