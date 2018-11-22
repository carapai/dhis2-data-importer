import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import red from '@material-ui/core/colors/red';
import LinearProgress from "@material-ui/core/LinearProgress";
import Table from "@dhis2/d2-ui-table";


const styles = theme => ({
    icon: {
        margin: theme.spacing.unit * 2,
    },
    iconHover: {
        margin: theme.spacing.unit * 2,
        '&:hover': {
            color: red[800],
        },
    },
});


@inject('IntegrationStore')
@observer
class D1 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
        this.integrationStore.fetchDataSets();
    }

    render() {
        let progress = '';
        if (this.integrationStore.loading) {
            progress = <LinearProgress variant="indeterminate"/>;
        }
        return <div>
            {progress}
            <Table
                columns={['name']}
                rows={this.integrationStore.dataSets}
                contextMenuActions={this.integrationStore.multipleCma}
                primaryAction={this.integrationStore.executeEditIfAllowedAgg}
            />
        </div>
    }

}

export default withStyles(styles)(D1);

