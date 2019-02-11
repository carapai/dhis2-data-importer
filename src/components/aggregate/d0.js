import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import DHIS2Table from "@dhis2/d2-ui-table";


import red from '@material-ui/core/colors/red';

import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TablePagination from "@material-ui/core/TablePagination";

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Dialog from '@material-ui/core/Dialog';
import Dropzone from 'react-dropzone';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import {Tab, Tabs} from "@dhis2/d2-ui-core";
import Badge from "@material-ui/core/Badge";
import Table from "@material-ui/core/Table";
import _ from 'lodash';
import {Delete, ArrowUpward} from "@material-ui/icons";


const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing.unit,
        top: theme.spacing.unit,
        color: theme.palette.grey[500],
    },
}))(props => {
    const {children, classes, onClose} = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing.unit * 2,
    },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing.unit,
    },
}))(MuiDialogActions);

const styles = theme => ({
    icon: {
        margin: theme.spacing.unit * 2
    },
    iconHover: {
        margin: theme.spacing.unit * 2,
        '&:hover': {
            color: red[800]
        }
    }
});


@inject('IntegrationStore')
@observer
class D0 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    componentDidMount() {
        this.integrationStore.checkAggregateDataStore();
    }

    render() {
        const {classes} = this.props;
        return <div>
            <DHIS2Table
                columns={['aggregateId', 'name']}
                rows={this.integrationStore.aggregates}
                contextMenuActions={this.integrationStore.tableAggActions}
                contextMenuIcons={
                    {

                        delete: <Delete/>,
                        upload: <ArrowUpward/>
                    }
                }
                primaryAction={this.integrationStore.useSavedAggregate}
            />

            <Dialog
                fullWidth={true}
                maxWidth={'lg'}
                open={this.integrationStore.uploadData}
                onClose={this.integrationStore.closeUploadDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title" onClose={this.integrationStore.closeUploadDialog}>
                    {"Upload data"}
                </DialogTitle>
                <DialogContent>
                    <table width="100%">
                        <tbody>
                        <tr>
                            <td valign="top" width="100%" align="center">
                                <section>
                                    <div className="dropzone">
                                        <Dropzone accept=".csv, .xls, .xlsx"
                                                  onDrop={this.integrationStore.dataSet.onDrop}>
                                            <p align="center">Drop files here</p>
                                            <p align="center">
                                                <Icon
                                                    className={classes.icon}
                                                    color="primary"
                                                    style={{
                                                        fontSize: 48
                                                    }}>
                                                    add_circle
                                                </Icon>
                                            </p>
                                            <p
                                                align="center"
                                                style={{
                                                    color: 'red'
                                                }}>{this.integrationStore.dataSet.uploadMessage}</p>
                                        </Dropzone>
                                    </div>
                                </section>
                            </td>
                        </tr>
                        <tr>
                            <td valign="top" align="right" width="100%">
                                <Tabs>
                                    {this.integrationStore.dataSet.processed ?
                                        <Tab label={<Badge className={classes.padding} color="secondary"
                                                           badgeContent={this.integrationStore.dataSet.processed.length}>Data</Badge>}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Data Element</TableCell>
                                                        <TableCell>CategoryOption</TableCell>
                                                        <TableCell>Attribute</TableCell>
                                                        <TableCell>Period</TableCell>
                                                        <TableCell>Organisation</TableCell>
                                                        <TableCell>Value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {this.integrationStore.dataSet.currentDataValues.map((s, k) => {
                                                        return (
                                                            <TableRow key={k}>
                                                                <TableCell>
                                                                    {s.dataElement}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {s.categoryOptionCombo}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {s.attributeOptionCombo}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {s.period}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {s.orgUnit}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {s.value}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                            <TablePagination
                                                component="div"
                                                count={this.integrationStore.dataSet.processed.length}
                                                rowsPerPage={this.integrationStore.dataSet.rowsPerPage}
                                                page={this.integrationStore.dataSet.page}
                                                backIconButtonProps={{
                                                    'aria-label': 'Previous Page',
                                                }}
                                                nextIconButtonProps={{
                                                    'aria-label': 'Next Page',
                                                }}
                                                onChangePage={this.integrationStore.dataSet.handleChangePage}
                                                onChangeRowsPerPage={this.integrationStore.dataSet.handleChangeRowsPerPage}
                                            />
                                        </Tab> : <Tab>Nothing</Tab>}
                                </Tabs>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.integrationStore.closeUploadDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={_.keys(this.integrationStore.dataSet.data).length === 0}
                        onClick={this.integrationStore.dataSet.create}>
                        Insert
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    }

}

export default withStyles(styles)(D0);
