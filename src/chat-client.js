import React from 'react';
import { Button, ListItemText, CssBaseline, Container, Grid, List, ListItem, Paper } from '@mui/material';

export const ChatClient = ({ isConnected, members, chatRows, onPublicMessage, onPrivateMessage, onConnect, onDisconnect }) => {
  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: '#f4ede3',
      display: 'flex',
      alignItems: 'center',
    }}>
      <CssBaseline />
      <Container maxWidth="lg" style={{ height: '90%' }}>
        <Grid container style={{ height: '100%' }}>
          <Grid item xs={2} style={{ backgroundColor: '#3e103f', color: 'white' }}>
            <List component="nav">
              {members.map(item =>
                <ListItem key={item} onClick={() => { onPrivateMessage(item); }} button>
                  <ListItemText style={{ fontWeight: 800 }} primary={item} />
                </ListItem>
              )}
            </List>
          </Grid>
          <Grid style={{ position: 'relative' }} item container direction="column" xs={10} >
            <Paper style={{ flex: 1 }}>
              <Grid item container style={{ height: '100%' }} direction="column">
                <Grid item container style={{ flex: 1 }}>
                  <ul style={{
                    paddingTop: 20,
                    paddingLeft: 44,
                    listStyleType: 'none',
                  }}>
                    {chatRows.map((item, i) =>
                      <li key={i} style={{ paddingBottom: 9 }}>{item}</li>
                    )}
                  </ul>
                </Grid>
                <Grid item style={{ margin: 10 }}>
                  {isConnected && <Button style={{ marginRight: 7 }} variant="outlined" size="small" disableElevation onClick={onPublicMessage}>Send Public Message</Button>}
                  {/* {isConnected && <Button variant="outlined" size="small" disableElevation onClick={onDisconnect , signOu}>Sign Out</Button>} */}
                  {/* {!isConnected && <Button variant="outlined" size="small" disableElevation onClick={onConnect}>Connect</Button>} */}
                </Grid>
              </Grid>
              <div style={{
                position: 'absolute',
                right: 9,
                top: 8,
                width: 12,
                height: 12,
                backgroundColor: isConnected ? '#00da00' : '#e2e2e2',
                borderRadius: 50,
              }} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div >
  );
};

export default ChatClient;

