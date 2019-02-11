import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import {Tab, Tabs} from '@dhis2/d2-ui-core';
import Badge from '@material-ui/core/Badge';
import {withStyles} from "@material-ui/core/styles";

import {inject, observer} from "mobx-react";
import TablePagination from "@material-ui/core/TablePagination";

const styles = theme => ({
    margin: {
        margin: theme.spacing.unit * 2,
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`,
    },
});

@inject('IntegrationStore')
@observer
class Summary extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {classes} = this.props;
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
            <div>
                <Tabs>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={newTrackedEntityInstances.length}>New Enrollments</Badge>}>
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
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={newEnrollments.length}>New Enrollments</Badge>}>
                        <Table>
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
                        />
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={newEvents.length}>New Events</Badge>}>
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
                        />
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={trackedEntityInstancesUpdate.length}>Entity
                        Updates</Badge>}>
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
                        />
                    </Tab>

                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={eventsUpdate.length}>Event Updates</Badge>}>
                        <Table>
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
                        />
                    </Tab>

                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={conflicts.length}>Conflicts</Badge>}>
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
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={errors.length}>Errors</Badge>}>
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
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={duplicates.length}>Duplicates</Badge>}>
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
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default withStyles(styles)(Summary);
