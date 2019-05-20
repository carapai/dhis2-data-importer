import {inject, observer} from "mobx-react";
import React from "react";
import Dropzone from "react-dropzone";
import Icon from "@material-ui/core/Icon";
import {withStyles} from "@material-ui/core";

const styles = theme => ({
    block: {
        display: 'block',
        overflow: 'auto'
    },
    table: {
        // marginBottom:10
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        // margin: `${theme.spacing.unit}px 0`,
        width: 'auto',
        height: 'auto',
        display: 'flex',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});

@inject('IntegrationStore')
@observer
class Upload extends React.Component {
    render() {
        return <section>
            <div className="dropzone">
                <Dropzone
                    accept=".csv, .xls, .xlsx"
                    onDrop={this.integrationStore.dataSet.onDrop}>
                    <p align="center">Drop files here</p>
                    <p align="center">
                        <Icon color="primary"
                              style={{fontSize: 48}}>
                            add_circle
                        </Icon>
                    </p>
                    <p align="center">{this.integrationStore.dataSet.fileName}</p>
                    <p align="center"
                       style={{color: 'red'}}>{this.integrationStore.dataSet.uploadMessage}</p>
                </Dropzone>
            </div>
        </section>
    }
}

export default withStyles(styles)(Upload);
