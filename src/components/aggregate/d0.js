import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import DHIS2Table from "@dhis2/d2-ui-table";
import Select from 'react-select';
import red from '@material-ui/core/colors/red';

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
import {InputField} from "@dhis2/d2-ui-core";
import _ from 'lodash';
import {Delete, ArrowUpward, ArrowDownward} from "@material-ui/icons";
import Params from "./Params";
import CircularProgress from "@material-ui/core/CircularProgress";
import Summary from "./Summary";
import Checkbox from "@material-ui/core/Checkbox";
import Progress from "../procgress";


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
                        upload: <ArrowUpward/>,
                        download: <ArrowDownward/>
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
                            <td valign="top" width="100%">

                                <table width="100%">
                                    <tbody>
                                    <tr>
                                        <td width="20%" valign="top">
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
                                        </td>
                                        <td width="80%" valign="top">
                                            <Select
                                                placeholder="Select sheet"
                                                value={this.integrationStore.dataSet.selectedSheet}
                                                options={this.integrationStore.dataSet.sheets}
                                                onChange={this.integrationStore.dataSet.setSelectedSheet}
                                            />
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td valign="top" align="right" width="100%">
                                <Summary/>
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


            <Dialog
                fullWidth={true}
                maxWidth={'lg'}
                open={this.integrationStore.importData}
                onClose={this.integrationStore.closeImportDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title"
                             onClose={this.integrationStore.closeImportDialog}>{"Import data from API"}</DialogTitle>
                <DialogContent>
                    <table width="100%">
                        <tbody>
                        <tr>
                            <td width="50%">
                                <InputField
                                    label="URL"
                                    type="text"
                                    fullWidth
                                    value={this.integrationStore.dataSet.url}
                                    onChange={(value) => this.integrationStore.dataSet.handelURLChange(value)}/>
                            </td>
                            <td width="50%">
                                <InputField
                                    label="Response key"
                                    type="text"
                                    fullWidth
                                    value={this.integrationStore.dataSet.responseKey}
                                    onChange={(value) => this.integrationStore.dataSet.setResponseKey(value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <InputField
                                    label="Username"
                                    type="text"
                                    fullWidth
                                    value={this.integrationStore.dataSet.username}
                                    onChange={(value) => this.integrationStore.dataSet.setUsername(value)}/>
                            </td>
                            <td width="50%">
                                <InputField
                                    label="Password"
                                    type="text"
                                    fullWidth
                                    value={this.integrationStore.dataSet.password}
                                    onChange={(value) => this.integrationStore.dataSet.setPassword(value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <Checkbox checked={this.integrationStore.dataSet.isDhis2}
                                          onChange={this.integrationStore.dataSet.onCheckIsDhis2}/> From DHIS2
                            </td>

                            <td width="50%">
                                {this.integrationStore.dataSet.isDhis2 ? <Select
                                    placeholder="Identifier scheme"
                                    value={this.integrationStore.dataSet.dhis2DataSet}
                                    options={this.integrationStore.dataSet.processedDhis2DataSets}
                                    onChange={this.integrationStore.dataSet.setDhis2DataSet}
                                /> : null}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <br/>
                    <Params/>
                    <br/>
                    <Summary/>
                </DialogContent>
                <DialogActions>

                    <Button onClick={this.integrationStore.closeUploadDialog} color="secondary">
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={!this.integrationStore.dataSet.url || this.integrationStore.dataSet.isDhis2}
                        onClick={this.integrationStore.dataSet.pullData}>
                        {this.integrationStore.dataSet.pulling ?
                            <CircularProgress size={24}
                                              thickness={4} color="secondary"/> : 'Pull Data'}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!((this.integrationStore.dataSet.isDhis2 && this.integrationStore.dataSet.dhis2DataSet) || _.keys(this.integrationStore.dataSet.data).length > 0)}
                        // disabled={this.integrationStore.disableNextAggregate}
                        onClick={this.integrationStore.dataSet.create}>
                        {this.integrationStore.dataSet.displayProgress ?
                            <CircularProgress size={24}
                                              thickness={4} color="secondary"/> : 'Insert'}
                    </Button>

                </DialogActions>
            </Dialog>
            {this.integrationStore.dataSet.dialogOpen && this.integrationStore.dataSet.closeDialog ?
                <Progress open={this.integrationStore.dataSet.dialogOpen}
                          onClose={this.integrationStore.dataSet.closeDialog}/> : null}
        </div>
    }

}

export default withStyles(styles)(D0);
