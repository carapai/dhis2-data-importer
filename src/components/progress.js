import React, {Component} from "react";
import * as PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import MuiDialogContent from "@material-ui/core/DialogContent";
import DialogContentText from '@material-ui/core/DialogContentText';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from "@material-ui/core/CircularProgress";
import {inject, observer} from "mobx-react";


const DialogContent = withStyles(theme => ({
    root: {
        display: 'flex',
        alignItems: 'center'
        // padding: theme.spacing.unit * 2
    },
}))(MuiDialogContent);

@inject('IntegrationStore')
@observer
class Progress extends Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {open, onClose} = this.props;
        return (<Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            disableBackdropClick={false}
            disableEscapeKeyDown={false}
            fullScreen={true}
            fullWidth={true}
            PaperProps={{
                style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center'
                },
            }}
        >
            <DialogContent>
                <CircularProgress variant="indeterminate" size={24}
                                  thickness={4} color="secondary"/>
                <DialogContentText id="alert-dialog-description" style={{color: 'white'}}>
                    &nbsp;&nbsp;{this.integrationStore.currentMessage}
                </DialogContentText>
            </DialogContent>
        </Dialog>)
    }

}

Progress.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Progress;
