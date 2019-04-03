import React, {Component} from 'react';
import {HashRouter as Router, Route} from "react-router-dom";
import {NotificationContainer} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import './App.css';
import {Provider} from "mobx-react";
import PropTypes from 'prop-types';
import IntegrationStore from './stores/IntegrationStore'
import Program from './components/program';

import D2UIApp from '@dhis2/d2-ui-app';
import Aggregate from "./components/aggregate";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import List from "@material-ui/core/List";
import {mainListItems} from "./components/listItems";
import classNames from "classnames";
import {withStyles} from "@material-ui/core/styles";
import styles from "./components/styles";
import HeaderBar from '@dhis2/d2-ui-header-bar';

class App extends Component {
    constructor(props) {
        super(props);
        const {d2} = props;
        d2.i18n.translations['id'] = 'Id';
        d2.i18n.translations['program_name'] = 'Program Name';
        d2.i18n.translations['program_type'] = 'Program Type';
        d2.i18n.translations['last_updated'] = 'Last Updated';
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
        d2.i18n.translations['upload'] = 'Upload Excel/CSV';
        // d2.i18n.translations['import'] = 'Import';
        d2.i18n.translations['download'] = 'Import from API';
        d2.i18n.translations['template'] = 'Download Template';
        d2.i18n.translations['year'] = 'Year';
        d2.i18n.translations['sixMonth'] = 'Six Month';
        d2.i18n.translations['jan-jun'] = 'Jan - Jun';
        d2.i18n.translations['jul-dec'] = 'Jul - Dec';

        d2.i18n.translations['assign_all'] = 'Assign all';
        d2.i18n.translations['hidden_by_filters'] = 'Hidden by filters';
        d2.i18n.translations['day'] = 'Day';

        d2.i18n.translations['year'] = 'Year';
        d2.i18n.translations['week'] = 'Week';
        d2.i18n.translations['day'] = 'Day';
        d2.i18n.translations['month'] = 'Month';
        d2.i18n.translations['quarter'] = 'Quarter';
        d2.i18n.translations['jan'] = 'January';
        d2.i18n.translations['feb'] = 'February';
        d2.i18n.translations['mar'] = 'March';
        d2.i18n.translations['apr'] = 'April';
        d2.i18n.translations['may'] = 'May';
        d2.i18n.translations['jun'] = 'June';
        d2.i18n.translations['jul'] = 'July';
        d2.i18n.translations['aug'] = 'August';
        d2.i18n.translations['sep'] = 'September';
        d2.i18n.translations['oct'] = 'October';
        d2.i18n.translations['nov'] = 'November';
        d2.i18n.translations['dec'] = 'December';
        d2.i18n.translations['Q1'] = 'Q1';
        d2.i18n.translations['Q2'] = 'Q2';
        d2.i18n.translations['Q3'] = 'Q3';
        d2.i18n.translations['Q4'] = 'Q4';

        this.state = {
            d2,
            baseUrl: props.baseUrl,
            open: true
        };
    }

    getChildContext() {
        return {d2: this.state.d2};
    }

    handleDrawerOpen = () => {
        this.setState({open: true});
    };

    handleDrawerClose = () => {
        const open = !this.state.open;
        this.setState({open});
    };

    getIcon = open => {
        if (open) {
            return <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon/>
            </IconButton>
        } else {
            return <IconButton onClick={this.handleDrawerClose}>
                <ChevronRightIcon/>
            </IconButton>
        }
    };

    render() {
        const {classes} = this.props;
        return (
            <Provider IntegrationStore={IntegrationStore}>
                <Router>
                    <div>
                        <HeaderBar d2={this.state.d2}/>
                        <div className={classes.root}>
                            <Drawer
                                variant="permanent"
                                classes={{
                                    paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose)
                                }}
                                open={this.state.open}
                            >
                                <div className={classes.toolbarIcon}>
                                    {this.getIcon(this.state.open)}
                                </div>
                                {/*<Divider/>*/}
                                <List>{mainListItems}</List>
                                {/*<Divider/>
                                <List>{secondaryListItems}</List>*/}
                            </Drawer>
                            <main className={classes.content}>
                                <div className={classes.appBarSpacer}/>
                                <D2UIApp>
                                    <Route
                                        exact
                                        path='/'
                                        component={() => <Program d2={this.state.d2}
                                                                  baseUrl={this.state.baseUrl}/>}/>
                                    <Route
                                        path='/aggregates'
                                        component={() => <Aggregate d2={this.state.d2}/>}/>
                                </D2UIApp>
                            </main>
                        </div>
                        <NotificationContainer/>
                    </div>
                </Router>
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
