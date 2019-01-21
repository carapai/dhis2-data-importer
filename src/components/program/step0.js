import React from "react";
import Table from '@dhis2/d2-ui-table';
import {withStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
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
    const { children, classes, onClose } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
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
        this
            .integrationStore
            .checkDataStore();
    }

    render() {
        const {classes} = this.props;
        return <div>
            <Table
                columns={['mappingId', 'displayName', 'lastRun']}
                rows={this.integrationStore.mappings}
                contextMenuActions={this.integrationStore.tableActions}
                primaryAction={this.integrationStore.useSaved}/>

            <Dialog
                fullWidth={true}
                maxWidth={'lg'}
                open={this.integrationStore.uploadData}
                onClose={this.integrationStore.closeUploadDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title" onClose={this.integrationStore.closeUploadDialog}>{"Upload data"}</DialogTitle>
                <DialogContent>
                    <table width="100%" cellPadding="5">
                        <tbody>
                            <tr>
                                <td colSpan="2">Upload file to import</td>
                            </tr>
                            <tr>
                                <td valign="top">
                                    <section>
                                        <div className="dropzone">
                                            <Dropzone accept=".csv, .xls, .xlsx" onDrop={this.integrationStore.program.onDrop}>
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
                                            </Dropzone>
                                        </div>
                                    </section>
                                </td>
                                <td valign="top" align="right">
                                {JSON.stringify(this.integrationStore.program.processed)}
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
                        disabled={!this.integrationStore.program.data || this.integrationStore.program.data.length === 0}
                        onClick={this.integrationStore.program.create}>
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
                <DialogTitle id="alert-dialog-title" onClose={this.integrationStore.closeImportDialog}>{"Import data"}</DialogTitle>
                <DialogContent>
                    <table width="100%" cellPadding="5">
                        <tbody>
                            <tr>
                                <td valign="top" align="right">
                                    <InputField
                                        label="URL"
                                        type="text"
                                        fullWidth
                                        value={this.integrationStore.program.url}
                                        onChange={(value) => this.integrationStore.program.handelURLChange(value)}/>
                                    <InputField
                                        label="Date start filter"
                                        type="text"
                                        fullWidth
                                        value={this.integrationStore.program.dateFilter}
                                        onChange={(value) => this.integrationStore.program.handelDateFilterChange(value)}/>
                                    <InputField
                                        label="Date end filter"
                                        type="text"
                                        fullWidth
                                        value={this.integrationStore.program.dateEndFilter}
                                        onChange={(value) => this.integrationStore.program.handelDateEndFilterChange(value)}/>
                                </td>
                            </tr>
                            <tr>
                                <td>{JSON.stringify(this.integrationStore.program.processed)}</td>
                            </tr>
                        </tbody>
                    </table>
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
                        disabled={!this.integrationStore.program.data || this.integrationStore.program.data.length === 0}
                        onClick={this.integrationStore.program.create}>
                        Insert
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    }
}

export default withStyles(styles)(Step0);
