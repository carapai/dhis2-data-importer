import React, {Component} from 'react';
import {NotificationContainer} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import './App.css';
import {Provider} from "mobx-react";
import * as PropTypes from 'prop-types';
import IntegrationStore from './stores/IntegrationStore'

import D2UIApp from '@dhis2/d2-ui-app';
import Aggregate from "./components/aggregate";
import {withStyles} from "@material-ui/core/styles";
import styles from "./components/styles";
import HeaderBar from '@dhis2/d2-ui-header-bar';

class App extends Component {
    constructor(props) {
        super(props);
        const {d2} = props;
        d2.i18n.translations['id'] = 'Id';
        d2.i18n.translations['program_name'] = 'Program Name';
        d2.i18n.translations['last_run'] = 'Last Run';
        d2.i18n.translations['run'] = 'Run';
        d2.i18n.translations['schedule'] = 'Schedule';
        d2.i18n.translations['logs'] = 'Logs';
        d2.i18n.translations['delete'] = 'Delete';
        d2.i18n.translations['actions'] = 'Actions';
        d2.i18n.translations['display_name'] = 'Program Name';
        d2.i18n.translations['mapping_id'] = 'Mapping Id';
        d2.i18n.translations['name'] = 'Name';
        d2.i18n.translations['app_search_placeholder'] = 'Search Apps';
        d2.i18n.translations['manage_my_apps'] = 'Manage My Apps';
        d2.i18n.translations['settings'] = 'Settings';
        d2.i18n.translations['account'] = 'Account';
        d2.i18n.translations['profile'] = 'Profile';
        d2.i18n.translations['log_out'] = 'Logout';
        d2.i18n.translations['help'] = 'Help';
        d2.i18n.translations['about_dhis2'] = 'About DHIS2';
        d2.i18n.translations['aggregate_id'] = 'Id';

        this.state = {
            d2,
            baseUrl: props.baseUrl,
            open: true
        };
    }

    getChildContext() {
        return {d2: this.state.d2};
    }

    render() {
        const {classes} = this.props;
        return (
            <Provider IntegrationStore={IntegrationStore}>
                    <div>
                        <HeaderBar d2={this.state.d2}/>
                        <div className={classes.root}>
                            <main className={classes.content}>
                                <div className={classes.appBarSpacer}/>
                                <D2UIApp>
                                <Aggregate d2={this.state.d2}baseUrl={this.state.baseUrl}/>
                                </D2UIApp>
                            </main>
                        </div>
                        <NotificationContainer/>
                    </div>
            </Provider>
        );
    }
}

App.childContextTypes = {
    d2: PropTypes.object,
};

App.propTypes = {
    d2: PropTypes.object.isRequired,
    baseUrl: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired
};


export default withStyles(styles)(App);
