import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
// import {Tab, Tabs} from '@dhis2/d2-ui-core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Badge from '@material-ui/core/Badge';
import {withStyles} from "@material-ui/core/styles";

import {inject, observer} from "mobx-react";
import TablePagination from "@material-ui/core/TablePagination";
import Typography from "@material-ui/core/Typography";
import * as PropTypes from "prop-types";
import Step6 from "./step6";

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit * 2,
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`,
    },
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    }
});

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};


@inject('IntegrationStore')
@observer
class Summary extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    state = {
        value: 0,
    };

    handleChange = (event, value) => {
        this.setState({value});
    };

    render() {
        const {value} = this.state;
        const {classes, displayResponse} = this.props;
        const {program} = this.integrationStore;
        const {
            newTrackedEntityInstances,
            newEnrollments,
            newEvents,
            trackedEntityInstancesUpdate,
            eventsUpdate,
            conflicts,
            duplicates,
            errors
        } = program.processed;
        return (
            <div className={classes.root}>
                <AppBar position="static" color="primary">
                    <Tabs
                        value={value}
                        onChange={this.handleChange}
                        variant="scrollable"
                        scrollButtons="on"
                        indicatorColor="secondary"
                        textColor="inherit"
                    >
                        <Tab value={0} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={newTrackedEntityInstances.length}>New
                            Entities</Badge>}/>
                        <Tab value={1} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={newEnrollments.length}>New Enrollments</Badge>}/>
                        <Tab value={2} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={newEvents.length}>New Events</Badge>}/>
                        <Tab value={3} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={trackedEntityInstancesUpdate.length}>Entity
                            Updates</Badge>}/>
                        <Tab value={4} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={eventsUpdate.length}>Event Updates</Badge>}/>
                        <Tab value={5} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={conflicts.length}>Conflicts</Badge>}/>
                        <Tab value={6} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={errors.length}>Errors</Badge>}/>
                        <Tab value={7} label={<Badge color="secondary" className={classes.padding}
                                                     badgeContent={duplicates.length}>Duplicates</Badge>}/>
                        {displayResponse ? <Tab value={8} label="Response"/> : null}
                    </Tabs>
                </AppBar>
                {value === 0 && <TabContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Row</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {program.currentNewInstances.map((s, k) => {
                                return (
                                    <TableRow key={k}>
                                        <TableCell>
                                            {JSON.stringify(s, null, 2)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={newTrackedEntityInstances.length}
                        rowsPerPage={program.paging['nte']['rowsPerPage']}
                        page={program.paging['nte']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('nte')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('nte')}
                    />
                </TabContainer>}
                {value === 1 && <TabContainer><Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Row</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {program.currentNewEnrollments.map((s, k) => {
                            return (
                                <TableRow key={k}>
                                    <TableCell>
                                        {JSON.stringify(s, null, 2)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                    <TablePagination
                        component="div"
                        count={newEnrollments.length}
                        rowsPerPage={program.paging['nel']['rowsPerPage']}
                        page={program.paging['nel']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('nel')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('nel')}
                    /></TabContainer>}
                {value === 2 && <TabContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Row</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {program.currentNewEvents.map((s, k) => {
                                return (
                                    <TableRow key={k}>
                                        <TableCell>
                                            {JSON.stringify(s, null, 2)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={newEvents.length}
                        rowsPerPage={program.paging['nev']['rowsPerPage']}
                        page={program.paging['nev']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('nev')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('nev')}
                    /></TabContainer>}
                {value === 3 && <TabContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Row</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {program.currentInstanceUpdates.map((s, k) => {
                                return (
                                    <TableRow key={k}>
                                        <TableCell>
                                            {JSON.stringify(s, null, 2)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={trackedEntityInstancesUpdate.length}
                        rowsPerPage={program.paging['teu']['rowsPerPage']}
                        page={program.paging['teu']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('teu')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('teu')}
                    /></TabContainer>}
                {value === 4 && <div><Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Row</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {program.currentEventUpdates.map((s, k) => {
                            return (
                                <TableRow key={k}>
                                    <TableCell>
                                        {JSON.stringify(s, null, 2)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                    <TablePagination
                        component="div"
                        count={eventsUpdate.length}
                        rowsPerPage={program.paging['evu']['rowsPerPage']}
                        page={program.paging['evu']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('evu')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('evu')}
                    /></div>}
                {value === 5 && <TabContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Row</TableCell>
                                <TableCell>Column</TableCell>
                                <TableCell>Conflict</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {program.currentConflicts.map((s, i) => {
                                return (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {s.row}
                                        </TableCell>
                                        <TableCell>
                                            {s.column}
                                        </TableCell>
                                        <TableCell>
                                            {s.error}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={conflicts.length}
                        rowsPerPage={program.paging['con']['rowsPerPage']}
                        page={program.paging['con']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('con')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('con')}
                    />
                </TabContainer>}
                {value === 6 && <TabContainer>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Row</TableCell>
                                <TableCell>Column</TableCell>
                                <TableCell>Error</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {program.currentErrors.map((s, i) => {
                                return (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {s.row}
                                        </TableCell>
                                        <TableCell>
                                            {s.column}
                                        </TableCell>
                                        <TableCell>
                                            {s.error}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={errors.length}
                        rowsPerPage={program.paging['err']['rowsPerPage']}
                        page={program.paging['err']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('err')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('err')}
                    />
                </TabContainer>}
                {value === 7 && <TabContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Duplicated</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {program.currentDuplicates.map((s, k) => {
                                return (
                                    <TableRow key={k}>
                                        <TableCell>
                                            {s}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={duplicates.length}
                        rowsPerPage={program.paging['dup']['rowsPerPage']}
                        page={program.paging['dup']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={program.handleChangeElementPage('dup')}
                        onChangeRowsPerPage={program.handleChangeElementRowsPerPage('dup')}
                    />
                </TabContainer>}
                {value === 8 && displayResponse && <div><br/><br/><Step6/></div>}
            </div>
        );
    }
}

Summary.propTypes = {
    displayResponse: PropTypes.bool,
};

export default withStyles(styles)(Summary);
