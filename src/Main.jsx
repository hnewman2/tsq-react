import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import FormUpload from './FormUpload';
import Login from './login';
import KeyPad from './keyPad';
import AdminHome from './AdminHome';
import VolInfo from './volInfo';
import ViewLogs from './viewLogs';
import AdminMessages from './AdminMessages';
import ViewStatus from './viewStatus';
import Inbox from './Inbox';
import RoutesPrintout from './RoutesPrintout';
import SearchRecipients from './searchRecipients';
import EditAllVolInfo from './editAllVolInfo';


const Main = (props) => (
    <main>
        <Switch>
            <Route exact path='/' render={() => (
                <Redirect to='/signIn' />
            )} />
            <Route path='/signIn' render={() => <Login admin={props.admin}
                setHeaderTitle={props.setHeaderTitle}
                resetAdmin={props.resetAdmin}
                userLoggedIn={props.userLoggedIn}
                logInUser={props.logInUser}
                logOutUser={props.logOutUser}
                adminLoggedIn={props.adminLoggedIn}
                logInAdmin={props.logInAdmin}
                logOutAdmin={props.logOutAdmin} />} />
            <Route path='/routesImport' render={() => <FormUpload setAdmin={props.setAdmin}
                setHeaderTitle={props.setHeaderTitle} />} />
            <Route path='/keyPad' render={() => <KeyPad setAdmin={props.setAdmin}
                resetAdmin={props.resetAdmin}
                setCurrentVolunteer={props.setCurrentVolunteer}
                setHeaderTitle={props.setHeaderTitle}
            />} />
            <Route path='/AdminHome' render={() => <AdminHome setAdmin={props.setAdmin}
                setHeaderTitle={props.setHeaderTitle} />} />
            <Route path='/volInfo' render={() => <VolInfo currentVolunteer={props.currentVolunteer}
                setCurrentVolunteer={props.setCurrentVolunteer}
                setAdmin={props.setAdmin}
                resetAdmin={props.resetAdmin}
                setHeaderTitle={props.setHeaderTitle} />} />
            <Route path='/viewLogs' render={() => <ViewLogs setAdmin={props.setAdmin}
                setHeaderTitle={props.setHeaderTitle} />} />
            <Route path='/messages' render={() => <AdminMessages setAdmin={props.setAdmin}
                setHeaderTitle={props.setHeaderTitle} />} />
            <Route path='/viewStatus' render={() => <ViewStatus setAdmin={props.setAdmin}
                setHeaderTitle={props.setHeaderTitle} />} />
            <Route path='/smsInbox' render={() => <Inbox setSelectedContact={props.setSelectedContact}
                setAdmin={props.setAdmin}
                setHeaderTitle={props.setHeaderTitle}
                resetUnread={props.resetUnread}
            />} />
            <Route path='/RoutesPrintout' render={() =>
                <RoutesPrintout setHeaderTitle={props.setHeaderTitle}
                    setAdmin={props.setAdmin} />} />
            <Route path='/SearchRecipients' render={() => <SearchRecipients
                setHeaderTitle={props.setHeaderTitle}
                setAdmin={props.setAdmin}
            />} />
            <Route path='/editAllVolInfo' render={()=><EditAllVolInfo
              setHeaderTitle={props.setHeaderTitle}
              setAdmin={props.setAdmin}
          />
            }/>


        </Switch>
    </main>
);
export default Main 
