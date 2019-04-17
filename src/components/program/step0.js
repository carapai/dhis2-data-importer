import React from "react";
import Table from '@dhis2/d2-ui-table';
import {withStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Icon from '@material-ui/core/Icon';
import Dropzone from 'react-dropzone';
import red from '@material-ui/core/colors/red';
import {InputField} from "@dhis2/d2-ui-core";

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Summary from "./Summary";
import {Delete, ArrowDownward, ArrowUpward, CloudDownload} from "@material-ui/icons";
import Params from "./Params";
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from 'react-select';
import Progress from "../progress";

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
class Step0 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    componentDidMount() {
        this.integrationStore.checkDataStore();
    }

    render() {
        const {classes} = this.props;
        return <div>
            {this.integrationStore.program.pulling ? <LinearProgress color="secondary"/> : ''}

            {this.integrationStore.mappings.length > 0 ?
                <Table
                    columns={['mappingId', 'mappingName', 'mappingDescription']}
                    rows={this.integrationStore.mappings}
                    contextMenuActions={this.integrationStore.tableActions}
                    contextMenuIcons={
                        {
                            delete: <Delete/>,
                            upload: <ArrowUpward/>,
                            download: <ArrowDownward/>,
                            template: <CloudDownload/>
                        }
                    }
                    primaryAction={this.integrationStore.useSaved}/> :
                <p style={{textAlign: 'center', fontSize: 15}}>There are no items</p>}


            <Dialog
                fullWidth={true}
                maxWidth={'lg'}
                open={this.integrationStore.uploadData}
                onClose={this.integrationStore.closeUploadDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title"
                             onClose={this.integrationStore.closeUploadDialog}>{"Upload Excel/CSV"}</DialogTitle>
                <DialogContent>
                    <table width="100%">
                        <tbody>
                        <tr>
                            <td width="20%" valign="top">
                                <div className="dropzone">
                                    <Dropzone accept=".csv, .xls, .xlsx"
                                              onDrop={this.integrationStore.program.onDrop}>
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
                                            }}>{this.integrationStore.program.uploadMessage}</p>

                                        {this.integrationStore.program.fetchingEntities === 1 && this.integrationStore.program.isTracker ?
                                            <CircularProgress color="secondary"/> : ''}
                                    </Dropzone>
                                </div>
                            </td>
                            <td width="80%" valign="top">
                                <Select
                                    placeholder="Select sheet"
                                    value={this.integrationStore.program.selectedSheet}
                                    options={this.integrationStore.program.sheets}
                                    onChange={this.integrationStore.program.setSelectedSheet}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <br/>
                    <br/>
                    <Summary displayResponse={true}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.integrationStore.closeUploadDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={this.integrationStore.program.disableCreate || this.integrationStore.program.fetchingEntities === 1}
                        onClick={this.integrationStore.program.create}>
                        {this.integrationStore.program.displayProgress ?
                            <CircularProgress size={24} thickness={4} color="secondary"/> : 'Import'}
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
                                    value={this.integrationStore.program.url}
                                    onChange={(value) => this.integrationStore.program.handelURLChange(value)}/>
                            </td>
                            <td width="50%">
                                <InputField
                                    label="Response key"
                                    type="text"
                                    fullWidth
                                    value={this.integrationStore.program.responseKey}
                                    onChange={(value) => this.integrationStore.program.setResponseKey(value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <InputField
                                    label="Username"
                                    type="text"
                                    fullWidth
                                    value={this.integrationStore.program.username}
                                    onChange={(value) => this.integrationStore.program.setUsername(value)}/>
                            </td>
                            <td width="50%">
                                <InputField
                                    label="Password"
                                    type="text"
                                    fullWidth
                                    value={this.integrationStore.program.password}
                                    onChange={(value) => this.integrationStore.program.setPassword(value)}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <br/>
                    <Params/>
                    <br/>
                    <Summary displayResponse={true}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.integrationStore.closeImportDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!this.integrationStore.program.url}
                        onClick={this.integrationStore.program.pullData}>
                        Pull Data
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        disabled={this.integrationStore.program.disableCreate || this.integrationStore.program.fetchingEntities === 1}
                        onClick={this.integrationStore.program.create}>
                        {this.integrationStore.program.displayProgress ?
                            <CircularProgress size={24} thickness={4} color="secondary"/> : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Progress open={this.integrationStore.dialogOpen}
                      onClose={this.integrationStore.closeDialog}/>
        </div>
    }
}

export default withStyles(styles)(Step0);
